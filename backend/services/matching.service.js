const { withTransaction } = require('../utils/transaction');
const { badRequest, notFound, forbidden } = require('../utils/errors');
const { listMatches, listConversations } = require('../models/match.model');

function createMatchingService({ pool, profileService }) {
  return {
    async swipe(userId, { profileId, direction }) {
      if (userId === profileId) throw badRequest('You cannot like your own profile.');
      const action = direction === 'pass' ? 'dislike' : direction;
      return withTransaction(pool, async (client) => {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`swipes:${userId}`]);
        const target = await client.query(
          `SELECT p.user_id FROM profiles p JOIN users u ON u.id=p.user_id
            WHERE p.user_id=$1 AND p.discoverable=true AND u.deleted_at IS NULL`, [profileId],
        );
        if (!target.rowCount) throw notFound('Profile');
        const blocked = await client.query(
          'SELECT 1 FROM user_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)', [userId,profileId],
        );
        if (blocked.rowCount) throw forbidden();
        const pairKey = [userId,profileId].sort().join(':');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [pairKey]);
        await client.query(
          `INSERT INTO likes (actor_id,target_id,action) VALUES ($1,$2,$3)
           ON CONFLICT (actor_id,target_id) DO UPDATE SET action=EXCLUDED.action,updated_at=now()`,
          [userId,profileId,action],
        );
        if (action !== 'like') return { liked: false, match: null };
        const reverse = await client.query(
          `SELECT 1 FROM likes WHERE actor_id=$1 AND target_id=$2 AND action='like'`, [profileId,userId],
        );
        if (!reverse.rowCount) return { liked: true, match: null };
        const [userLow,userHigh] = [userId,profileId].sort();
        const matchResult = await client.query(
          `INSERT INTO matches (user_low,user_high,status,matched_at,ended_at)
           VALUES ($1,$2,'active',now(),NULL)
           ON CONFLICT (user_low,user_high) DO UPDATE SET status='active',matched_at=now(),ended_at=NULL
           RETURNING id`, [userLow,userHigh],
        );
        const matchId = matchResult.rows[0].id;
        const conversation = await client.query(
          `INSERT INTO conversations (match_id) VALUES ($1)
           ON CONFLICT (match_id) DO UPDATE SET archived_at=NULL RETURNING id`, [matchId],
        );
        return { liked: true, match: { id: matchId, conversationId: conversation.rows[0].id } };
      });
    },

    async undoLatest(userId) {
      return withTransaction(pool, async (client) => {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`swipes:${userId}`]);
        const found = await client.query(
          'SELECT target_id,action FROM likes WHERE actor_id=$1 ORDER BY updated_at DESC,target_id DESC LIMIT 1 FOR UPDATE', [userId],
        );
        const like = found.rows[0];
        if (!like) return { undone: false };
        const pairKey = [userId,like.target_id].sort().join(':');
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [pairKey]);
        await client.query('DELETE FROM likes WHERE actor_id=$1 AND target_id=$2', [userId,like.target_id]);
        const ended = await client.query(
          `UPDATE matches SET status='unmatched',ended_at=now()
            WHERE status='active' AND user_low=LEAST($1::uuid,$2::uuid) AND user_high=GREATEST($1::uuid,$2::uuid) RETURNING id`,
          [userId,like.target_id],
        );
        if (ended.rows.length) await client.query('UPDATE conversations SET archived_at=now() WHERE match_id=$1', [ended.rows[0].id]);
        return { undone: true };
      });
    },

    async matches(userId) {
      const rows = await listMatches(pool,userId);
      return Promise.all(rows.map(async (row) => ({
        id: row.id, conversationId: row.conversationId, name: row.name, age: row.age,
        location: row.location, matchedAt: row.matchedAt,
        photoUrl: row.photoKey ? await profileService.storageSignedUrl(row.photoKey) : null,
      })));
    },

    async receivedLikes(userId) {
      const { rows }=await pool.query(
        `SELECT p.user_id AS id,p.name,p.age,p.location,p.bio,di.label AS intention,l.created_at AS "likedAt",
                ph.storage_key AS "photoKey",
                COALESCE((SELECT jsonb_agg(i.name ORDER BY i.name) FROM user_interests ui JOIN interests i ON i.id=ui.interest_id WHERE ui.user_id=p.user_id),'[]'::jsonb) AS interests
           FROM likes l JOIN profiles p ON p.user_id=l.actor_id JOIN users u ON u.id=p.user_id
           LEFT JOIN dating_intentions di ON di.id=p.intention_id
           LEFT JOIN LATERAL (SELECT storage_key FROM profile_photos WHERE user_id=p.user_id ORDER BY is_primary DESC,sort_order LIMIT 1) ph ON true
          WHERE l.target_id=$1 AND l.action='like' AND p.discoverable=true AND u.deleted_at IS NULL
            AND NOT EXISTS (SELECT 1 FROM matches m WHERE m.status='active' AND ((m.user_low=$1 AND m.user_high=p.user_id) OR (m.user_high=$1 AND m.user_low=p.user_id)))
            AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=p.user_id) OR (b.blocker_id=p.user_id AND b.blocked_id=$1))
          ORDER BY l.created_at DESC`,[userId],
      );
      return Promise.all(rows.map(async(row)=>({
        id:row.id,name:row.name,age:row.age,location:row.location,description:row.bio,intention:row.intention,
        interests:row.interests,likedAt:row.likedAt,photoUrl:row.photoKey?await profileService.storageSignedUrl(row.photoKey):null,
      })));
    },

    async conversations(userId) {
      const rows = await listConversations(pool,userId);
      return Promise.all(rows.map(async (row) => ({
        id: row.id, matchId: row.matchId, userId: row.userId, name: row.name, age: row.age,
        photoUrl: row.photoKey ? await profileService.storageSignedUrl(row.photoKey) : null,
        lastMessage: row.lastMessageText ? { text: row.lastMessageText, createdAt: row.lastMessageAt, sender: row.lastSenderId === userId ? 'me' : 'mate' } : null,
      })));
    },

    async unmatch(userId, matchId) {
      return withTransaction(pool, async (client) => {
        const result = await client.query(
          `UPDATE matches SET status='unmatched',ended_at=now()
            WHERE id=$1 AND status='active' AND (user_low=$2 OR user_high=$2) RETURNING id`, [matchId,userId],
        );
        if (!result.rowCount) throw notFound('Match');
        await client.query('UPDATE conversations SET archived_at=now() WHERE match_id=$1', [matchId]);
        return { unmatched: true };
      });
    },
  };
}

module.exports = { createMatchingService };
