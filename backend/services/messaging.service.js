const { withTransaction } = require('../utils/transaction');
const { badRequest, forbidden } = require('../utils/errors');
const { listConversations } = require('../models/match.model');

function encodeCursor(createdAt, id) {
  return Buffer.from(JSON.stringify({ createdAt: new Date(createdAt).toISOString(), id })).toString('base64url');
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (!value.createdAt || !value.id || Number.isNaN(Date.parse(value.createdAt)) || !/^[0-9a-f-]{36}$/i.test(value.id)) throw new Error('invalid');
    return value;
  } catch {
    throw badRequest('Message cursor is invalid.');
  }
}

function createMessagingService({ pool, io }) {
  async function requireConversation(client, conversationId, userId) {
    const { rows } = await client.query(
      `SELECT c.id,c.match_id AS "matchId",m.user_low AS "userLow",m.user_high AS "userHigh",
              CASE WHEN m.user_low=$2 THEN m.user_high ELSE m.user_low END AS "otherUserId"
         FROM conversations c JOIN matches m ON m.id=c.match_id
        WHERE c.id=$1 AND c.archived_at IS NULL AND m.status='active'
          AND (m.user_low=$2 OR m.user_high=$2)
          AND NOT EXISTS (SELECT 1 FROM user_blocks b WHERE (b.blocker_id=$2 AND b.blocked_id=CASE WHEN m.user_low=$2 THEN m.user_high ELSE m.user_low END)
            OR (b.blocker_id=CASE WHEN m.user_low=$2 THEN m.user_high ELSE m.user_low END AND b.blocked_id=$2))
        FOR SHARE OF c,m`, [conversationId,userId],
    );
    if (!rows[0]) throw forbidden();
    return rows[0];
  }

  function shape(row, viewerId) {
    return {
      id: row.id,
      conversationId: row.conversationId,
      sender: row.senderId === viewerId ? 'me' : 'mate',
      text: row.content,
      createdAt: row.createdAt,
      time: new Date(row.createdAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
      readAt: row.readAt,
      status: row.senderId === viewerId ? (row.readAt ? 'read' : 'sent') : 'received',
    };
  }

  async function persistAndSend(conversationId, userId, text) {
    const row = await withTransaction(pool, async (client) => {
      await requireConversation(client,conversationId,userId);
      const result = await client.query(
        `INSERT INTO messages (conversation_id,sender_id,content)
         VALUES ($1,$2,$3)
         RETURNING id,conversation_id AS "conversationId",sender_id AS "senderId",content,created_at AS "createdAt",read_at AS "readAt"`,
        [conversationId,userId,text],
      );
      return result.rows[0];
    });
    const message = shape(row,userId);
    io?.to(`conversation:${conversationId}`).emit('message:new', message);
    return { message };
  }

  return {
    requireAccess: async (conversationId,userId) => requireConversation(pool,conversationId,userId),
    async conversations(userId, profileService) {
      const rows = await listConversations(pool,userId);
      return Promise.all(rows.map(async (row) => ({
        id: row.id, matchId: row.matchId, userId: row.userId, name: row.name, age: row.age,
        photoUrl: row.photoKey ? await profileService.storageSignedUrl(row.photoKey) : null,
        lastMessage: row.lastMessageText ? { text: row.lastMessageText, createdAt: row.lastMessageAt, sender: row.lastSenderId === userId ? 'me' : 'mate' } : null,
      })));
    },
    async list(conversationId,userId,{limit,cursor}) {
      const decoded = decodeCursor(cursor);
      const rows = await withTransaction(pool, async (client) => {
        await requireConversation(client,conversationId,userId);
        await client.query(
          'UPDATE messages SET read_at=now() WHERE conversation_id=$1 AND sender_id<>$2 AND read_at IS NULL', [conversationId,userId],
        );
        const params = [conversationId];
        let cursorSql = '';
        if (decoded) { params.push(decoded.createdAt,decoded.id); cursorSql='AND (created_at,id) < ($2::timestamptz,$3::uuid)'; }
        params.push(limit+1);
        const limitSql = `$${params.length}`;
        const result = await client.query(
          `SELECT id,conversation_id AS "conversationId",sender_id AS "senderId",content,
                  created_at AS "createdAt",read_at AS "readAt"
             FROM messages WHERE conversation_id=$1 ${cursorSql}
            ORDER BY created_at DESC,id DESC LIMIT ${limitSql}`, params,
        );
        return result.rows;
      });
      const hasMore = rows.length > limit;
      const page = rows.slice(0,limit);
      const nextCursor = hasMore ? encodeCursor(page[page.length-1].createdAt,page[page.length-1].id) : null;
      return { messages: page.reverse().map((row)=>shape(row,userId)), nextCursor };
    },
    async send(conversationId,userId,text) {
      if (!text.trim()) throw badRequest('Message text cannot be empty.');
      return persistAndSend(conversationId,userId,text);
    },
    async markRead(conversationId,userId) {
      return withTransaction(pool,async(client)=>{
        await requireConversation(client,conversationId,userId);
        const result=await client.query('UPDATE messages SET read_at=now() WHERE conversation_id=$1 AND sender_id<>$2 AND read_at IS NULL RETURNING id', [conversationId,userId]);
        io?.to(`conversation:${conversationId}`).emit('messages:read',{conversationId,userId,readAt:new Date().toISOString()});
        return {read:result.rowCount};
      });
    },
  };
}

module.exports = { createMessagingService };
