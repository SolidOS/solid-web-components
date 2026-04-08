// sol-query-help.js

(() => {
  const DBP = 'https://dbpedia.org/data/';
  const TBL = DBP + 'Tim_Berners-Lee.ttl';

  const examples = [
    // 0: All statements in an RDF doc
    `<sol-query endpoint="${TBL}"></sol-query>`,
    // 1: All statements where a specific URI is the subject
    `<sol-query endpoint="${TBL}#Tim_Berners-Lee"></sol-query>`,
    // 2: Mini-query — find all birthPlace values for Tim Berners-Lee
    `<sol-query endpoint="${TBL}" wanted="<http://dbpedia.org/resource/Tim_Berners-Lee> dbo:birthPlace ?"></sol-query>`,
    // 3: Inline SPARQL against DBpedia's SPARQL endpoint
    `<sol-query endpoint="https://dbpedia.org/sparql" sparql="SELECT ?name ?birth WHERE { <http://dbpedia.org/resource/Tim_Berners-Lee> foaf:name ?name ; dbo:birthDate ?birth . FILTER(lang(?name) = 'en') } LIMIT 5"></sol-query>`,
    // 4: SPARQL with variables
    `<sol-query endpoint="https://dbpedia.org/sparql" sparql="SELECT ?s WHERE { ?s ?p ?o } LIMIT {{limit}}" var-limit="5"></sol-query>`,
    // 5: RDFa — query an HTML page for embedded structured data
    `<sol-query 
    endpoint="https://solidproject.org/TR/"
    wanted="#work-item-technical-reports a"
></sol-query>`,
  ];

  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');

  window.loadExample = function(index) {
    const ta = document.getElementById('queryInput');
    if (index >= 0 && index < examples.length) ta.value = examples[index];
  };

  window.closeModal = function() {
    modal.classList.remove('active');
    while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
  };

  function parseSolQueryTag(tagText) {
    const div = document.createElement('div');
    div.innerHTML = tagText.trim();
    return div.querySelector('sol-query');
  }

  function waitForDefinition(timeout = 10000) {
    if (customElements.get('sol-query')) return Promise.resolve();
    return Promise.race([
      customElements.whenDefined('sol-query'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('sol-query not registered')), timeout)),
    ]);
  }

  function attachAndWatch(parsed) {
    while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);

    // Create live element from parsed attributes
    const live = document.createElement('sol-query');
    for (const attr of parsed.attributes) live.setAttribute(attr.name, attr.value);
    live.style.cssText = 'display:block;min-height:200px;width:100%';

    modalBody.appendChild(live);
    modal.classList.add('active');
  }

  window.executeQuery = async function() {
    const raw = document.getElementById('queryInput').value.trim();
    if (!raw) { alert('Please enter a <sol-query> tag.'); return; }

    let parsed = parseSolQueryTag(raw);
    if (!parsed) parsed = parseSolQueryTag(`<sol-query ${raw}></sol-query>`);
    if (!parsed) {
      alert('Could not parse sol-query tag.');
      return;
    }

    try {
      await waitForDefinition();
    } catch (e) {
      while (modalBody.firstChild) modalBody.removeChild(modalBody.firstChild);
      const msg = document.createElement('div');
      msg.style.cssText = 'color:crimson;padding:12px';
      msg.textContent = e.message;
      modalBody.appendChild(msg);
      modal.classList.add('active');
      return;
    }

    attachAndWatch(parsed);
  };

  // Close on backdrop click or Escape
  document.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Populate default example on load
  document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('queryInput');
    if (ta && !ta.value.trim()) ta.value = examples[0];
  });
})();
