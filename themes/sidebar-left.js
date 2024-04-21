export const sidebarLeftTheme = `
<div class="sol-header">
  <span class="sol-sidebarButton" style="font-weight:900;font-size:43px;cursor:pointer;"
    onclick="this.parentNode.parentNode.querySelector('.sol-main').classList.toggle('hidden')";
  >&equiv;</span>
</div>
<div class="sol-main">
  <div class="sol-sidebar"></div>
  <div class="sol-display"></div>
</div>
<div class="sol-footer"></div>

<style>
/* COLORS  */
.sol-page { background:#111122;}
.sol-display { padding:1rem; padding-top:0.75rem; }
/* POSITIONING */
body { margin:0; }
.sol-page { margin:0; height:100%; display:grid; grid-template-rows: 3rem auto 2rem ; }
.sol-main { display:grid;grid-template-columns:19rem auto; height:calc( 100% - 3rem ); }
.sol-main.hidden { grid-template-columns:auto !important; }
.sol-main.hidden .sol-sidebar { display:none !important; }
.sol-main.hidden .sol-display { padding-left:1rem; }
.sol-sidebarButton { margin-left:1rem; }
.sol-sidebar { padding:0.75rem; }
.sol-display { padding:1rem; padding-left:0; }
.sol-footer { height:100%; padding:0.25rem; }
/* OVERFLOW */
body, .sol-page { overflow:hidden; }
.sol-sidebar, .sol-display { overflow:auto; }
.formFieldName * {
  color: wheat !important;
}
</style>
`;
