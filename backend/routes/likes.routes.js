const express=require('express');
const {validate}=require('../middleware/validate');
const {like}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createLikesRouter({controller,authenticate}){
  const router=express.Router();
  router.use(authenticate);
  router.get('/',asyncHandler(controller.listLikes));
  router.post('/',validate({body:like}),asyncHandler(controller.swipe));
  router.post('/undo',asyncHandler(controller.undo));
  return router;
}
module.exports={createLikesRouter};
