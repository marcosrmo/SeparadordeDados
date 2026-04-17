const DDD_UF = {
  68:'AC', 82:'AL', 96:'AP', 92:'AM', 97:'AM',
  71:'BA', 73:'BA', 74:'BA', 75:'BA', 77:'BA',
  85:'CE', 88:'CE', 61:'DF', 27:'ES', 28:'ES',
  62:'GO', 64:'GO', 98:'MA', 99:'MA',
  65:'MT', 66:'MT', 67:'MS',
  31:'MG', 32:'MG', 33:'MG', 34:'MG', 35:'MG', 37:'MG', 38:'MG',
  91:'PA', 93:'PA', 94:'PA', 83:'PB',
  41:'PR', 42:'PR', 43:'PR', 44:'PR', 45:'PR', 46:'PR',
  81:'PE', 87:'PE', 86:'PI', 89:'PI',
  21:'RJ', 22:'RJ', 24:'RJ', 84:'RN',
  51:'RS', 53:'RS', 54:'RS', 55:'RS',
  69:'RO', 95:'RR', 47:'SC', 48:'SC', 49:'SC',
  11:'SP', 12:'SP', 13:'SP', 14:'SP', 15:'SP',
  16:'SP', 17:'SP', 18:'SP', 19:'SP',
  79:'SE', 63:'TO',
};

const VALID_DDD = new Set(Object.keys(DDD_UF).map(Number));

const UF_LIST = [...new Set(Object.values(DDD_UF))].sort();
['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
 'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
  .forEach(u => UF_LIST.includes(u) || UF_LIST.push(u));

function isDddValido(ddd) { return VALID_DDD.has(Number(ddd)); }
