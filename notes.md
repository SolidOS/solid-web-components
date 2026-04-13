# next prompt
* read /home/jeff/solid/solid-web-components/ and analyze the project and create a CLAUDE.md

# small prompts
* dl view should have the name, title, or label as the dt and the type(s) (if there is one) as the first dd followed by other fields
---
* mini-query: ? needs a name eg ?x; literals need quotes
---
* LIMIT appears not to work, comunica should always be first choice for sparql if available

# big prompts
----------------
* list in a separate doc any files, functions, or css that is not used by a component e.g. refers to podz
* list in a separate doc suggestions you have for consolidating and improving the code
----------------

----------------
# reorg
  * look at suggestions, then these :
  * ask if lit elements would help
  * reuse as much js & css as poss; sol-modal to replace code in other components like live editors?
  * move *css.js from utils and shared to styles

# create bundles
  * dist folder should hold a local bundle which bundles everything
    and a remote bundle which bundles only the components and lazy loads everything else

# cleanup
  * rename cm-editor code-mirror-editor
  * rename page.css sol-live-editor.css

# Later
  * fix selector view
  * fix anchorlist view
  * create sol-form component to display solid-ui forms

