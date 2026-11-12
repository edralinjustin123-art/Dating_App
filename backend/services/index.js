const {createAuthService}=require('./auth.service');
const {createOAuthService}=require('./oauth.service');
const {createEmailService}=require('./email.service');
const {createStorageService}=require('./storage.service');
const {createProfileService}=require('./profile.service');
const {createDiscoverService}=require('./discover.service');
const {createMatchingService}=require('./matching.service');
const {createMessagingService}=require('./messaging.service');

function createServices({pool,config,io}){
  const emailService=createEmailService(config);
  const storage=createStorageService(config);
  const authService=createAuthService({pool,config,emailService});
  const oauthService=createOAuthService({pool,config});
  const profileService=createProfileService({pool,storage});
  const discoverService=createDiscoverService({pool,profileService,config});
  const matchingService=createMatchingService({pool,profileService});
  const messagingService=createMessagingService({pool,io});
  return {authService,oauthService,profileService,discoverService,matchingService,messagingService,emailService,storage};
}

module.exports={createServices};
