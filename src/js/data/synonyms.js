const SINONIMOS = {
  // Pessoa
  nome:'nome', name:'nome', cliente:'nome', comprador:'nome', proprietario:'nome',
  segurado:'nome', paciente:'nome', funcionario:'nome', colaborador:'nome', pessoa:'nome',
  vendedor:'vendedor', responsavel:'responsavel', titular:'titular',
  socio:'socio', representante:'representante', diretor:'diretor',
  nascimento:'nascimento', dtnasc:'nascimento', datanasc:'nascimento', dtnascimento:'nascimento',
  naturalidade:'naturalidade', nacionalidade:'nacionalidade',
  sexo:'sexo', genero:'sexo', estadocivil:'estadocivil', civilstatus:'estadocivil',
  profissao:'profissao', ocupacao:'profissao', cargo:'cargo', funcao:'cargo',

  // Telefone / Contato
  telefone:'fixos', tel:'fixos', fone:'fixos', phone:'fixos', fixo:'fixos',
  celular:'celulares', cel:'celulares', movel:'celulares', mobile:'celulares',
  telefonecelular:'celulares', telcel:'celulares',
  whatsapp:'whatsapp', wpp:'whatsapp', zap:'whatsapp',
  ramal:'ramal', fax:'fax', contato:'contato',
  email:'emails', mail:'emails', correio:'emails', emails:'emails',
  site:'site', website:'site', url:'site', homepage:'site',

  // Documentos
  cpf:'cpf', cnpj:'cnpj', rg:'rg', cnh:'cnh', ctps:'ctps',
  pis:'pis', pasep:'pis', nit:'nit', matricula:'matricula',
  documento:'docNum', doc:'docNum', identidade:'rg', habilitacao:'cnh',
  passaporte:'passaporte', titulo:'tituloEleitor', tituloeleitor:'tituloEleitor',

  // Empresa
  empresa:'empresa', razaosocial:'razaoSocial', nomefantasia:'nomefantasia',
  fantasia:'nomefantasia', fornecedor:'fornecedor', fabricante:'fabricante',
  transportadora:'transportadora', parceiro:'parceiro',
  ie:'ie', inscricaoestadual:'ie', inscestadual:'ie',
  im:'im', inscricaomunicipal:'im',

  // Data / Hora
  data:'data', date:'data', dt:'data',
  dataemissao:'dataEmissao', emissao:'dataEmissao',
  dataentrega:'dataEntrega',
  entrega:'entrega',
  prazo:'prazo', vencimento:'vencimento', validade:'validade',
  fabricacao:'fabricacao', datafabricacao:'fabricacao', dtfab:'fabricacao',
  hora:'hora', horario:'horario', time:'hora',

  // Endereço
  endereco:'endereco', logradouro:'endereco', address:'endereco',
  rua:'rua', r:'rua',
  avenida:'avenida', av:'avenida',
  alameda:'alameda', al:'alameda',
  travessa:'travessa', tv:'travessa',
  estrada:'estrada', est:'estrada',
  rodovia:'rodovia', rod:'rodovia', br:'rodovia', sp:'rodovia',
  numero:'numero', nro:'numero', nr:'numero', num:'numero',
  complemento:'complemento', apto:'complemento', apt:'complemento', bloco:'complemento',
  bairro:'bairro', vila:'bairro',
  distrito:'distrito', dist:'distrito',
  setor:'setor',
  cidade:'cidade', municipio:'cidade', city:'cidade',
  uf:'uf', estado:'uf', province:'uf',
  cep:'cep', zip:'cep', zipcode:'cep', postal:'cep',
  pais:'pais', country:'pais',

  // Produto / Serviço
  produto:'produto', product:'produto', mercadoria:'produto',
  item:'item',
  servico:'servico', service:'servico',
  bem:'bem', ativo:'ativo', asset:'ativo',
  cor:'cor', color:'cor',
  tamanho:'tamanho', tam:'tamanho', size:'tamanho',
  medida:'medida', dimensao:'medida',
  largura:'largura', larg:'largura', width:'largura',
  altura:'altura', alt:'altura', height:'altura',
  comprimento:'comprimento', comp:'comprimento', length:'comprimento',
  peso:'peso', weight:'peso',
  quantidade:'quantidade', qtd:'quantidade', qt:'quantidade', qtde:'quantidade', qty:'quantidade',
  unidade:'unidade', un:'unidade', unit:'unidade',

  // Financeiro
  valor:'valor', vlr:'valor',
  preco:'preco', price:'preco',
  total:'total',
  subtotal:'subtotal',
  custo:'custo', cost:'custo',
  desconto:'desconto', desc:'desconto', discount:'desconto',
  frete:'frete', shipping:'frete',
  acrescimo:'acrescimo', adicional:'acrescimo',
  juros:'juros', taxa:'juros', interest:'juros',
  multa:'multa', penalidade:'multa',
  salario:'salario', remuneracao:'salario', salaryb:'salario',
  rendimento:'rendimento', renda:'rendimento', receita:'rendimento',

  // Identificadores
  codigo:'codigo', cod:'codigo', code:'codigo',
  id:'id',
  pedido:'pedido',
  ordem:'ordem', order:'ordem',
  protocolo:'protocolo', prot:'protocolo',
  processo:'processo', proc:'processo',
  nota:'notaFiscal', nf:'notaFiscal', notafiscal:'notaFiscal',
  nfe:'nfe',
  serie:'serie', nr_serie:'serie',
  chave:'chave', chaveacesso:'chave', key:'chave',
  contrato:'contrato',
  apolice:'apolice',
  sinistro:'sinistro',

  // Produto — Detalhes
  marca:'marca', brand:'marca',
  modelo:'modelo',
  referencia:'referencia', ref:'referencia',
  sku:'sku',
  categoria:'categoria', cat:'categoria',
  tipo:'tipo', type:'tipo',
  status:'status',
  situacao:'situacao',
  descricao:'descricao', description:'descricao',
  obs:'observacao', observacao:'observacao', observation:'observacao',
  especificacao:'especificacao', spec:'especificacao', especificacoes:'especificacao',
  caracteristica:'caracteristica', caracteristicas:'caracteristica',
  lote:'lote',
  garantia:'garantia',

  // Pagamento
  pagamento:'pagamento', payment:'pagamento',
  forma:'formaPagamento', formapagamento:'formaPagamento',
  parcelas:'parcelas', parcela:'parcelas',
  banco:'banco', bank:'banco',
  agencia:'agencia', ag:'agencia',
  conta:'conta', cc:'conta',
  pix:'pix',
  boleto:'boleto',
  cartao:'cartao', card:'cartao',
};

function normChave(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]/g,'');
}
