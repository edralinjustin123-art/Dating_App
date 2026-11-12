const express=require('express');
const {validate}=require('../middleware/validate');
const {discoverQuery}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createDiscoverRouter({controller,authenticate}){
  const router=express.Router();
  router.use(authenticate);
  router.get('/',validate({query:discoverQuery}),asyncHandler(controller.list));
  return router;
}
module.exports={createDiscoverRouter};
