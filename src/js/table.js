function colunasAtivas(dados) {
  return COLUNAS.filter(col => {
    if (col.multi) return dados.some(d => d[col.key] && d[col.key].length > 0);
    return dados.some(d => d[col.key] && d[col.key] !== '');
  });
}

function expandirHeaders(cols, dados) {
  const headers = [];
  for (const col of cols) {
    if (col.multi) {
      const max = Math.max(...dados.map(d => (d[col.key] || []).length), 1);
      for (let i = 1; i <= max; i++) {
        headers.push({ label: max > 1 ? `${col.label} ${i}` : col.label, key: col.key, idx: i - 1 });
      }
    } else {
      headers.push({ label: col.label, key: col.key, idx: null });
    }
  }
  return headers;
}

function getCelVal(d, h) {
  if (h.idx !== null) return (d[h.key] || [])[h.idx] || '';
  return d[h.key] || '';
}

function tagClass(key) {
  if (['celulares','whatsapp'].includes(key)) return 'tag-cel';
  if (key === 'fixos') return 'tag-fix';
  if (['cpf','cnpj','rg','cnh','ctps','pis','nit','matricula','docNum','passaporte','tituloEleitor'].includes(key)) return 'tag-doc';
  if (key === 'uf') return 'tag-uf';
  if (['emails','site'].includes(key)) return 'tag-email';
  if (['valor','preco','total','subtotal','desconto','frete','juros','salario'].includes(key)) return 'tag-fin';
  return 'tag-gen';
}
