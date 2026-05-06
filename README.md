# Solid Components

**This is a Work In Progress - More Help Coming Soon!**

This is a single npm package, **`solid-web-components`**, that ships both a set of browser web-components for Solid and a Node.js version of the same components for use in scripts or CLI tools. The same import path resolves to the right build for the runtime — for example, `import { SolQuery } from 'solid-web-components/query'` gives you the web component in a browser/bundler and the Node API in Node. You only pay for what you use.

```
npm install solid-web-components
```

Heavy environment-specific dependencies (`jsdom`, `@comunica/query-sparql`, `@inrupt/solid-client-authn-browser`, `@inrupt/solid-client-authn-node`, `openid-client`, `solid-ui`) are declared as optional peer dependencies — install only the ones you need.

Curent components: 
```
  + = done but not documented
  - = in progress
  x = not applicable

                 web  node 
   sol-login      +    +    login to Solid
   sol-form       +    -    create solid-ui forms
   sol-solidos    +    x    display resources in SolidOS
   sol-modal      +    x    GUI modal
   sol-pod        +    ?    expandable pod folder/file tree
   sol-pod-ops    +    ?    complete file & folder management
   sol-wac        +    ?    manage .acl files
   sol-live-edit  +    x    RDF & other editors with graphic display of graphs
   sol-accordion  +    x    GUI accordion
   sol-rolodex    +    ?    GUI rolodex
```

(c) 2023-2026, Jeff Zucker, may be freely distributed under an MIT or Apache license.
