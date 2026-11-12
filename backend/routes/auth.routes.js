const express=require('express');
const { z }=require('zod');
const { validate }=require('../middleware/validate');
const schemas=require('../middleware/schemas');
const { asyncHandler }=require('../utils/http');

function createAuthRouter({controller,authenticate,limiters}){
  const router=express.Router();
  const provider=z.object({provider:z.enum(['google','apple'])});
  router.post('/register',limiters.auth,validate({body:schemas.register}),asyncHandler(controller.register));
  router.post('/login',limiters.auth,validate({body:schemas.login}),asyncHandler(controller.login));
  router.post('/refresh',limiters.auth,validate({body:schemas.refresh}),asyncHandler(controller.refresh));
  router.post('/forgot-password',limiters.auth,validate({body:schemas.forgotPassword}),asyncHandler(controller.forgotPassword));
  router.post('/reset-password',limiters.auth,validate({body:schemas.resetPassword}),asyncHandler(controller.resetPassword));
  router.post('/oauth/:provider',limiters.auth,validate({params:provider,body:schemas.oauthStart}),asyncHandler(controller.oauthStart));
  router.post('/oauth/callback',limiters.auth,validate({body:schemas.oauthCallback}),asyncHandler(controller.oauthCallback));
  router.use(authenticate);
  router.get('/session',asyncHandler(controller.session));
  router.post('/logout',asyncHandler(controller.logout));
  return router;
}

module.exports={createAuthRouter};
