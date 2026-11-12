const express=require('express');
const {asyncHandler}=require('../utils/http');
function createInterestsRouter({controller,authenticate}){
  const router=express.Router();router.use(authenticate);router.get('/',asyncHandler(controller.list));return router;
}
module.exports={createInterestsRouter};
