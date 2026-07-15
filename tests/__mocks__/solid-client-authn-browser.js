// Mock of @inrupt/solid-client-authn-browser for jest (mapped via
// moduleNameMapper). ESM namespace bindings are LIVE, so tests configure
// the Session class through __setSession and consumers importing the
// namespace see the update.
export let Session = null;
export function __setSession(S) { Session = S; }
export let getDefaultSession = () => null;
export function __setGetDefaultSession(fn) { getDefaultSession = fn; }
