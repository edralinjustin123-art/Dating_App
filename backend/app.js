const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const crypto=require('node:crypto');
const {createLimiters}=require('./middleware/rateLimit');
const {createAuthenticate}=require('./middleware/authenticate');
const {errorHandler,asyncHandler}=require('./utils/http');
const {AppError}=require('./utils/errors');
const {createAuthController}=require('./controllers/auth.controller');
const {createProfileController}=require('./controllers/profile.controller');
const {createDiscoverController}=require('./controllers/discover.controller');
const {createMatchingController}=require('./controllers/matching.controller');
const {createMessagingController}=require('./controllers/messaging.controller');
const {createPreferencesController}=require('./controllers/preferences.controller');
const {createInterestsController}=require('./controllers/interests.controller');
const {createAuthRouter}=require('./routes/auth.routes');
const {createProfileRouter}=require('./routes/profile.routes');
const {createDiscoverRouter}=require('./routes/discover.routes');
const {createLikesRouter}=require('./routes/likes.routes');
const {createMatchesRouter}=require('./routes/matches.routes');
const {createConversationsRouter}=require('./routes/conversations.routes');
const {createMessagesRouter}=require('./routes/messages.routes');
const {createPreferencesRouter}=require('./routes/preferences.routes');
const {createInterestsRouter}=require('./routes/interests.routes');

function createApp({pool,config,services}){
  const app=express();
  app.disable('x-powered-by');
  app.set('trust proxy',config.TRUST_PROXY);
  const limiters=createLimiters(pool);
  const authenticate=createAuthenticate(pool,config);
  app.use((req,res,next)=>{req.id=crypto.randomUUID();res.setHeader('X-Request-Id',req.id);next();});
  app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
  app.use(cors({
    origin(origin,callback){
      if(!origin||config.corsOrigins.includes(origin))return callback(null,true);
      return callback(new AppError(403,'CORS_ORIGIN_DENIED','This origin is not allowed to access the DateMate API.'));
    },
    methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders:['Authorization','Content-Type','X-Request-Id'],
    exposedHeaders:['X-Request-Id','RateLimit-Limit','RateLimit-Remaining','RateLimit-Reset'],
    maxAge:600,
  }));
  if(config.NODE_ENV==='production')app.use((req,res,next)=>{
    if(!req.secure)return next(new AppError(400,'HTTPS_REQUIRED','Use HTTPS to access DateMate.'));
    return next();
  });
  app.use(express.json({limit:'32kb',strict:true}));
  app.use(express.urlencoded({extended:false,limit:'8kb'}));
  app.get('/health',asyncHandler(async(req,res)=>{
    await pool.query('SELECT 1');
    return res.json({status:'ok',service:'datemate-api'});
  }));
  app.use('/api',limiters.api);

  const authController=createAuthController(services);
  const profileController=createProfileController(services);
  const discoverController=createDiscoverController(services);
  const matchingController=createMatchingController(services);
  const messagingController=createMessagingController(services);
  const preferencesController=createPreferencesController(services);
  const interestsController=createInterestsController({pool});

  app.use('/api/auth',createAuthRouter({controller:authController,authenticate,limiters}));
  app.use('/api/profiles',createProfileRouter({controller:profileController,authenticate}));
  app.use('/api/discover',createDiscoverRouter({controller:discoverController,authenticate}));
  app.use('/api/likes',createLikesRouter({controller:matchingController,authenticate}));
  app.use('/api/matches',createMatchesRouter({controller:matchingController,authenticate}));
  app.use('/api/conversations',createConversationsRouter({controller:messagingController,authenticate}));
  app.use('/api/messages',createMessagesRouter({controller:messagingController,authenticate,limiters}));
  app.use('/api/preferences',createPreferencesRouter({controller:preferencesController,authenticate}));
  app.use('/api/interests',createInterestsRouter({controller:interestsController,authenticate}));

  app.use((req,res,next)=>next(new AppError(404,'NOT_FOUND','The requested API route was not found.')));
  app.use(errorHandler);
  return app;
}

module.exports={createApp};
