const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let movimentos = [];

async function salvarMovimento(){

const tipo =
document.getElementById(
'tipo'
).value;

const descricao =
document.getElementById(
'descricao'
).value;

const valor =
Number(
document.getElementById(
'valor'
).value
);

const forma_pagamento =
document.getElementById(
'forma_pagamento'
).value;

const { error } =
await clienteSupabase
.from('caixa')
.insert([
{
tipo,
descricao,
valor,
forma_pagamento
}
]);

if(error){

console.log(error);

alert(
'Erro ao salvar'
);

return;

}

alert(
'Movimento registrado'
);

document.getElementById(
'descricao'
).value='';

document.getElementById(
'valor'
).value='';

carregarCaixa();

}

async function carregarCaixa(){

const { data, error } =
await clienteSupabase
.from('caixa')
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

movimentos =
data;

renderizarResumo();

renderizarMovimentos(
data
);

}

function renderizarResumo(){

let entradas = 0;
let saidas = 0;

movimentos.forEach(item=>{

if(
item.tipo ===
'ENTRADA'
){

entradas +=
Number(item.valor);

}

if(
item.tipo ===
'SAIDA'
){

saidas +=
Number(item.valor);

}

});

const saldo =
entradas - saidas;

document.getElementById(
'resumo-caixa'
).innerHTML =

`
<div class="card">

<p>
Entradas:
R$ ${entradas}
</p>

<p>
Saídas:
R$ ${saidas}
</p>

<p>
Saldo:
R$ ${saldo}
</p>

</div>
`;

}

function renderizarMovimentos(lista){

const div =
document.getElementById(
'lista-caixa'
);

div.innerHTML='';

lista.forEach(item=>{

div.innerHTML +=

`
<div class="card">

<h3>
${item.tipo}
</h3>

<p>
${item.descricao}
</p>

<p>
R$ ${item.valor}
</p>

<p>
${item.forma_pagamento}
</p>

<button
onclick="excluirMovimento(${item.id})">
Excluir
</button>

</div>
`;

});

}

async function excluirMovimento(id){

if(
!confirm(
'Excluir lançamento?'
)
){
return;
}

const { error } =
await clienteSupabase
.from('caixa')
.delete()
.eq(
'id',
id
);

if(error){

console.log(error);
return;

}

carregarCaixa();

}

carregarCaixa();