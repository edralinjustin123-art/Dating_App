function createDiscoverController({discoverService}){
  return {list:async(req,res)=>res.json(await discoverService.list(req.auth.userId,req.validated.query))};
}
module.exports={createDiscoverController};
