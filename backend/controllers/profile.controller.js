const { badRequest, AppError }=require('../utils/errors');

function imageMimeType(file){
  const buffer=file?.buffer;
  if(!buffer||buffer.length<12) return null;
  if(buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff) return 'image/jpeg';
  if(buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return 'image/png';
  if(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP') return 'image/webp';
  return null;
}

function createProfileController({profileService,authService}){
  return {
    getMine:async(req,res)=>res.json({profile:await profileService.getProfile(req.auth.userId,true)}),
    updateMine:async(req,res)=>res.json({profile:await profileService.save(req.auth.userId,req.validated.body)}),
    getPublic:async(req,res)=>res.json({profile:await profileService.getPublicProfile(req.auth.userId,req.validated.params.id)}),
    deleteMine:async(req,res)=>{
      await profileService.deleteProfile(req.auth.userId);
      await authService.logout(req.auth.sessionId);
      return res.json({deleted:true});
    },
    listPhotos:async(req,res)=>res.json({photos:await profileService.getPhotos(req.auth.userId)}),
    uploadPhoto:async(req,res)=>{
      if(!req.file) throw badRequest('Choose a profile photo to upload.');
      const mimeType=imageMimeType(req.file);
      if(!mimeType) throw new AppError(415,'UNSUPPORTED_IMAGE','Upload a valid JPEG, PNG, or WebP image.');
      const photo=await profileService.addPhoto(req.auth.userId,{buffer:req.file.buffer,mimeType});
      return res.status(201).json(photo);
    },
    deletePhoto:async(req,res)=>res.json(await profileService.deletePhoto(req.auth.userId,req.validated.params.photoId)),
    block:async(req,res)=>res.json(await profileService.block(req.auth.userId,req.validated.params.id)),
    unblock:async(req,res)=>res.json(await profileService.unblock(req.auth.userId,req.validated.params.id)),
  };
}

module.exports={createProfileController,imageMimeType};
