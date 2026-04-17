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

function parseLinha(linha) {
  linha = linha.trim();
  if (!linha) return null;

  const rec = {};
  COLUNAS.forEach(c => { rec[c.key] = c.multi ? [] : ''; });

  const rotulado = /\b([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{0,30})\s*[:=]\s*([^\s:][^:]*?)(?=\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{0,30}\s*[:=]|$)/g;
  let matchRot;
  const linhaCopia = linha;
  while ((matchRot = rotulado.exec(linhaCopia)) !== null) {
    const chaveRaw = normChave(matchRot[1]);
    const val = matchRot[2].trim();
    const campo = SINONIMOS[chaveRaw];
    if (campo) {
      if (Array.isArray(rec[campo])) rec[campo].push(val);
      else rec[campo] = val;
      linha = linha.replace(matchRot[0], ' ');
    }
  }

  if (!rec.uf) {
    const ufMatch = linha.match(/\b([A-Z]{2})\s*$/);
    if (ufMatch && UF_LIST.includes(ufMatch[1])) {
      rec.uf = ufMatch[1];
      linha = linha.slice(0, linha.lastIndexOf(ufMatch[0])).trim();
    }
  }

  const partes = linha.split(/\s+/).filter(Boolean);
  const nomeParts = [], numericParts = [];
  for (const p of partes) {
    if (/^\d+$/.test(p)) numericParts.push(p);
    else if (p.length > 1) nomeParts.push(p);
  }

  if (!rec.nome) rec.nome = nomeParts.join(' ');

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

  return rec;
}
