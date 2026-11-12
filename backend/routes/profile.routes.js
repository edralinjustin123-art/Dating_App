const express=require('express');
const multer=require('multer');
const {validate}=require('../middleware/validate');
const schemas=require('../middleware/schemas');
const {asyncHandler}=require('../utils/http');

function createProfileRouter({controller,authenticate}){
  const router=express.Router();
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1,fields:0}});
  router.use(authenticate);
  router.get('/me',asyncHandler(controller.getMine));
  router.put('/me',validate({body:schemas.profileUpdate}),asyncHandler(controller.updateMine));
  router.delete('/me',asyncHandler(controller.deleteMine));
  router.get('/me/photos',asyncHandler(controller.listPhotos));
  router.post('/me/photos',upload.single('photo'),asyncHandler(controller.uploadPhoto));
  router.delete('/me/photos/:photoId',validate({params:expressParams(['photoId'])}),asyncHandler(controller.deletePhoto));
  router.post('/:id/block',validate({params:schemas.uuidParams}),asyncHandler(controller.block));
  router.delete('/:id/block',validate({params:schemas.uuidParams}),asyncHandler(controller.unblock));
  router.get('/:id',validate({params:schemas.uuidParams}),asyncHandler(controller.getPublic));
  return router;
}

function expressParams(fields){
  const {z}=require('zod');
  return z.object(Object.fromEntries(fields.map((field)=>[field,z.uuid()])));
}

module.exports={createProfileRouter};
