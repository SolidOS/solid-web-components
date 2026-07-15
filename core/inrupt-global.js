// core/inrupt-global.js — the ONE place the inrupt auth library enters the
// component library.
//
// `@inrupt/solid-client-authn-browser` resolves through the page's import
// map (sol-load or component-interop) to the vendored ESM build, so every
// consumer shares a single instance. <sol-login> takes the Session class
// from here and sol-form takes getDefaultSession — as IMPORTS, not window
// probes (the `window.solidClientAuthn` global this module used to publish
// was removed 2026-07-14; nothing reads it any more).
//
// Tests map this specifier to tests/__mocks__/solid-client-authn-browser.js
// (live bindings — see __setSession there).
import * as inrupt from '@inrupt/solid-client-authn-browser';

export { inrupt };
