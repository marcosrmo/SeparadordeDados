// Carregamento e parsing de arquivos: CSV, XLS, XLSX, DOC, DOCX, PDF, TXT.
// Bibliotecas externas são carregadas sob demanda via CDN.

const CDN_URLS = {
  xlsx:    'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  mammoth: 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  pdfjs:   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
};

const _scriptCache = {};
function carregarScript(url) {
  if (_scriptCache[url]) return _scriptCache[url];
  _scriptCache[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error('Falha ao carregar ' + url));
    document.head.appendChild(s);
  });
  return _scriptCache[url];
}

function lerArquivoComo(file, modo) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    if (modo === 'array') r.readAsArrayBuffer(file);
    else if (modo === 'binary') r.readAsBinaryString(file);
    else r.readAsText(file, 'UTF-8');
  });
}

// Detecta se a primeira linha provavelmente é cabeçalho (todas células
// curtas, sem números longos, sem caracteres de telefone/CEP).
function pareceCabecalho(row) {
  if (!row || row.length < 2) return false;
  const cels = row.map(c => (c == null ? '' : String(c)).trim()).filter(Boolean);
  if (cels.length < 2) return false;
  return cels.every(c => {
    if (c.length > 40) return false;
    if (/\d{4,}/.test(c)) return false;
    return /[A-Za-zÀ-ÿ]/.test(c);
  });
}

function normalizarCelula(c) {
  return (c == null ? '' : String(c)).trim();
}

// Converte uma matriz (linhas x colunas) numa lista de linhas de texto.
// Se a primeira linha for cabeçalho, gera linhas no formato rotulado
// "Cabeçalho1: Valor1 Cabeçalho2: Valor2 ..." que o parser aproveita melhor.
// Caso contrário, junta as células com espaço.
function matrizParaLinhas(matriz) {
  if (!matriz || !matriz.length) return [];
  const temCabecalho = pareceCabecalho(matriz[0]);
  if (temCabecalho) {
    const headers = matriz[0].map(normalizarCelula);
    return matriz.slice(1).map(row => {
      const partes = [];
      (row || []).forEach((cel, idx) => {
        const v = normalizarCelula(cel);
        const h = headers[idx];
        if (!v) return;
        if (h) partes.push(`${h}: ${v}`);
        else partes.push(v);
      });
      return partes.join(' ');
    }).filter(Boolean);
  }
  return matriz
    .map(row => (row || []).map(normalizarCelula).filter(Boolean).join(' '))
    .filter(Boolean);
}

async function extrairTextoDe(file) {
  const nome = file.name.toLowerCase();
  const ext  = nome.split('.').pop();

  // ── CSV / TXT ────────────────────────────────────────────────────────
  if (ext === 'csv' || ext === 'txt') {
    const texto = await lerArquivoComo(file, 'text');
    if (ext === 'txt') return texto;
    // CSV: usa SheetJS pra lidar com aspas, vírgulas, ponto-e-vírgula etc.
    await carregarScript(CDN_URLS.xlsx);
    const wb = XLSX.read(texto, { type: 'string' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const matriz = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' });
    return matrizParaLinhas(matriz).join('\n');
  }

  // ── XLS / XLSX ───────────────────────────────────────────────────────
  if (ext === 'xls' || ext === 'xlsx') {
    await carregarScript(CDN_URLS.xlsx);
    const buf = await lerArquivoComo(file, 'array');
    const wb  = XLSX.read(buf, { type: 'array' });
    const todasLinhas = [];
    wb.SheetNames.forEach(nomeAba => {
      const matriz = XLSX.utils.sheet_to_json(wb.Sheets[nomeAba], {
        header: 1, blankrows: false, defval: '',
      });
      todasLinhas.push(...matrizParaLinhas(matriz));
    });
    return todasLinhas.join('\n');
  }

  // ── DOCX ─────────────────────────────────────────────────────────────
  if (ext === 'docx') {
    await carregarScript(CDN_URLS.mammoth);
    const buf = await lerArquivoComo(file, 'array');
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }

  // ── DOC (formato binário antigo) ─────────────────────────────────────
  if (ext === 'doc') {
    throw new Error(
      'Arquivos .doc (Word 97-2003) não são suportados no navegador. ' +
      'Salve como .docx, .pdf ou .txt e tente novamente.'
    );
  }

  // ── PDF ──────────────────────────────────────────────────────────────
  if (ext === 'pdf') {
    await carregarScript(CDN_URLS.pdfjs);
    pdfjsLib.GlobalWorkerOptions.workerSrc = CDN_URLS.pdfjsWorker;
    const buf = await lerArquivoComo(file, 'array');
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const linhas = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      // Agrupa itens por linha usando a coordenada Y (transform[5]).
      const porLinha = new Map();
      for (const it of content.items) {
        const y = Math.round(it.transform[5]);
        if (!porLinha.has(y)) porLinha.set(y, []);
        porLinha.get(y).push({ x: it.transform[4], str: it.str });
      }
      const ys = [...porLinha.keys()].sort((a, b) => b - a);
      for (const y of ys) {
        const itens = porLinha.get(y).sort((a, b) => a.x - b.x);
        const linha = itens.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
        if (linha) linhas.push(linha);
      }
    }
    return linhas.join('\n');
  }

  throw new Error('Formato não suportado: .' + ext);
}

async function importarArquivos(files) {
  if (!files || !files.length) return;
  const inputEl = document.getElementById('input');
  const trechos = [];
  let total = 0, erros = 0;

  for (const f of files) {
    try {
      showToast('Lendo ' + f.name + '...');
      const texto = await extrairTextoDe(f);
      if (texto && texto.trim()) {
        trechos.push(texto.trim());
        total += texto.split('\n').filter(l => l.trim()).length;
      }
    } catch (e) {
      console.error(e);
      showToast('Erro: ' + e.message);
      erros++;
    }
  }

  if (trechos.length) {
    const atual = inputEl.value.trim();
    inputEl.value = (atual ? atual + '\n' : '') + trechos.join('\n');
    inputEl.dispatchEvent(new Event('input'));
    if (erros === 0) {
      showToast('Importado: ' + total + ' linha(s) de ' + files.length + ' arquivo(s)');
    }
  }
}
