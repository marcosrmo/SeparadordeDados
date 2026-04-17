# Separador de Dados BR

Ferramenta web para extração e separação automática de dados brasileiros a partir de texto bruto.

## O que faz

Cola linhas brutas (listas de leads, planilhas, documentos) e extrai automaticamente:
- Nomes
- Celulares e fixos (com validação de DDD por estado)
- CPF, CNPJ, RG e outros documentos
- UF (estado)
- Emails, endereços e dezenas de outros campos

Exporta os resultados como CSV ou XLSX diretamente no navegador.

## Estrutura do projeto

```
/
├── index.html              # HTML principal
├── server.py               # Servidor HTTP simples (porta 5000)
└── src/
    ├── css/
    │   └── styles.css      # Estilos (tema escuro, variáveis CSS)
    └── js/
        ├── data/
        │   ├── columns.js  # Definição das colunas (COLUNAS)
        │   ├── synonyms.js # Mapeamento de sinônimos + normChave()
        │   └── ddd.js      # Tabela de DDDs, UFs, validação
        ├── parser.js       # Extração de telefones, docs, parseLinha()
        ├── table.js        # Lógica de tabela: colunas ativas, headers, tags
        ├── exporter.js     # Exportação CSV e XLSX
        ├── ui.js           # processar(), limpar(), showToast()
        └── main.js         # Entry point: event listeners, carrega JSZip
```

## Como rodar

O workflow `Start application` executa `python server.py` na porta 5000.

## Tecnologias

- HTML/CSS/JS puro (sem framework)
- Python `http.server` para servir os arquivos estáticos
- JSZip (CDN) para geração de XLSX no browser
- Google Fonts: Syne + JetBrains Mono
