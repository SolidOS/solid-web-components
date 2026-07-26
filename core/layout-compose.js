// layout-compose — build a standalone app's layout.ttl from the App Builder's
// Edit-Layout answers (sidebar arrangement, footer, main-menu location,
// button-bar location, hamburger).
//
// Regions carry landmark xhv:roles (banner / navigation / complementary / main
// / contentinfo). Preset ui:Link content points at html files the builder
// seeds: the header's "site-title" (site-title.html), main's start page
// (start-page.html), the footer (footer.html), and the ☰'s Help (help.html).
// Sidebars are empty labelled drop targets the owner fills on the element step.
//
// The layout names three menu docs via from-rdf: MainMenu (the nav, opens into
// .app-main), MainButtonBar (a horizontal row of shortcut buttons), and
// MainHamburgerMenu (the ☰: Help + the appearance commands). Other layouts may
// name other menus/bars — these are just the ones this configurator composes.

const MENU_MODULE = 'web/sol-menu.js';
const HAMBURGER_MODULE = 'web/sol-dropdown-button.js';

const lit = (s) => `"${String(s)
  .replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;

const attr = (name, value) => `[ schema:name ${lit(name)} ; schema:value ${lit(value)} ]`;

// The main nav's flow: a header / under-header bar runs horizontally, a sidebar
// menu stacks. The builder seeds app-menu.ttl#MainMenu with this orientation.
export function menuOrientationFor(menuLocation) {
  return menuLocation === 'left-sidebar' || menuLocation === 'right-sidebar'
    ? 'Vertical' : 'Horizontal';
}

/**
 * Compose a layout.ttl document from the Edit-Layout answers.
 *
 * @param {object} o
 * @param {'none'|'left'|'right'|'both'} [o.sidebars]  sidebar arrangement
 * @param {boolean} [o.footer]        include a footer region (with footer.html)
 * @param {'header'|'under-header'|'left-sidebar'|'right-sidebar'} [o.menuLocation]
 * @param {'none'|'header'|'left-sidebar'|'right-sidebar'} [o.buttonBar]  button-bar location
 * @param {boolean} [o.hamburger]     include the ☰ dropdown at the header's right
 * @param {string}  [o.title]         the layout's ui:label
 * @param {string}  [o.componentsBase] where the component modules are served from
 * @returns {string} layout.ttl Turtle
 */
export function composeLayoutTurtle({
  sidebars = 'none',
  footer = false,
  menuLocation = 'header',
  buttonBar = 'none',
  hamburger = true,
  title = 'App',
  componentsBase = '/node_modules/sol-components',
} = {}) {
  const web = (file) => `<${componentsBase.replace(/\/+$/, '')}/${file}>`;

  const menuInHeader = menuLocation === 'header';
  const menuUnderHeader = menuLocation === 'under-header';
  const menuInLeft = menuLocation === 'left-sidebar';
  const menuInRight = menuLocation === 'right-sidebar';
  const barInHeader = buttonBar === 'header';
  const barInLeft = buttonBar === 'left-sidebar';
  const barInRight = buttonBar === 'right-sidebar';
  const hasBar = barInHeader || barInLeft || barInRight;
  // A side exists when the arrangement puts one there — or, defensively, when
  // the menu / button bar is placed there (the configurator only offers a
  // sidebar location once the arrangement has it, so this is a safety net).
  const hasLeft = sidebars === 'left' || sidebars === 'both' || menuInLeft || barInLeft;
  const hasRight = sidebars === 'right' || sidebars === 'both' || menuInRight || barInRight;

  const blocks = [];     // region + leaf TTL blocks
  const wrappers = [];   // positioned schema:ListItem lines

  const emitMembers = (parentFrag, childFrags) => {
    if (!childFrags.length) return '';
    const wraps = childFrags.map((c, i) => ({ w: `${parentFrag}-${c}`, c, pos: i + 1 }));
    wraps.forEach((x) => wrappers.push(
      `:${x.w} a schema:ListItem; schema:item :${x.c}; schema:position ${x.pos}.`));
    return ` ;\n  schema:itemListElement ${wraps.map((x) => `:${x.w}`).join(', ')}`;
  };

  const region = (frag, { label, role, orientation, cls, children = [], comment }) => {
    let s = `:${frag} a ui:Layout ;\n  ui:label ${lit(label)} ;\n  xhv:role ${lit(role)}`;
    if (comment) s += ` ;\n  rdfs:comment ${lit(comment)}`;
    if (orientation) s += ` ;\n  ui:orientation ui:${orientation}`;
    if (cls) s += ` ;\n  schema:additionalProperty ${attr('class', cls)}`;
    s += emitMembers(frag, children);
    blocks.push(s + ' .');
  };

  const componentLeaf = (frag, { label, module, params = [], comment }) => {
    let s = `:${frag} a ui:Component ;\n  ui:label ${lit(label)}`;
    if (comment) s += ` ;\n  rdfs:comment ${lit(comment)}`;
    s += ` ;\n  schema:url ${module}`;
    if (params.length) {
      s += ` ;\n  schema:additionalProperty ${params.map(([k, v]) => attr(k, v)).join(' ,\n               ')}`;
    }
    blocks.push(s + ' .');
  };

  const linkLeaf = (frag, { label, url, comment }) => {
    let s = `:${frag} a ui:Link ;\n  ui:label ${lit(label)}`;
    if (comment) s += ` ;\n  rdfs:comment ${lit(comment)}`;
    s += ` ;\n  schema:url <${url}> .`;
    blocks.push(s);
  };

  // ── top-level region order ───────────────────────────────────────────
  const rootChildren = ['Header'];
  if (menuUnderHeader) rootChildren.push('Nav');
  const hasMiddle = hasLeft || hasRight;
  rootChildren.push(hasMiddle ? 'Middle' : 'Main');
  if (footer) rootChildren.push('Footer');

  region('Layout', {
    label: title, role: 'document', orientation: 'Vertical', children: rootChildren,
  });

  // ── header: site-title, then menu / button bar / ☰ as selected ───────
  const headerChildren = ['SiteTitle'];
  if (menuInHeader) headerChildren.push('Menu');
  if (barInHeader) headerChildren.push('ButtonBar');
  if (hamburger) headerChildren.push('Hamburger');
  region('Header', {
    label: 'Header', role: 'banner', orientation: 'Horizontal',
    cls: 'app-banner', children: headerChildren,
  });

  // ── nav bar under the header ─────────────────────────────────────────
  if (menuUnderHeader) {
    region('Nav', {
      label: 'Navigation', role: 'navigation', orientation: 'Horizontal',
      cls: 'app-nav', children: ['Menu'],
    });
  }

  // ── middle row (sidebars + main) or bare main ────────────────────────
  const sidebarKids = (menuHere, barHere) => {
    const k = [];
    if (menuHere) k.push('Menu');
    if (barHere) k.push('ButtonBar');
    return k;
  };
  if (hasMiddle) {
    const middleChildren = [];
    if (hasLeft) middleChildren.push('Left');
    middleChildren.push('Main');
    if (hasRight) middleChildren.push('Right');
    region('Middle', {
      label: 'Middle', role: 'region', orientation: 'Horizontal',
      comment: 'Sidebars and main pane, side by side', children: middleChildren,
    });
    if (hasLeft) region('Left', {
      label: 'Left sidebar', role: 'complementary', cls: 'app-side-left',
      children: sidebarKids(menuInLeft, barInLeft),
    });
    region('Main', {
      label: 'Main', role: 'main', cls: 'app-main',
      comment: 'The main pane the menu opens items into (also a drop target)',
      children: ['StartPage'],
    });
    if (hasRight) region('Right', {
      label: 'Right sidebar', role: 'complementary', cls: 'app-side-right',
      children: sidebarKids(menuInRight, barInRight),
    });
  } else {
    region('Main', {
      label: 'Main', role: 'main', cls: 'app-main',
      comment: 'The main pane the menu opens items into (also a drop target)',
      children: ['StartPage'],
    });
  }

  // ── footer ───────────────────────────────────────────────────────────
  if (footer) {
    region('Footer', {
      label: 'Footer', role: 'contentinfo', orientation: 'Horizontal',
      cls: 'app-footer', children: ['FooterContent'],
    });
  }

  // ── element leaves ───────────────────────────────────────────────────
  // Preset content: site-title (always) and footer (if any) are ui:Links to
  // seeded html; the ☰'s Help link lives in the MainHamburgerMenu doc.
  linkLeaf('SiteTitle', {
    label: 'Site Banner', url: 'site-title.html',
    comment: 'The site title / banner, from the app\'s own site-title.html',
  });
  componentLeaf('Menu', {
    label: 'Tabbed Menu', module: web(MENU_MODULE),
    comment: 'Items open into the main pane named by the region selector',
    params: [['from-rdf', 'app-menu.ttl#MainMenu'], ['region', '.app-main']],
  });
  if (hasBar) componentLeaf('ButtonBar', {
    label: 'Button bar', module: web(MENU_MODULE),
    comment: 'A row of shortcut buttons, opening into the main pane',
    params: [['from-rdf', 'app-menu.ttl#MainButtonBar'], ['class', 'app-bar'],
      ['region', '.app-main']],
  });
  if (hamburger) componentLeaf('Hamburger', {
    label: 'Button Menu', module: web(HAMBURGER_MODULE),
    comment: 'Theme chrome: Help / Theme / Text size from the app\'s hamburger menu',
    params: [['label', '☰'], ['from-rdf', 'app-menu.ttl#MainHamburgerMenu']],
  });
  linkLeaf('StartPage', {
    label: 'Start Page', url: 'start-page.html',
    comment: 'What the main pane shows before a menu item opens into it, from the app\'s own start-page.html',
  });
  if (footer) linkLeaf('FooterContent', {
    label: 'Footer', url: 'footer.html',
    comment: 'The footer, from the app\'s own footer.html',
  });

  const header = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xhv: <http://www.w3.org/1999/xhtml/vocab#> .

# App layout composed by the App Builder — plain Turtle, hand-editable.
# Regenerate index.html after changing it.
`;
  return `${header}\n${blocks.join('\n\n')}\n\n${wrappers.join('\n')}\n`;
}

export default composeLayoutTurtle;
