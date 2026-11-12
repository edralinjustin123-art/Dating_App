const express=require('express');
const {validate}=require('../middleware/validate');
const {message}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createMessagesRouter({controller,authenticate,limiters}){
  const router=express.Router();
  router.use(authenticate);
  router.post('/',limiters.messages,validate({body:message}),asyncHandler(controller.send));
  return router;
}
module.exports={createMessagesRouter};
