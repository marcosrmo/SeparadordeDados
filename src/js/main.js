const inputEl = document.getElementById('input');

inputEl.addEventListener('input', () => {
  const n = inputEl.value.split('\n').filter(l => l.trim()).length;
  document.getElementById('charCount').textContent = n + (n === 1 ? ' linha' : ' linhas');
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') processar();
});

// Upload de arquivo (CSV, XLS, XLSX, DOC, DOCX, PDF, TXT)
const fileInputEl = document.getElementById('fileInput');
if (fileInputEl) {
  fileInputEl.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    await importarArquivos(files);
    e.target.value = '';
  });
}

// Drag & drop direto na textarea
inputEl.addEventListener('dragover', (e) => { e.preventDefault(); });
inputEl.addEventListener('drop', async (e) => {
  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length) {
    e.preventDefault();
    await importarArquivos(files);
  }
});

const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
document.head.appendChild(script);
