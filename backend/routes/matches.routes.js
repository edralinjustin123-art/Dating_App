const express=require('express');
const {validate}=require('../middleware/validate');
const {uuidParams}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createMatchesRouter({controller,authenticate}){
  const router=express.Router();
  router.use(authenticate);
  router.get('/',asyncHandler(controller.listMatches));
  router.delete('/:id',validate({params:uuidParams}),asyncHandler(controller.unmatch));
  return router;
}
module.exports={createMatchesRouter};
