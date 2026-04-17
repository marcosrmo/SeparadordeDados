function getExportData() {
  const ativas  = colunasAtivas(dadosFinais);
  const headers = expandirHeaders(ativas, dadosFinais);
  const header  = headers.map(h => h.label);
  const rows    = dadosFinais.map(d => headers.map(h => getCelVal(d, h)));
  return { header, rows };
}

function baixarCSV() {
  if (!dadosFinais.length) return;
  const { header, rows } = getExportData();
  let csv = '\uFEFF' + header.join(';') + '\n';
  for (const row of rows)
    csv += row.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(';') + '\n';
  download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'dados_separados.csv');
  showToast('CSV baixado!');
}

function baixarXLSX() {
  if (!dadosFinais.length) return;
  const { header, rows } = getExportData();
  const escXML = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const allRows = [header, ...rows];
  let sheetXML = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`;
  allRows.forEach((row, ri) => {
    sheetXML += `<row r="${ri + 1}">`;
    row.forEach((cell, ci) => {
      const col = ci < 26
        ? String.fromCharCode(65 + ci)
        : String.fromCharCode(64 + Math.floor(ci / 26)) + String.fromCharCode(65 + (ci % 26));
      sheetXML += `<c r="${col}${ri + 1}" t="inlineStr"><is><t>${escXML(cell || '')}</t></is></c>`;
    });
    sheetXML += `</row>`;
  });
  sheetXML += `</sheetData></worksheet>`;

  const wbXML = `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const relsXML = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
  const pkgRels = `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const ct = `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

  if (typeof JSZip !== 'undefined') {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', ct);
    zip.folder('_rels').file('.rels', pkgRels);
    zip.folder('xl').file('workbook.xml', wbXML);
    zip.folder('xl/_rels').file('workbook.xml.rels', relsXML);
    zip.folder('xl/worksheets').file('sheet1.xml', sheetXML);
    zip.generateAsync({ type: 'blob' }).then(blob => {
      download(blob, 'dados_separados.xlsx');
      showToast('XLSX baixado!');
    });
  } else {
    baixarCSV();
  }
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
