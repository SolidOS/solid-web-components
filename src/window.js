  window.sol.showMenuLink = (event,data)=>{
      let element = event.target.closest('ul')
      let display = event.target.closest('.sol-wrapper').querySelector('.sol-display');
      let label = data.label;
      let link  = data.link;
      let linkType = data.linkType || 'component';
      display.innerHTML = `
<sol-${linkType}
  source = "${link}"
></sol-${linkType}
      `;
    }
