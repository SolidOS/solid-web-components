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
  document.addEventListener('sol-command', function (e) {
    var key = e.detail && e.detail.command;
    if (typeof key !== 'string') return;
    if (key.indexOf('#') >= 0) key = key.split('#').pop();
    if (COMMANDS[key]) COMMANDS[key]();
  });
})();
