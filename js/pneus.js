const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function salvarPneu() {

const marca =
document.getElementById(
'marca'
).value;

const modelo =
document.getElementById(
'modelo'
).value;

const medida =
document.getElementById(
'medida'
).value;

const tipo =
document.getElementById(
'tipo'
).value;

const preco_compra =
Number(
document.getElementById(
'preco_compra'
).value
);

const preco_venda =
Number(
document.getElementById(
'preco_venda'
).value
);

const quantidade =
Number(
document.getElementById(
'quantidade'
).value
);

const { error } =
await clienteSupabase
.from('pneus')
.insert([
{
marca,
modelo,
medida,
tipo,
preco_compra,
preco_venda,
quantidade
}
]);

if(error){

console.log(error);

alert(
'Erro ao salvar pneu'
);

return;

}

alert(
'Pneu salvo com sucesso'
);

document.getElementById(
'marca'
).value = '';

document.getElementById(
'modelo'
).value = '';

document.getElementById(
'medida'
).value = '';

document.getElementById(
'tipo'
).value = '';

document.getElementById(
'preco_compra'
).value = '';

document.getElementById(
'preco_venda'
).value = '';

document.getElementById(
'quantidade'
).value = '';

carregarPneus();

}

async function carregarPneus(){

const { data, error } =
await clienteSupabase
.from('pneus')
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

const lista =
document.getElementById(
'lista-pneus'
);

lista.innerHTML='';

data.forEach(pneu=>{

const estoqueBaixo =
Number(
pneu.quantidade
) <= 3;

lista.innerHTML += `

<div class="card">

<h3>

${pneu.marca}
${pneu.modelo}

</h3>

<p>

📏 ${pneu.medida}

</p>

<p>

🏷️ ${pneu.tipo}

</p>

<p>

💰 Compra:
R$ ${pneu.preco_compra}

</p>

<p>

💵 Venda:
R$ ${pneu.preco_venda}

</p>

<p>

📦 Estoque:
${pneu.quantidade}

</p>

<p style="
color:
${estoqueBaixo ? 'red' : 'green'};
font-weight:bold;
">

${estoqueBaixo
? '⚠ ESTOQUE BAIXO'
: '✔ ESTOQUE OK'}

</p>

<button
onclick="excluirPneu(${pneu.id})"

>

Excluir

</button>

</div>

`;

});

}

async function excluirPneu(id){

const confirmar =
confirm(
'Deseja excluir este pneu?'
);

if(!confirmar){

return;

}

const { error } =
await clienteSupabase
.from('pneus')
.delete()
.eq(
'id',
id
);

if(error){

console.log(error);

alert(
'Erro ao excluir'
);

return;

}

alert(
'Pneu excluído'
);

carregarPneus();

}

carregarPneus();
