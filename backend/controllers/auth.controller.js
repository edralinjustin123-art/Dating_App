function createAuthController({ authService, oauthService }) {
  return {
    register: async (req,res) => res.status(201).json(await authService.register(req.validated.body)),
    login: async (req,res) => res.json(await authService.login(req.validated.body)),
    logout: async (req,res) => { await authService.logout(req.auth.sessionId); res.json({loggedOut:true}); },
    refresh: async (req,res) => res.json(await authService.refresh(req.validated.body.refreshToken)),
    session: async (req,res) => res.json(await authService.validateSession(req.auth.userId,req.auth.sessionId)),
    forgotPassword: async (req,res) => res.json(await authService.requestPasswordReset(req.validated.body.email)),
    resetPassword: async (req,res) => res.json(await authService.resetPassword(req.validated.body)),
    oauthStart: async (req,res) => res.json(await oauthService.start(req.validated.params.provider,req.validated.body.redirectUri)),
    oauthCallback: async (req,res) => {
      const identity=await oauthService.complete(req.validated.body);
      return res.json(await authService.oauthLogin(identity));
    },
  };
}

module.exports={createAuthController};
