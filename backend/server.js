const http=require('node:http');
const {Server}=require('socket.io');
const {loadEnv}=require('./config/env');
const {createPool}=require('./config/database');
const {createApp}=require('./app');
const {createServices}=require('./services');
const {createLimiters}=require('./middleware/rateLimit');
const {attachSocketHandlers}=require('./services/socket.service');

async function start({pool:providedPool}={}){
  const config=loadEnv();
  const pool=providedPool||createPool(config);
  let io;
  let storage;
  let emailService;
  let server;
  let cleanupTimer;
  try{
    await pool.query('SELECT 1');
    const databaseAddress=new URL(config.DATABASE_URL);
    console.log(`PostgreSQL connected to ${databaseAddress.hostname}:${databaseAddress.port||5432}/${databaseAddress.pathname.slice(1)}.`);
    const migrationTable=await pool.query("SELECT to_regclass('public.schema_migrations') AS table_name");
    if(!migrationTable.rows[0].table_name)throw new Error('Database is not migrated. Run `npm run migrate` before starting the API.');
    io=new Server({
      cors:{origin:config.corsOrigins,methods:['GET','POST'],credentials:false},
      maxHttpBufferSize:64*1024,
      pingTimeout:20_000,
      pingInterval:25_000,
      allowEIO3:false,
    });
    const services=createServices({pool,config,io});
    storage=services.storage;
    emailService=services.emailService;
    const app=createApp({pool,config,services});
    server=http.createServer(app);
    io.attach(server);
    attachSocketHandlers(io,{pool,messagingService:services.messagingService,socketRateStore:createLimiters(pool).socketStore,config});
    server.listen(config.PORT,config.HOST,()=>console.log(`DateMate API listening on ${config.HOST}:${config.PORT}`));

    cleanupTimer=setInterval(async()=>{
      try{
        if(services.storage.isConfigured)await services.storage.processCleanupJobs(pool);
        await pool.query('DELETE FROM oauth_states WHERE expires_at < now()-interval \'1 day\'');
        await pool.query('DELETE FROM password_reset_tokens WHERE expires_at < now()-interval \'7 days\' OR used_at < now()-interval \'7 days\'');
        await pool.query('DELETE FROM api_rate_limits WHERE window_started_at < now()-interval \'1 day\'');
      }catch(error){console.error('Scheduled cleanup failed:',error.message);}
    },60_000);
    cleanupTimer.unref();

    const shutdown=async(signal)=>{
      console.log(`Received ${signal}; stopping DateMate API.`);
      clearInterval(cleanupTimer);
      await new Promise((resolve)=>io.close(resolve));
      await storage.close();
      await emailService.close();
      await pool.end();
      process.exit(0);
    };
    process.once('SIGINT',()=>shutdown('SIGINT'));
    process.once('SIGTERM',()=>shutdown('SIGTERM'));
    return {server,io,pool,services,close:async()=>{
      clearInterval(cleanupTimer);
      await new Promise((resolve)=>io.close(resolve));
      await storage.close();
      await emailService.close();
      await pool.end();
    }};
  }catch(error){
    if(io)await new Promise((resolve)=>io.close(resolve));
    if(storage)await storage.close().catch(()=>{});
    if(emailService)await emailService.close().catch(()=>{});
    await pool.end().catch(()=>{});
    throw error;
  }
}

if(require.main===module){
  start().catch((error)=>{console.error('DateMate API startup failed:',error.message);process.exitCode=1;});
}

module.exports={start};
