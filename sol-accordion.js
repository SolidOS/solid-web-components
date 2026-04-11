import {loadStyleRules} from './shared/utils.js';

class SolAccordion extends HTMLElement {
  async connectedCallback() {
    const groupName = `sol-accordion-${Math.random().toString(36).slice(2, 9)}`;
    
    const authorDivs = Array.from(this.children).filter(el => el.tagName === 'DIV');
    
    if (!authorDivs.length) {
      this.textContent = 'No accordion panels found';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'sol-accordion-wrapper';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Accordion');

    authorDivs.forEach((srcDiv, i) => {
      const childDivs = Array.from(srcDiv.children).filter(el => el.tagName === 'DIV');
      
      const det = document.createElement('details');
      det.name = groupName;
      if (i === 0) det.open = true;

      const sum = document.createElement('summary');
      sum.setAttribute('role', 'button');
      sum.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      sum.setAttribute('tabindex', '0');
      sum.id = `panel-${i}-summary`;
      
      if (childDivs.length >= 2) {
        sum.textContent = childDivs[0].textContent.trim() || `Panel ${i + 1}`;
        
        const body = document.createElement('div');
        body.className = 'accordion-body';
        body.setAttribute('role', 'region');
        body.setAttribute('aria-labelledby', `panel-${i}-summary`);
        
        for (let j = 1; j < childDivs.length; j++) {
          const contentDiv = document.createElement('div');
          contentDiv.className = 'accordion-content-section';
          const clone = childDivs[j].cloneNode(true);
          while (clone.firstChild) contentDiv.appendChild(clone.firstChild);
          body.appendChild(contentDiv);
        }
        
        det.appendChild(sum);
        det.appendChild(body);
      } else {
        sum.textContent = srcDiv.textContent.trim() || `Panel ${i + 1}`;
        const body = document.createElement('div');
        body.className = 'accordion-body';
        body.textContent = 'No content';
        det.appendChild(sum);
        det.appendChild(body);
      }

      det.addEventListener('toggle', () => {
        sum.setAttribute('aria-expanded', det.open ? 'true' : 'false');
      });

      sum.addEventListener('keypress', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          det.open = !det.open;
        }
      });

      wrapper.appendChild(det);
    });

    this.innerHTML = '';
    this.appendChild(await loadStyleRules('root','sol-accordion'));
    this.appendChild(wrapper);
  }


}

customElements.define('sol-accordion', SolAccordion);
