const { z } = require('zod');
const { verifyAccessToken } = require('../utils/tokens');
const { id } = require('../middleware/schemas');
const { AppError } = require('../utils/errors');

const socketMessage = z.object({ conversationId: id, text: z.string().trim().min(1).max(4000) });

function attachSocketHandlers(io, { pool, messagingService, socketRateStore, config }) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.accessToken;
      if (typeof token !== 'string') throw new Error('unauthorized');
      const claims = verifyAccessToken(token, config);
      const result = await pool.query(
        `SELECT s.user_id FROM auth_sessions s JOIN users u ON u.id=s.user_id AND u.deleted_at IS NULL
          WHERE s.id=$1 AND s.user_id=$2 AND s.access_jti=$3 AND s.revoked_at IS NULL AND s.expires_at>now()`,
        [claims.sid,claims.sub,claims.jti],
      );
      if (!result.rowCount) throw new Error('unauthorized');
      socket.data.userId=result.rows[0].user_id;
      socket.data.sessionId=claims.sid;
      socket.data.accessToken=token;
      socket.data.tokenExpiresAt=claims.exp*1000;
      return next();
    } catch {
      const error=new Error('Unauthorized');
      error.data={code:'UNAUTHORIZED'};
      return next(error);
    }
  });

  io.on('connection',(socket)=>{
    const userId=socket.data.userId;
    const expiryTimer=setTimeout(()=>socket.disconnect(true),Math.max(0,socket.data.tokenExpiresAt-Date.now()));
    expiryTimer.unref?.();
    socket.use(async(packet,next)=>{
      try{
        const claims=verifyAccessToken(socket.data.accessToken,config);
        const session=await pool.query('SELECT 1 FROM auth_sessions WHERE id=$1 AND user_id=$2 AND access_jti=$3 AND revoked_at IS NULL AND expires_at>now()',[
          claims.sid,userId,claims.jti,
        ]);
        if(!session.rowCount)throw new Error('unauthorized');
        return next();
      }catch{
        socket.disconnect(true);
        const error=new Error('Unauthorized');error.data={code:'UNAUTHORIZED'};
        return next(error);
      }
    });
    socket.on('disconnect',()=>clearTimeout(expiryTimer));
    const sendError=(ack,error)=>{
      const payload={error:{code:error?.code||'REQUEST_ERROR',message:error?.message||'The socket request failed.'}};
      if(typeof ack==='function')ack(payload);
      else socket.emit('conversation:error',payload.error);
    };

    socket.on('conversation:join',async(payload,ack)=>{
      try{
        const conversationId=id.parse(payload?.conversationId);
        await messagingService.requireAccess(conversationId,userId);
        await socket.join(`conversation:${conversationId}`);
        if(typeof ack==='function')ack({joined:true,conversationId});
      }catch(error){sendError(ack,error);}
    });

    socket.on('conversation:leave',async(payload)=>{
      const parsed=id.safeParse(payload?.conversationId);
      if(parsed.success)await socket.leave(`conversation:${parsed.data}`);
    });

    socket.on('message:send',async(payload,ack)=>{
      try{
        const message=socketMessage.parse(payload);
        const allowed=await socketRateStore.consume(userId,30,60_000);
        if(!allowed)throw new AppError(429,'RATE_LIMITED','Too many messages. Please try again shortly.');
        const result=await messagingService.send(message.conversationId,userId,message.text);
        if(typeof ack==='function')ack({message:result.message});
      }catch(error){sendError(ack,error);}
    });

    socket.on('conversation:read',async(payload,ack)=>{
      try{
        const conversationId=id.parse(payload?.conversationId);
        const result=await messagingService.markRead(conversationId,userId);
        if(typeof ack==='function')ack(result);
      }catch(error){sendError(ack,error);}
    });

    socket.on('conversation:typing',async(payload)=>{
      try{
        const conversationId=id.parse(payload?.conversationId);
        await messagingService.requireAccess(conversationId,userId);
        socket.to(`conversation:${conversationId}`).emit('typing',{conversationId,userId,typing:Boolean(payload?.typing)});
      }catch{ /* invalid typing events are ignored */ }
    });

    socket.on('account:logout',async(ack)=>{
      try{
        await pool.query('UPDATE auth_sessions SET revoked_at=now(),refresh_token_hash=NULL WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL',[socket.data.sessionId,userId]);
        if(typeof ack==='function')ack({loggedOut:true});
        socket.disconnect(true);
      }catch(error){sendError(ack,error);}
    });
  });
}

module.exports = { attachSocketHandlers };
