// app-commands — the standard command registry for GENERATED apps
// (layout-generate emits this beside prefs.js in every app's <head>).
//
// A layout theme's ☰ menu carries ui:Command items whose schema:url
// fragments are the registry keys (core/menu-rdf.js commandKeyFromUrl);
// clicking one dispatches `sol-command`. This registry implements the two
// standard appearance commands — an unregistered command stays a no-op, and
// nothing executes code that markup or RDF names (the same allow-list
// pattern as data-kitchen's shell).
//
// State is stored under the sol-components prefs keys (swc-theme /
// swc-font-size) so scripts/prefs.js re-applies it before first paint.
(function () {
  var SIZES = ['16px', '20px', '24px'];
  var COMMANDS = {
    toggleTheme: function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('swc-theme', next); } catch (e) {}
    },
    cycleFontSize: function () {
      var cur = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-size').trim();
      var next = SIZES[(SIZES.indexOf(cur) + 1) % SIZES.length];
      document.documentElement.style.setProperty('--font-size', next);
      try { localStorage.setItem('swc-font-size', next); } catch (e) {}
    },
  };
  // A sidebar's collapse control (emitted by core/layout-generate.js as
  // .app-rail-toggle inside the <aside> it collapses).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.app-rail-toggle');
    if (!btn) return;
    var rail = btn.closest('aside');
    if (!rail) return;
    var collapsed = rail.classList.toggle('app-rail-collapsed');
    var right = rail.className.indexOf('app-side-right') >= 0;
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.textContent = (collapsed === right) ? '‹' : '›';
    var name = (rail.getAttribute('aria-label') || 'sidebar');
    btn.setAttribute('aria-label', (collapsed ? 'Expand ' : 'Collapse ') + name);
  });

  document.addEventListener('sol-command', function (e) {
    var key = e.detail && e.detail.command;
    if (typeof key !== 'string') return;
    if (key.indexOf('#') >= 0) key = key.split('#').pop();
    if (COMMANDS[key]) COMMANDS[key]();
  });
})();
