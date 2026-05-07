/**
 * <sol-rolodex> — Card-by-card browser web component.
 *
 * Wraps child `<div>` elements into a rolodex-style card viewer with
 * previous/next navigation and keyboard arrow support.
 *
 * @element sol-rolodex
 *
 * @fires sol-select — detail: { value, row, index }
 *
 * @example
 * <sol-rolodex>
 *   <div>Card 1 content</div>
 *   <div>Card 2 content</div>
 * </sol-rolodex>
 */
import { render as renderRolodex } from './views/rolodex.js';
import { define } from '../core/define.js';

/**
 * Card-by-card browser web component.
 *
 * Wraps child `<div>` elements into a rolodex-style card viewer with
 * previous/next navigation and keyboard arrow support.
 *
 * @class SolRolodex
 * @extends HTMLElement
 */
class SolRolodex extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const items = Array.from(this.children).filter(el => el.tagName === 'DIV');
    
    const vars = ['content'];
    const bindings = items.map(div => ({
      content: {
        type: 'html',
        node: div.cloneNode(true)
      }
    }));

    const container = document.createElement('div');
    this.shadowRoot.appendChild(container);

    const originalRenderCellInto = window._renderCellInto;

    const data = { head: { vars }, results: { bindings } };
    
    await renderRolodex(container, data, this);

    const cardEl = container.querySelector('.rolodex-card');
    const counterEl = container.querySelector('.rolodex-counter');
    const prevBtn = container.querySelector('.rolodex-btn[aria-label="Previous record"]');
    const nextBtn = container.querySelector('.rolodex-btn[aria-label="Next record"]');
    const wrapper = container.querySelector('.sol-view-rolodex');
    
    let index = 0;
    
    const show = i => {
      index = ((i % bindings.length) + bindings.length) % bindings.length;
      const node = bindings[index].content.node.cloneNode(true);
      cardEl.innerHTML = '';
      cardEl.appendChild(node);
      counterEl.textContent = `${index + 1} of ${bindings.length}`;
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

define('sol-rolodex', SolRolodex);
