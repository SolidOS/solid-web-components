export const containerTheme = `

<div class="sol-container-header"></div>

<div class="sol-container-main">

  <div class="sol-container-sidebar"></div>

  <div class="sol-container-display"></div>

</div>

<div class="sol-container-sidebarButton" 
    onclick="this.classList.toggle('hidden');this.parentNode.parentNode.querySelector('.sol-container-main').classList.toggle('hidden')";
></div>

<style>
.sol-container .sol-container-sidebarButton {
   color:#eff;
   background:black;
   font-weight:700;
   font-size:23px;
   cursor:pointer;
   position:absolute;
   bottom:0;
   left:0 !important;
   padding:0.5rem;
   padding-right:1rem;
   z-index:2;
   border-radius: 0 3rem 3rem 0;
   margin:0;
}
.sol-container .sol-container-sidebarButton::after { content : "<"; }
.sol-container .sol-container-sidebarButton.hidden::after { content : ">"; }
/* POSITIONING */
.sol-container {
  margin:0; 
  height:100%; 
  display:grid; grid-template-rows: 2rem auto; 
}
.sol-container-main {
  display:grid;
  grid-template-columns:15rem auto; 
  height:calc( 100vh - 7rem ); 
}
.sol-container-main.hidden { grid-template-columns:auto !important; }
.sol-container-main.hidden .sol-container-sidebar { display:none !important; }
.sol-container-main.hidden .sol-container-display { padding-left:1rem; }
.sol-container-sidebarButton { margin-left:1rem; }

.sol-container-header { 
  margin-bottom:0;
}

.sol-container-sidebar { 
  padding:0; 
  padding-right:0.75rem; 
  display:flex;
  flex-direction:columns;
}
.sol-container-display { padding:0 !important; }

/* OVERFLOW */
body, .sol-container-page { overflow:hidden; }
.sol-container-sidebar, .sol-container-display { overflow:auto; }
</style>
`;
