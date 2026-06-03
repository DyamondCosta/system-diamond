const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let vendasCarregadas = [];

async function carregarPneus(){

const { data } =
await clienteSupabase
.from('pneus')
.select('*')
.order('marca');

const select =
document.getElementById(
'pneu_id'
);

if(!select) return;

select.innerHTML =
'<option value="">Selecione o Pneu</option>';

data.forEach(pneu=>{

select.innerHTML +=
`
<option value="${pneu.id}">
${pneu.marca}
${pneu.modelo}
-
Estoque:
${pneu.quantidade}
</option>
`;

});

}

async function salvarVenda(){

const cliente =
document.getElementById(
'cliente'
).value;

const pneu_id =
document.getElementById(
'pneu_id'
).value;

const quantidade =
Number(
document.getElementById(
'quantidade'
).value
);

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

if(!pneu_id){

alert(
'Selecione um pneu'
);

return;

}

const { data: pneu } =
await clienteSupabase
.from('pneus')
.select('*')
.eq('id', pneu_id)
.single();

if(!pneu){

alert(
'Pneu não encontrado'
);

return;

}

if(
quantidade >
Number(pneu.quantidade)
){

alert(
'Estoque insuficiente'
);

return;

}

const novaQuantidade =
Number(pneu.quantidade)
-
quantidade;

const hoje =
new Date()
.toISOString()
.split('T')[0];

const { error } =
await clienteSupabase
.from('vendas')
.insert([
{
cliente,
pneu_id,
quantidade,
valor_total,
forma_pagamento,
status:'FINALIZADA',
observacao,
data_venda:hoje
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
.from('pneus')
.update({
quantidade:novaQuantidade
})
.eq(
'id',
pneu_id
);

await clienteSupabase
.from('caixa')
.insert([
{
tipo:'ENTRADA',
descricao:
`Venda - ${cliente}`,
valor:valor_total,
forma_pagamento
}
]);

alert(
'Venda registrada com sucesso'
);

document.getElementById(
'cliente'
).value='';

document.getElementById(
'quantidade'
).value='';

document.getElementById(
'valor_total'
).value='';

document.getElementById(
'observacao'
).value='';

carregarPneus();
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

div.innerHTML +=

`
<div class="card">

<h3>
${venda.cliente}
</h3>

<p>
Quantidade:
${venda.quantidade || 0}
</p>

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

carregarPneus();
carregarVendas();