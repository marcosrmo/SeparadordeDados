const inputEl = document.getElementById('input');

inputEl.addEventListener('input', () => {
  const n = inputEl.value.split('\n').filter(l => l.trim()).length;
  document.getElementById('charCount').textContent = n + (n === 1 ? ' linha' : ' linhas');
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') processar();
});

const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
document.head.appendChild(script);
