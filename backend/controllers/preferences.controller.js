function createPreferencesController({profileService}){
  return {
    get:async(req,res)=>res.json({preferences:await profileService.getUserPreferences(req.auth.userId)}),
    update:async(req,res)=>res.json({preferences:await profileService.savePreferences(req.auth.userId,req.validated.body)}),
  };
}
module.exports={createPreferencesController};
