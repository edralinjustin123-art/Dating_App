const express=require('express');
const {validate}=require('../middleware/validate');
const {preferencesUpdate}=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');
function createPreferencesRouter({controller,authenticate}){
  const router=express.Router();router.use(authenticate);
  router.get('/',asyncHandler(controller.get));
  router.put('/',validate({body:preferencesUpdate}),asyncHandler(controller.update));
  return router;
}
module.exports={createPreferencesRouter};
