function formatarTel(num) {
  num = num.replace(/\D/g,'');
  if (num.length === 11) return `(${num.slice(0,2)}) ${num.slice(2,7)}-${num.slice(7)}`;
  if (num.length === 10) return `(${num.slice(0,2)}) ${num.slice(2,6)}-${num.slice(6)}`;
  return num;
}

function formatarCPF(n)  { return n.length === 11 ? `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}` : n; }
function formatarCNPJ(n) { return n.length === 14 ? `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}` : n; }
function formatarCEP(n)  { return n.length === 8  ? `${n.slice(0,5)}-${n.slice(5)}` : n; }

function extrairTelsBR(str) {
  const tels = [];
  let s = str.replace(/\D/g,'');
  while (s.length >= 10) {
    let tel = null;
    if (s.startsWith('0800') || s.startsWith('0300') || s.startsWith('0500')) {
      tel = { num: s.slice(0,11), tipo:'fixo' };
      s = s.slice(11);
    } else if (s.startsWith('00')) {
      s = s.slice(2);
    } else if (s.length >= 11 && s[2] === '9') {
      const ddd = Number(s.slice(0,2));
      if (isDddValido(ddd)) { tel = { num: s.slice(0,11), tipo:'celular' }; s = s.slice(11); }
      else s = s.slice(1);
    } else if (s.length >= 11 && ['6','7','8'].includes(s[2])) {
      const ddd = Number(s.slice(0,2));
      if (isDddValido(ddd)) { tel = { num: s.slice(0,11), tipo:'celular' }; s = s.slice(11); }
      else s = s.slice(1);
    } else if (s.length >= 10 && ['2','3','4','5'].includes(s[2])) {
      const ddd = Number(s.slice(0,2));
      if (isDddValido(ddd)) { tel = { num: s.slice(0,10), tipo:'fixo' }; s = s.slice(10); }
      else s = s.slice(1);
    } else {
      s = s.slice(1);
    }
    if (tel) tels.push(tel);
  }
  return { tels, sobra: s };
}

function identificarDocNums(sobra, rec) {
  let s = sobra;
  let m = s.match(/^(\d{11})/);
  if (m && !rec.cpf) { rec.cpf = formatarCPF(m[1]); s = s.slice(11); }
  m = s.match(/^(\d{14})/);
  if (m && !rec.cnpj) { rec.cnpj = formatarCNPJ(m[1]); s = s.slice(14); }
  m = s.match(/^(\d{8})/);
  if (m && !rec.cep) { rec.cep = formatarCEP(m[1]); s = s.slice(8); }
  if (s && !rec.docNum) rec.docNum = s;
}

// Palavras-gatilho de endereço: detectam o prefixo (RUA, AV, etc.)
// e absorvem as próximas palavras como valor do campo.
// PRIORIDADE: todos os gatilhos de logradouro/complemento/número vão para 'endereco'.
const ADDR_TRIGGERS = [
  { re: /^(RUA|R\.?)$/i,                  campo: 'endereco' },
  { re: /^(AV\.?|AVENIDA)$/i,             campo: 'endereco' },
  { re: /^(AL\.?|ALAMEDA)$/i,             campo: 'endereco' },
  { re: /^(TRAV\.?|TRAVESSA|TV\.?|TR\.?)$/i, campo: 'endereco' },
  { re: /^(EST\.?|ESTRADA)$/i,            campo: 'endereco' },
  { re: /^(ROD\.?|RODOVIA)$/i,            campo: 'endereco' },
  { re: /^(LOGRADOURO)$/i,                campo: 'endereco' },
  { re: /^(FAZ\.?|FAZENDA)$/i,            campo: 'endereco' },
  { re: /^(LOT\.?|LOTEAMENTO)$/i,         campo: 'endereco' },
  { re: /^(SITIO|SÍTIO)$/i,               campo: 'endereco' },
  { re: /^(QUADRA|QD\.?)$/i,              campo: 'endereco' },
  { re: /^(CONJ\.?|CONJUNTO)$/i,          campo: 'endereco' },
  { re: /^(APTO?\.?|AP\.?)$/i,            campo: 'endereco' },
  { re: /^(BLOCO?|BL\.?)$/i,              campo: 'endereco' },
  { re: /^(N[°ºo]?\.?|NRO\.?|NUMERO)$/i,  campo: 'endereco' },
  // Estes permanecem em colunas próprias por serem classificações distintas:
  { re: /^(BAIRRO|BRO\.?)$/i,             campo: 'bairro' },
  { re: /^(DISTRITO|DIST\.?)$/i,          campo: 'distrito' },
  { re: /^(SETOR)$/i,                     campo: 'setor' },
];

// Regex para detectar palavras-chave de endereço dentro de strings
const ADDR_KEYWORDS_RE = /\b(RUA|R\.|AV|AV\.|AVENIDA|ALAMEDA|AL\.|TRAVESSA|TRAV\.?|TV\.?|TR\.?|ESTRADA|EST\.|RODOVIA|ROD\.|LOGRADOURO|LOTEAMENTO|LOT\.|FAZENDA|FAZ\.|S[IÍ]TIO|QUADRA|QD\.|CONJUNTO|CONJ\.|APTO?\.?|AP\.?|BLOCO?|BL\.?|N[°ºo]\.?|NRO\.?|N[ÚU]MERO)\b/i;

function parseLinha(linha) {
  linha = linha.trim();
  if (!linha) return null;

  const rec = {};
  COLUNAS.forEach(c => { rec[c.key] = c.multi ? [] : ''; });

  // 1) Formato rotulado: CAMPO: valor CAMPO2: valor2 ...
  //    Procura todas as posições "PALAVRA(S):" e valida se a chave é
  //    um sinônimo conhecido. O valor de cada label vai até o início do
  //    próximo label conhecido (ou fim da linha), permitindo valores
  //    com várias palavras.
  {
    const labelRe = /\b([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{0,30})\s*[:=]/g;
    const labels = [];
    let m;
    while ((m = labelRe.exec(linha)) !== null) {
      // Tenta a chave com todas as palavras; se não bater, vai removendo
      // palavras do início (ex: "Joao Silva Nome" → "Silva Nome" → "Nome")
      const palavras = m[1].trim().split(/\s+/);
      let achouCampo = null;
      let inicioPalavra = 0;
      for (let k = 0; k < palavras.length; k++) {
        const tentativa = palavras.slice(k).join(' ');
        const campo = SINONIMOS[normChave(tentativa)];
        if (campo) {
          achouCampo = campo;
          inicioPalavra = k;
          break;
        }
      }
      if (achouCampo) {
        // Recalcula o índice de início real do label dentro da linha
        let labelStart = m.index;
        if (inicioPalavra > 0) {
          // Pula as primeiras `inicioPalavra` palavras consumidas pelo regex
          const consumido = palavras.slice(0, inicioPalavra).join(' ');
          labelStart = m.index + consumido.length;
          // pula espaços
          while (labelStart < linha.length && /\s/.test(linha[labelStart])) labelStart++;
        }
        labels.push({
          campo: achouCampo,
          labelStart,
          valStart: m.index + m[0].length,
        });
      }
    }
    if (labels.length > 0) {
      for (let li = 0; li < labels.length; li++) {
        const cur = labels[li];
        const nxt = labels[li + 1];
        const val = linha.slice(cur.valStart, nxt ? nxt.labelStart : linha.length)
                         .trim()
                         .replace(/\s+/g, ' ');
        if (!val) continue;
        if (Array.isArray(rec[cur.campo])) rec[cur.campo].push(val);
        else rec[cur.campo] = val;
      }
      // Remove tudo a partir do primeiro label conhecido (já consumido)
      linha = linha.slice(0, labels[0].labelStart).trim();
    }
  }

  // 2) UF no final da linha
  if (!rec.uf) {
    const ufMatch = linha.match(/\b([A-Z]{2})\s*$/);
    if (ufMatch && UF_LIST.includes(ufMatch[1])) {
      rec.uf = ufMatch[1];
      linha = linha.slice(0, linha.lastIndexOf(ufMatch[0])).trim();
    }
  }

  // 3) Varre tokens: gatilhos de endereço absorvem palavras seguintes,
  //    números vão pra pilha numérica, demais vão pro nome.
  const partes = linha.split(/\s+/).filter(Boolean);
  const nomeParts = [];
  const numericParts = [];
  let i = 0;
  while (i < partes.length) {
    const p = partes[i];

    if (/^\d+$/.test(p)) {
      numericParts.push(p);
      i++;
      continue;
    }

    const trigger = ADDR_TRIGGERS.find(t => t.re.test(p));
    if (trigger) {
      const partesCampo = [p];
      i++;
      while (i < partes.length) {
        const next = partes[i];
        // Outro gatilho de endereço encerra o segmento atual
        if (ADDR_TRIGGERS.some(t => t.re.test(next))) break;
        // Sequências que parecem CEP/CPF/CNPJ/telefone encerram o endereço.
        // Considera-se a contagem total de dígitos (ignora hífens, parênteses).
        const apenasDig = next.replace(/\D/g, '');
        if (apenasDig.length >= 8) break;
        // Caso contrário (palavra ou número curto = nº da casa), absorve no endereço
        partesCampo.push(next);
        i++;
      }
      const novoValor = partesCampo.join(' ');
      const valorAtual = rec[trigger.campo];
      rec[trigger.campo] = valorAtual ? valorAtual + ' ' + novoValor : novoValor;
      continue;
    }

    if (p.length > 1) nomeParts.push(p);
    i++;
  }

  if (!rec.nome) rec.nome = nomeParts.join(' ');

  // 4) Processa números acumulados
  const numStr = numericParts.join('');
  if (numStr.length >= 10) {
    const { tels, sobra } = extrairTelsBR(numStr);
    for (const t of tels) {
      if (t.tipo === 'celular') rec.celulares.push(formatarTel(t.num));
      else rec.fixos.push(formatarTel(t.num));
    }
    if (sobra.length > 0) identificarDocNums(sobra, rec);
  } else if (numStr.length > 0) {
    identificarDocNums(numStr, rec);
  }

  // 5) Validação / reclassificação: garante que nome não contenha
  //    telefone, CEP nem palavras-chave de endereço.
  validarReclassificar(rec);

  return rec;
}

// Etapa de validação: detecta dados em colunas erradas e reclassifica.
function validarReclassificar(rec) {
  if (!rec.nome) return;
  let nome = rec.nome;

  // 5.1) Telefones que vazaram pro nome (formatos comuns ou 10-11 dígitos seguidos)
  //      Aceita: (DD) 99999-9999 / (DD)9999-9999 / DD 99999-9999 / 11 dígitos puros.
  const telRe = /\(\s*\d{2}\s*\)\s*9?\d{4}[\s.-]?\d{4}|\b\d{10,11}\b/g;
  nome = nome.replace(telRe, (m) => {
    const dig = m.replace(/\D/g, '');
    if (dig.length === 11 && dig[2] === '9' && isDddValido(Number(dig.slice(0, 2)))) {
      rec.celulares.push(formatarTel(dig));
      return ' ';
    }
    if (dig.length === 10 && ['2','3','4','5'].includes(dig[2]) && isDddValido(Number(dig.slice(0, 2)))) {
      rec.fixos.push(formatarTel(dig));
      return ' ';
    }
    return m;
  });

  // 5.2) CEP que vazou pro nome
  if (!rec.cep) {
    const cepM = nome.match(/\b(\d{5})-?(\d{3})\b/);
    if (cepM) {
      rec.cep = `${cepM[1]}-${cepM[2]}`;
      nome = nome.replace(cepM[0], ' ');
    }
  }

  // 5.3) Palavras-chave de endereço dentro do nome → tudo a partir delas vai pro endereço
  const idx = nome.search(ADDR_KEYWORDS_RE);
  if (idx >= 0) {
    const enderecoExtra = nome.slice(idx).trim().replace(/\s+/g, ' ');
    nome = nome.slice(0, idx).trim();
    if (enderecoExtra) {
      rec.endereco = rec.endereco
        ? (rec.endereco + ' ' + enderecoExtra).trim()
        : enderecoExtra;
    }
  }

  // 5.4) Limpa pontuação residual e espaços duplicados
  rec.nome = nome.replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim();
}
