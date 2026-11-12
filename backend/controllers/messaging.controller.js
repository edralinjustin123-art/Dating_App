function createMessagingController({messagingService,profileService}){
  return {
    list:async(req,res)=>res.json(await messagingService.list(req.validated.params.id,req.auth.userId,req.validated.query)),
    listConversations:async(req,res)=>res.json({conversations:await messagingService.conversations(req.auth.userId,profileService)}),
    send:async(req,res)=>res.status(201).json(await messagingService.send(req.validated.body.conversationId,req.auth.userId,req.validated.body.text)),
    markRead:async(req,res)=>res.json(await messagingService.markRead(req.validated.params.id,req.auth.userId)),
  };
}
module.exports={createMessagingController};
