async function listMatches(pool, userId) {
  const { rows } = await pool.query(
    `SELECT m.id,c.id AS "conversationId",other.id AS "userId",p.name,p.age,p.location,
            photo.storage_key AS "photoKey",m.matched_at AS "matchedAt"
       FROM matches m
       JOIN conversations c ON c.match_id=m.id AND c.archived_at IS NULL
       JOIN users other ON other.id=CASE WHEN m.user_low=$1 THEN m.user_high ELSE m.user_low END AND other.deleted_at IS NULL
       JOIN profiles p ON p.user_id=other.id
       LEFT JOIN LATERAL (SELECT storage_key FROM profile_photos WHERE user_id=other.id ORDER BY is_primary DESC,sort_order LIMIT 1) photo ON true
      WHERE m.status='active' AND (m.user_low=$1 OR m.user_high=$1)
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=other.id) OR (b.blocker_id=other.id AND b.blocked_id=$1))
      ORDER BY m.matched_at DESC`, [userId],
  );
  return rows;
}

async function listConversations(pool, userId) {
  const { rows } = await pool.query(
    `SELECT c.id,m.id AS "matchId",other.id AS "userId",p.name,p.age,
            photo.storage_key AS "photoKey",last.content AS "lastMessageText",
            last.created_at AS "lastMessageAt",last.sender_id AS "lastSenderId"
       FROM conversations c JOIN matches m ON m.id=c.match_id AND m.status='active'
       JOIN users other ON other.id=CASE WHEN m.user_low=$1 THEN m.user_high ELSE m.user_low END AND other.deleted_at IS NULL
       JOIN profiles p ON p.user_id=other.id
       LEFT JOIN LATERAL (SELECT storage_key FROM profile_photos WHERE user_id=other.id ORDER BY is_primary DESC,sort_order LIMIT 1) photo ON true
       LEFT JOIN LATERAL (SELECT content,created_at,sender_id FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC,id DESC LIMIT 1) last ON true
      WHERE c.archived_at IS NULL AND (m.user_low=$1 OR m.user_high=$1)
        AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=other.id) OR (b.blocker_id=other.id AND b.blocked_id=$1))
      ORDER BY last.created_at DESC NULLS LAST,c.created_at DESC`, [userId],
  );
  return rows;
}

module.exports = { listMatches, listConversations };
