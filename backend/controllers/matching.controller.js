function createMatchingController({matchingService}){
  return {
    swipe:async(req,res)=>res.json(await matchingService.swipe(req.auth.userId,req.validated.body)),
    undo:async(req,res)=>res.json(await matchingService.undoLatest(req.auth.userId)),
    listLikes:async(req,res)=>res.json({likes:await matchingService.receivedLikes(req.auth.userId)}),
    listMatches:async(req,res)=>res.json({matches:await matchingService.matches(req.auth.userId)}),
    unmatch:async(req,res)=>res.json(await matchingService.unmatch(req.auth.userId,req.validated.params.id)),
    listConversations:async(req,res)=>res.json({conversations:await matchingService.conversations(req.auth.userId)}),
  };
}
module.exports={createMatchingController};
