function extractCodes(text) {
  const sequences = text.match(/\d+/g) || [];
  const seen = new Set();
  const codes = [];
  for (const seq of sequences) {
    for (let i = 0; i + 6 <= seq.length; i += 6) {
      const code = seq.slice(i, i + 6);
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }
  return codes;
}

function renderResults(codes) {
  const resultsSection = document.getElementById('results-section');
  const counter        = document.getElementById('counter');
  const list           = document.getElementById('codes-list');
  const actions        = document.getElementById('actions');

  resultsSection.hidden = false;

  if (codes.length === 0) {
    counter.textContent = 'No se encontraron códigos de 6 dígitos';
    list.innerHTML = '';
    actions.hidden = true;
    return;
  }

  const plural = codes.length !== 1;
  counter.textContent = `${codes.length} código${plural ? 's' : ''} detectado${plural ? 's' : ''}`;

  list.innerHTML = codes.map(code => `
    <li class="code-item" data-code="${code}">
      <label class="code-label">
        <input type="checkbox" class="code-checkbox" checked data-code="${code}">
        <span class="code-number">${code}</span>
        <span class="code-url">nhentai.net/g/${code}</span>
      </label>
      <a href="https://nhentai.net/g/${code}" target="_blank" rel="noopener noreferrer" class="open-single" aria-label="Abrir ${code}">↗</a>
    </li>
  `).join('');

  actions.hidden = false;
  updateOpenButton();
}

function updateOpenButton() {
  const checked = document.querySelectorAll('.code-checkbox:checked');
  const btn     = document.getElementById('btn-open');
  const count   = checked.length;
  const plural  = count !== 1;
  btn.textContent = count > 0
    ? `Abrir ${count} seleccionado${plural ? 's' : ''}`
    : 'Abrir seleccionados';
  btn.disabled = count === 0;
}

function syncItemStyle(checkbox) {
  const item = checkbox.closest('.code-item');
  item.classList.toggle('unchecked', !checkbox.checked);
}

function init() {
  document.getElementById('btn-detect').addEventListener('click', () => {
    const text  = document.getElementById('input-text').value;
    const codes = extractCodes(text);
    renderResults(codes);
  });

  document.getElementById('btn-unselect').addEventListener('click', () => {
    document.querySelectorAll('.code-checkbox').forEach(cb => {
      cb.checked = false;
      syncItemStyle(cb);
    });
    updateOpenButton();
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('input-text').value       = '';
    document.getElementById('results-section').hidden = true;
    document.getElementById('codes-list').innerHTML   = '';
    document.getElementById('actions').hidden         = true;
    document.getElementById('btn-unselect').hidden    = false;
    document.getElementById('btn-open').hidden        = false;
    document.getElementById('btn-clear').style.gridColumn = '';
  });

  document.getElementById('btn-open').addEventListener('click', () => {
    const checked = [...document.querySelectorAll('.code-checkbox:checked')];
    if (checked.length === 0) return;

    const plural = checked.length !== 1;
    document.getElementById('counter').textContent =
      `Tocá cada uno para abrirlo · ${checked.length} código${plural ? 's' : ''}`;

    document.getElementById('codes-list').innerHTML = checked.map(cb => {
      const code = cb.dataset.code;
      return `<li class="tap-item"><a href="https://nhentai.net/g/${code}" target="_blank" rel="noopener noreferrer" class="tap-link"><span class="code-number">${code}</span><span class="tap-label">↗ Abrir</span></a></li>`;
    }).join('');

    document.getElementById('btn-unselect').hidden         = true;
    document.getElementById('btn-open').hidden             = true;
    document.getElementById('btn-clear').style.gridColumn = '1 / -1';
  });

  document.getElementById('codes-list').addEventListener('change', e => {
    if (e.target.classList.contains('code-checkbox')) {
      syncItemStyle(e.target);
      updateOpenButton();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('btn-detect')) return;
  init();
});
