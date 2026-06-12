/**
 * <sol-button-bar-manager> — visual editor for a button BAR: a flat ui:Menu
 * (depth 1, no submenus) whose parts are the bar-resident plugins the user
 * wants (login, search, calendar, …). RDF-wise a bar IS a ui:Menu — where it
 * renders (e.g. a tabset's actions row) is declared by the consuming HTML,
 * never in the RDF.
 *
 *   <sol-button-bar-manager source="./data/tabs.ttl#Bar"></sol-button-bar-manager>
 *
 * Same editing model as <sol-menu-manager> (it IS the menu manager,
 * restricted to one level): name buttons, drag plugins from
 * <sol-plugin-manager> onto them, reorder, save (whole-document rewrite,
 * pantry preserved).
 */

import { define } from '../core/define.js';
import { SolMenuManager } from './sol-menu-manager.js';

class SolButtonBarManager extends SolMenuManager {
  static get flat() { return true; }
  static get title() { return 'Button bar'; }
}

define('sol-button-bar-manager', SolButtonBarManager);
export { SolButtonBarManager };
export default SolButtonBarManager;
