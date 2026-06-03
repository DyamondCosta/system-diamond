const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function carregarDashboard(){

try{

const hoje =
new Date()
.toISOString()
.split('T')[0];

const primeiroDiaMes =
new Date(
new Date().getFullYear(),
new Date().getMonth(),
1
)
.toISOString()
.split('T')[0];

# /*

# VENDAS

*/

const {
data:vendas
} =
await clienteSupabase
.from('vendas')
.select('*');

const vendasHoje =
(vendas || [])
.filter(v => {

if(!v.created_at)
return false;

return v.created_at
.startsWith(hoje);

});

const totalHoje =
vendasHoje.reduce(
(total,v) =>
total +
Number(
v.valor_total || 0
),
0
);

const vendasMes =
(vendas || [])
.filter(v => {

if(!v.created_at)
return false;

return v.created_at >=
primeiroDiaMes;

});

const totalMes =
vendasMes.reduce(
(total,v) =>
total +
Number(
v.valor_total || 0
),
0
);

# /*

# SERVIÇOS

*/

const {
count:servicosTotal
} =
await clienteSupabase
.from('servicos')
.select('*',{
count:'exact',
head:true
});

# /*

# OS

*/

const {
count:osAbertas
} =
await clienteSupabase
.from('ordens_servico')
.select('*',{
count:'exact',
head:true
})
.neq(
'status',
'FINALIZADA'
);

# /*

# ESTOQUE BAIXO

*/

const {
count:estoqueBaixo
} =
await clienteSupabase
.from('pneus')
.select('*',{
count:'exact',
head:true
})
.lte(
'quantidade',
3
);

# /*

# TOTAL PNEUS

*/

const {
data:pneus
} =
await clienteSupabase
.from('pneus')
.select(
'quantidade'
);

const totalPneus =
(pneus || [])
.reduce(
(total,p) =>
total +
Number(
p.quantidade || 0
),
0
);

# /*

# ATUALIZA CAMPOS

*/

const servicosHoje =
document.getElementById(
'servicos-hoje'
);

if(servicosHoje){

servicosHoje.textContent =
servicosTotal || 0;

}

const vendasHojeCampo =
document.getElementById(
'vendas-hoje'
);

if(vendasHojeCampo){

vendasHojeCampo.textContent =
`R$ ${totalHoje.toFixed(2)}`;

}

const faturamentoMes =
document.getElementById(
'faturamento-mes'
);

if(faturamentoMes){

faturamentoMes.textContent =
`R$ ${totalMes.toFixed(2)}`;

}

const osCampo =
document.getElementById(
'os-abertas'
);

if(osCampo){

osCampo.textContent =
osAbertas || 0;

}

const estoqueCampo =
document.getElementById(
'estoque-baixo'
);

if(estoqueCampo){

estoqueCampo.textContent =
estoqueBaixo || 0;

}

const totalPneusCampo =
document.getElementById(
'total-pneus'
);

if(totalPneusCampo){

totalPneusCampo.textContent =
totalPneus || 0;

}

}catch(erro){

console.log(
erro
);

}

}

carregarDashboard();
