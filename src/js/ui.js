const PREVIEW_LIMIT = 100;
let dadosFinais = [];

function processar() {
  const inputEl = document.getElementById('input');
  const linhas = inputEl.value.split('\n').filter(l => l.trim());
  if (!linhas.length) { showToast('Cole pelo menos uma linha!'); return; }

  dadosFinais = linhas.map(parseLinha).filter(Boolean);

  const totalCel = dadosFinais.reduce((a, d) => a + d.celulares.length, 0);
  const totalFix = dadosFinais.reduce((a, d) => a + d.fixos.length, 0);
  const totalUF  = dadosFinais.filter(d => d.uf).length;

  document.getElementById('sLinhas').textContent    = dadosFinais.length;
  document.getElementById('sCelulares').textContent = totalCel;
  document.getElementById('sFixos').textContent     = totalFix;
  document.getElementById('sUFs').textContent       = totalUF;
  document.getElementById('statsBar').classList.add('visible');
  document.getElementById('legend').classList.add('visible');

  const ativas  = colunasAtivas(dadosFinais);
  const headers = expandirHeaders(ativas, dadosFinais);

  const previewDados = dadosFinais.slice(0, PREVIEW_LIMIT);
  const restante = dadosFinais.length - previewDados.length;

  const th = `<th>#</th>` + headers.map(h => `<th>${h.label}</th>`).join('');

  const rows = previewDados.map((d, i) => {
    const cells = headers.map(h => {
      const val = getCelVal(d, h);
      const cls = tagClass(h.key);
      return `<td>${val ? `<span class="tag ${cls}">${val}</span>` : '<span class="tag-empty">—</span>'}</td>`;
    }).join('');
    return `<tr><td class="td-num">${i + 1}</td>${cells}</tr>`;
  }).join('');

  const aviso = restante > 0
    ? `<div class="preview-notice">👁️ Exibindo <strong>${previewDados.length}</strong> de <strong>${dadosFinais.length}</strong> registros — baixe o arquivo para ver todos.</div>`
    : '';

  document.getElementById('resultArea').innerHTML = `
    <div class="section-label" style="margin-top:8px">Resultado — ${dadosFinais.length} registros · ${ativas.length} campos detectados</div>
    ${aviso}
    <div class="table-wrap" id="tableWrap">
      <table>
        <thead><tr>${th}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  setTimeout(() => document.getElementById('tableWrap').classList.add('visible'), 50);
  document.getElementById('btnCSV').style.display  = 'inline-flex';
  document.getElementById('btnXLSX').style.display = 'inline-flex';
  showToast(`${dadosFinais.length} registros · ${ativas.length} colunas`);
}

function limpar() {
  const inputEl = document.getElementById('input');
  inputEl.value = '';
  dadosFinais = [];
  document.getElementById('charCount').textContent = '0 linhas';
  document.getElementById('resultArea').innerHTML  = '';
  document.getElementById('statsBar').classList.remove('visible');
  document.getElementById('legend').classList.remove('visible');
  document.getElementById('btnCSV').style.display  = 'none';
  document.getElementById('btnXLSX').style.display = 'none';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
