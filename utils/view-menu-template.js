export const menuCSS = `
<style>
.sol-dropdown-menu {
  position:absolute;
  //  top:0;
  border-radius:0.3rem;
}
.sol-dropdown {
  padding:2rem !important;
}

.sol-dropdown-menu *, 
.sol-dropdown-menu *:before, 
.sol-dropdown-menu *:after {
  font-family:Sans-Serif;
  box-sizing: inherit;
} 
.sol-dropdown-menu ul {
  padding: 0;
  margin: 0;
  list-style: none;
  position: relative;
  display:inline-block;
//  height:fit-content;
  width:fit-content;
}
.sol-dropdown-menu ul li {
  display:inline-block;
  z-index:10001;
}
.sol-dropdown-menu ul ul {
  display: none;
  position: absolute; 
  top: 60px; 
  top: 40px; 
}
.sol-dropdown-menu .main, h2 {
  text-align:left;
}
.sol-dropdown-menu h2 {
  font-size:1.4rem;
  padding-left:1rem;
}
.sol-dropdown-menu .leftColumn {
  padding-left:1rem;
}
.sol-dropdown-menu button {
//  background:"transparent";
}
.sol-dropdown-menu button.selected, button:hover {
}
.sol-dropdown-menu li > span:after { content:  "\u25BC"; font-size:0.85em;}
.sol-dropdown-menu li > span:only-child:after { content: ''; }

.sol-dropdown-menu li > span {
  margin-right:0.5rem;
  margin-left:0.5rem;
}
/* COLORS 
*/
.sol-dropdown-menu {
  padding:0.5rem;
  background:#99bbbb;
  color:#113333;
  border-radius:0.3rem;
}
.sol-dropdown-menu ul li:hover > ul {
  display:block;
}
.sol-dropdown-menu ul li:hover {
//  background-color:#113333;
//  color:#ddffff;
  background-color:#c0c0c0;
  color:black;
}
.sol-dropdown-menu ul ul li {
  border: 1px solid white;
//  background:#99bbbb;
//  color:#113333;
  background-color:#c0c0c0;
  color:black;
}
.sol-dropdown-menu ul ul li {
//  width:230px !important;
  width:280px !important;
  float:none;
//  display:list-item;
  display:block !important;
  position: relative;
  text-align:left;
  z-index:10001;
}
.sol-dropdown-menu ul ul ul li {
  position: relative;
  top:-60px; 
  top:-40px; 
  left:230px;
  z-index:10001;
}
.sol-dropdown-menu  span { 
  display:inline-block;
  //width:100%; 
}
</style>
`
