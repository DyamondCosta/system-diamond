const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let vendasCarregadas = [];

async function salvarVenda() {

const cliente =
document.getElementById(
'cliente'
).value;

const valor_total =
Number(
document.getElementById(
'valor_total'
).value
);

const forma_pagamento =
document.getElementById(
'forma_pagamento'
).value;

const observacao =
document.getElementById(
'observacao'
).value;

const { error } =
await clienteSupabase
.from('vendas')
.insert([
{
cliente,
valor_total,
forma_pagamento,
status: 'FINALIZADA',
observacao
}
]);

if(error){

console.log(error);

alert(
'Erro ao salvar venda'
);

return;

}

await clienteSupabase
.from('caixa')
.insert([
{
tipo:'ENTRADA',
descricao:
`Venda - ${cliente}`,
valor: valor_total,
forma_pagamento
}
]);

alert(
'Venda registrada'
);

document.getElementById(
'cliente'
).value='';

document.getElementById(
'valor_total'
).value='';

document.getElementById(
'observacao'
).value='';

carregarVendas();

}

async function carregarVendas(){

const { data, error } =
await clienteSupabase
.from('vendas')
.select('*')
.order(
'id',
{
ascending:false
}
);

if(error){

console.log(error);
return;

}

vendasCarregadas =
data;

renderizarVendas(
data
);

}

function renderizarVendas(lista){

const div =
document.getElementById(
'lista-vendas'
);

div.innerHTML='';

lista.forEach(venda=>{

div.innerHTML += `

<div class="card">

<h3>
${venda.cliente}
</h3>

<p>
Valor:
R$ ${venda.valor_total}
</p>

<p>
Pagamento:
${venda.forma_pagamento}
</p>

<p>
${venda.status}
</p>

<button
onclick="excluirVenda(${venda.id})">
Excluir
</button>

</div>

`;

});

}

function filtrarVendas(){

const texto =
document
.getElementById(
'pesquisa'
)
.value
.toLowerCase();

const resultado =
vendasCarregadas.filter(
venda =>
(venda.cliente || '')
.toLowerCase()
.includes(texto)
);

renderizarVendas(
resultado
);

}

async function excluirVenda(id){

if(
!confirm(
'Excluir venda?'
)
){
return;
}

const { error } =
await clienteSupabase
.from('vendas')
.delete()
.eq(
'id',
id
);

if(error){

console.log(error);
return;

}

carregarVendas();

}

carregarVendas();