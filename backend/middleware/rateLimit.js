const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

class PostgresRateLimitStore {
  constructor(pool, prefix) { this.pool = pool; this.prefix = prefix; this.windowMs = 60_000; }
  init(options) { this.windowMs = options.windowMs; }
  async increment(key) {
    const storeKey = `${this.prefix}:${key}`.slice(0,255);
    const { rows } = await this.pool.query(
      `INSERT INTO api_rate_limits (key,window_started_at,hits) VALUES ($1,now(),1)
       ON CONFLICT (key) DO UPDATE SET
         hits=CASE WHEN api_rate_limits.window_started_at <= now()-($2*interval '1 millisecond') THEN 1 ELSE api_rate_limits.hits+1 END,
         window_started_at=CASE WHEN api_rate_limits.window_started_at <= now()-($2*interval '1 millisecond') THEN now() ELSE api_rate_limits.window_started_at END
       RETURNING hits,window_started_at AS "windowStartedAt"`,
      [storeKey,this.windowMs],
    );
    const row=rows[0];
    return { totalHits:row.hits, resetTime:new Date(new Date(row.windowStartedAt).getTime()+this.windowMs) };
  }
  async decrement(key) {
    await this.pool.query('UPDATE api_rate_limits SET hits=GREATEST(0,hits-1) WHERE key=$1',[`${this.prefix}:${key}`.slice(0,255)]);
  }
  async resetKey(key) {
    await this.pool.query('DELETE FROM api_rate_limits WHERE key=$1',[`${this.prefix}:${key}`.slice(0,255)]);
  }
  async shutdown() { /* pool lifetime is owned by the server */ }
  async consume(key, limit, windowMs) {
    const storeKey=`${this.prefix}:${key}`.slice(0,255);
    const { rows }=await this.pool.query(
      `INSERT INTO api_rate_limits (key,window_started_at,hits) VALUES ($1,now(),1)
       ON CONFLICT (key) DO UPDATE SET
         hits=CASE WHEN api_rate_limits.window_started_at <= now()-($2*interval '1 millisecond') THEN 1 ELSE api_rate_limits.hits+1 END,
         window_started_at=CASE WHEN api_rate_limits.window_started_at <= now()-($2*interval '1 millisecond') THEN now() ELSE api_rate_limits.window_started_at END
       RETURNING hits`,[storeKey,windowMs],
    );
    return rows[0].hits<=limit;
  }
}

function createLimiters(pool) {
  const make=(prefix,windowMs,limit,keyGenerator)=>rateLimit({
    windowMs,limit,standardHeaders:'draft-8',legacyHeaders:false,
    store:new PostgresRateLimitStore(pool,prefix),
    keyGenerator:keyGenerator||((req)=>ipKeyGenerator(req.ip||'unknown')),
    handler:(req,res)=>res.status(429).json({error:{code:'RATE_LIMITED',message:'Too many requests. Please try again later.',requestId:req.id}}),
  });
  return {
    api:make('api',60_000,120),
    auth:make('auth',15*60_000,20),
    messages:make('messages',60_000,30,(req)=>req.auth?.userId||ipKeyGenerator(req.ip||'unknown')),
    socketStore:new PostgresRateLimitStore(pool,'socket'),
  };
}

module.exports={PostgresRateLimitStore,createLimiters};
