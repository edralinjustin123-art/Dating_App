export function readOAuthCode(callbackUrl, redirectUri) {
  const callback = new URL(callbackUrl);
  const expected = new URL(redirectUri);
  if (
    callback.protocol !== expected.protocol ||
    callback.host !== expected.host ||
    callback.pathname !== expected.pathname
  )
    throw new Error('The sign-in response returned to an unexpected address.');
  if (callback.searchParams.has('error')) {
    throw new Error(
      callback.searchParams.get('error') === 'access_denied'
        ? 'Sign-in was cancelled. You can try again.'
        : 'The provider could not complete sign-in. Please try again.',
    );
  }
  const codes = callback.searchParams.getAll('code');
  if (codes.length !== 1 || !codes[0]) {
    throw new Error('No valid sign-in code was received. Please try signing in again.');
  }
  return codes[0];
}

// Native browser and router callbacks share one exchange for a single-use code.
export function createCodeExchanger(auth) {
  let lastCode;
  let lastExchange;
  return (code) => {
    if (code === lastCode) return lastExchange;
    lastCode = code;
    lastExchange = (async () => {
      const { data, error } = await auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (!data.session?.user)
        throw new Error('Sign-in did not create a session. Please try again.');
      return data.session;
    })();
    return lastExchange;
  };
}
