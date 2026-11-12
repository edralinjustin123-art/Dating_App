const express=require('express');
const {validate}=require('../middleware/validate');
const {uuidParams,messagePage}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createConversationsRouter({controller,authenticate}){
  const router=express.Router();
  router.use(authenticate);
  router.get('/',asyncHandler(controller.listConversations));
  router.get('/:id/messages',validate({params:uuidParams,query:messagePage}),asyncHandler(controller.list));
  router.post('/:id/read',validate({params:uuidParams}),asyncHandler(controller.markRead));
  return router;
}
module.exports={createConversationsRouter};
