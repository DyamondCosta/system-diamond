const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let pneuEditando = null;

async function salvarPneu(){

const marca =
document.getElementById('marca').value;

const modelo =
document.getElementById('modelo').value;

const medida =
document.getElementById('medida').value;

const tipo =
document.getElementById('tipo').value;

const preco_compra =
Number(
document.getElementById('preco_compra').value
);

const preco_venda =
Number(
document.getElementById('preco_venda').value
);

const quantidade =
Number(
document.getElementById('quantidade').value
);

if(pneuEditando){

const { error } =
await clienteSupabase
.from('pneus')
.update({
marca,
modelo,
medida,
tipo,
preco_compra,
preco_venda,
quantidade
})
.eq('id', pneuEditando);

if(error){

console.log(error);

alert(
'Erro ao atualizar pneu'
);

return;

}

alert(
'Pneu atualizado com sucesso'
);

pneuEditando = null;

limparCampos();

carregarPneus();

return;

}

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
quantidade,
ativo:true
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

limparCampos();

carregarPneus();

}

function limparCampos(){

document.getElementById('marca').value='';
document.getElementById('modelo').value='';
document.getElementById('medida').value='';
document.getElementById('tipo').value='';
document.getElementById('preco_compra').value='';
document.getElementById('preco_venda').value='';
document.getElementById('quantidade').value='';

}

async function carregarPneus(){

const { data, error } =
await clienteSupabase
.from('pneus')
.select('*')
.eq('ativo', true)
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
)
<=
Number(
pneu.estoque_minimo || 2
);

lista.innerHTML += `

<div class="card">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:12px;
">

<div>

<h3 style="
margin:0;
font-size:20px;
">
${pneu.marca} ${pneu.modelo}
</h3>

<div style="
color:#64748b;
font-size:14px;
margin-top:4px;
">
${pneu.medida || '-'} • ${pneu.tipo || '-'}
</div>

</div>

<div style="
font-size:18px;
font-weight:bold;
color:${estoqueBaixo ? '#dc2626' : '#16a34a'};
">
${pneu.quantidade} un.
</div>

</div>

<div style="
display:flex;
gap:30px;
margin-bottom:12px;
font-size:15px;
">

<div>
Compra:
<b>
R$ ${Number(
pneu.preco_compra || 0
).toFixed(2)}
</b>
</div>

<div>
Venda:
<b>
R$ ${Number(
pneu.preco_venda || 0
).toFixed(2)}
</b>
</div>

</div>

<div style="
margin-bottom:15px;
font-weight:600;
color:${estoqueBaixo ? '#dc2626' : '#16a34a'};
">

${estoqueBaixo
? 'ESTOQUE BAIXO'
: 'ESTOQUE OK'}

</div>

<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
">

<button
onclick="editarPneu(${pneu.id})">
Editar </button>

<button
onclick="entradaEstoque(${pneu.id})">
Entrada </button>

<button
onclick="saidaEstoque(${pneu.id})">
Saída </button>

<button
onclick="excluirPneu(${pneu.id})">
Inativar </button>

</div>

</div>

`;

});

}

async function editarPneu(id){

const { data } =
await clienteSupabase
.from('pneus')
.select('*')
.eq('id', id)
.single();

if(!data) return;

pneuEditando = id;

document.getElementById('marca').value =
data.marca || '';

document.getElementById('modelo').value =
data.modelo || '';

document.getElementById('medida').value =
data.medida || '';

document.getElementById('tipo').value =
data.tipo || '';

document.getElementById('preco_compra').value =
data.preco_compra || '';

document.getElementById('preco_venda').value =
data.preco_venda || '';

document.getElementById('quantidade').value =
data.quantidade || '';

window.scrollTo({
top:0,
behavior:'smooth'
});

}

async function entradaEstoque(id){

const qtd =
prompt(
'Quantidade para entrada:'
);

if(!qtd) return;

const { data } =
await clienteSupabase
.from('pneus')
.select('quantidade')
.eq('id', id)
.single();

const novaQtd =
Number(data.quantidade)
+
Number(qtd);

await clienteSupabase
.from('pneus')
.update({
quantidade:novaQtd
})
.eq('id', id);

carregarPneus();

}

async function saidaEstoque(id){

const qtd =
prompt(
'Quantidade para saída:'
);

if(!qtd) return;

const { data } =
await clienteSupabase
.from('pneus')
.select('quantidade')
.eq('id', id)
.single();

const novaQtd =
Number(data.quantidade)

Number(qtd);

if(novaQtd < 0){

alert(
'Estoque insuficiente'
);

return;

}

await clienteSupabase
.from('pneus')
.update({
quantidade:novaQtd
})
.eq('id', id);

carregarPneus();

}

async function excluirPneu(id){

const confirmar =
confirm(
'Deseja inativar este pneu?'
);

if(!confirmar){
return;
}

const { error } =
await clienteSupabase
.from('pneus')
.update({
ativo:false
})
.eq('id', id);

if(error){

console.log(error);

alert(
'Erro ao inativar'
);

return;

}

alert(
'Pneu inativado'
);

carregarPneus();

}

carregarPneus();
