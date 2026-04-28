# Separador de Dados BR

Ferramenta web para extração e separação automática de dados brasileiros a partir de texto bruto.

## O que faz

Aceita texto colado **ou** upload de arquivos (`.csv`, `.xls`, `.xlsx`,
`.docx`, `.pdf`, `.txt`) e extrai automaticamente:
- Nomes
- Celulares e fixos (com validação de DDD por estado)
- CPF, CNPJ, RG e outros documentos
- UF (estado)
- Emails, endereços e dezenas de outros campos

### Upload de arquivos

Botão **"Importar arquivo"** na barra do input. Suporta:
- `.csv` e `.txt` — leitura direta (CSV via SheetJS para tratar aspas/separadores)
- `.xls` / `.xlsx` — todas as abas, via SheetJS (carregado da CDN sob demanda)
- `.docx` — via Mammoth.js (CDN sob demanda)
- `.pdf` — via PDF.js (CDN sob demanda); mantém ordem por linha (Y/X)
- `.doc` (Word 97-2003 binário): mensagem orientando converter para .docx/.pdf

Quando o arquivo for planilha **com cabeçalho** (primeira linha = títulos
curtos sem números), o loader gera linhas no formato rotulado
(`Nome: ... Telefone: ... Endereço: ...`), que o parser aproveita melhor
para preservar valores com várias palavras (ex: "Joao da Silva", "Rio de
Janeiro").

Drag & drop direto no `<textarea>` também é suportado.

### Regras de classificação de endereço

Todos os elementos de logradouro (rua, av., alameda, travessa, estrada, rodovia,
número, complemento, apto, bloco, quadra, etc.) são consolidados numa única
coluna **Endereço**. Bairro, Cidade, UF e CEP permanecem em colunas próprias.

Após a extração inicial, há uma etapa de validação (`validarReclassificar`) que:
- Move telefones (10–11 dígitos com DDD válido) que vazaram para o nome
- Move CEPs encontrados no nome para a coluna correta
- Move trechos com palavras-chave de endereço (RUA, AV, etc.) que vazaram
  para o nome de volta para a coluna Endereço

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
