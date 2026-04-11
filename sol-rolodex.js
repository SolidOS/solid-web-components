import { render as renderRolodex } from './views/rolodex.js';

class SolRolodex extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const items = Array.from(this.children).filter(el => el.tagName === 'DIV');
    
    const vars = ['content'];
    const results = items.map(div => ({
      content: {
        type: 'html',
        node: div.cloneNode(true)
      }
    }));

    const container = document.createElement('div');
    this.shadowRoot.appendChild(container);

    const originalRenderCellInto = window._renderCellInto;
    
    const data = { vars, results };
    
    await renderRolodex(container, data, this);

    const cardEl = container.querySelector('.rolodex-card');
    const counterEl = container.querySelector('.rolodex-counter');
    const prevBtn = container.querySelector('.rolodex-btn[aria-label="Previous record"]');
    const nextBtn = container.querySelector('.rolodex-btn[aria-label="Next record"]');
    const wrapper = container.querySelector('.sol-view-rolodex');
    
    let index = 0;
    
    const show = i => {
      index = ((i % results.length) + results.length) % results.length;
      const node = results[index].content.node.cloneNode(true);
      cardEl.innerHTML = '';
      cardEl.appendChild(node);
      counterEl.textContent = `${index + 1} of ${results.length}`;
    };

    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    
    const newPrev = container.querySelector('.rolodex-btn[aria-label="Previous record"]');
    const newNext = container.querySelector('.rolodex-btn[aria-label="Next record"]');
    
    newPrev.addEventListener('click', () => show(index - 1));
    newNext.addEventListener('click', () => show(index + 1));
    
    const newWrapper = container.querySelector('.sol-view-rolodex');
    newWrapper.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        show(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        show(index + 1);
      }
    });

    show(0);
  }
}

customElements.define('sol-rolodex', SolRolodex);
