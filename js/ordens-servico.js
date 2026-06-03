const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let osEditando = null;

async function salvarOS(){

try{

const cliente_nome =
document.getElementById(
'cliente_nome'
).value;

const telefone =
document.getElementById(
'telefone'
).value;

const placa =
document.getElementById(
'placa'
).value;

const veiculo =
document.getElementById(
'veiculo'
).value;

const servico =
document.getElementById(
'servico'
).value;

const valor_total =
Number(
document.getElementById(
'valor_total'
).value
);

const status =
document.getElementById(
'status'
).value;

const observacao =
document.getElementById(
'observacao'
).value;

if(osEditando){

const { error } =
await clienteSupabase
.from('ordens_servico')
.update({
cliente_nome,
telefone,
placa,
veiculo,
servico,
valor_total,
status,
observacao
})
.eq(
'id',
osEditando
);

if(error){

alert(
'Erro ao atualizar OS'
);

return;

}

alert(
'OS atualizada com sucesso'
);

osEditando = null;

limparFormulario();

carregarOS();

return;

}

const { error } =
await clienteSupabase
.from('ordens_servico')
.insert([
{
cliente_nome,
telefone,
placa,
veiculo,
servico,
valor_total,
status,
observacao
}
]);

if(error){

console.log(error);

alert(
'Erro ao salvar OS'
);

return;

}

alert(
'OS criada com sucesso'
);

limparFormulario();

carregarOS();

}catch(erro){

console.log(erro);

alert(
'Erro interno'
);

}

}

function limparFormulario(){

document.getElementById(
'cliente_nome'
).value='';

document.getElementById(
'telefone'
).value='';

document.getElementById(
'placa'
).value='';

document.getElementById(
'veiculo'
).value='';

document.getElementById(
'servico'
).value='';

document.getElementById(
'valor_total'
).value='';

document.getElementById(
'observacao'
).value='';

document.getElementById(
'status'
).value='ABERTA';

}

async function carregarOS(){

const { data, error } =
await clienteSupabase
.from('ordens_servico')
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
'lista-os'
);

lista.innerHTML='';

data.forEach(os=>{

let corStatus = 'black';

if(os.status === 'ABERTA'){
corStatus = '#ff9800';
}

if(os.status === 'EM ANDAMENTO'){
corStatus = '#2196f3';
}

if(os.status === 'FINALIZADA'){
corStatus = '#4caf50';
}

lista.innerHTML += `

<div class="card">

<h3>
📋 OS #${os.id}
</h3>

<p>
👤 ${os.cliente_nome || ''}
</p>

<p>
📞 ${os.telefone || ''}
</p>

<p>
🚗 ${os.placa || ''}
</p>

<p>
🚘 ${os.veiculo || ''}
</p>

<p>
🔧 ${os.servico || ''}
</p>

<p>
💰 R$ ${Number(
os.valor_total || 0
).toFixed(2)}
</p>

<p style="
font-weight:bold;
color:${corStatus};
">
${os.status}
</p>

<button
onclick="editarOS(${os.id})">
✏️ Editar </button>

<button
onclick="finalizarOS(${os.id})">
✅ Finalizar </button>

<button
onclick="excluirOS(${os.id})">
🗑️ Excluir </button>

<button
onclick="gerarPDFIndividual(
'${os.cliente_nome || ''}',
'${os.telefone || ''}',
'${os.placa || ''}',
'${os.veiculo || ''}',
'${os.servico || ''}',
'${os.valor_total || 0}',
'${os.status || ''}',
'${os.observacao || ''}',
'${os.id}'
)">
📄 PDF </button>

</div>

`;

});

}

async function editarOS(id){

const { data } =
await clienteSupabase
.from('ordens_servico')
.select('*')
.eq('id', id)
.single();

if(!data) return;

osEditando = id;

document.getElementById(
'cliente_nome'
).value =
data.cliente_nome || '';

document.getElementById(
'telefone'
).value =
data.telefone || '';

document.getElementById(
'placa'
).value =
data.placa || '';

document.getElementById(
'veiculo'
).value =
data.veiculo || '';

document.getElementById(
'servico'
).value =
data.servico || '';

document.getElementById(
'valor_total'
).value =
data.valor_total || '';

document.getElementById(
'status'
).value =
data.status || 'ABERTA';

document.getElementById(
'observacao'
).value =
data.observacao || '';

window.scrollTo({
top:0,
behavior:'smooth'
});

}

async function excluirOS(id){

if(
!confirm(
'Deseja excluir esta OS?'
)
){
return;
}

const { error } =
await clienteSupabase
.from('ordens_servico')
.delete()
.eq(
'id',
id
);

if(error){

alert(
'Erro ao excluir'
);

return;

}

carregarOS();

}

async function finalizarOS(id){

const { error } =
await clienteSupabase
.from('ordens_servico')
.update({
status:'FINALIZADA'
})
.eq(
'id',
id
);

if(error){

alert(
'Erro ao finalizar'
);

return;

}

carregarOS();

}

function gerarPDFIndividual(
cliente,
telefone,
placa,
veiculo,
servico,
valor,
status,
observacao,
id
){

const { jsPDF } =
window.jspdf;

const doc =
new jsPDF();

doc.setDrawColor(0);
doc.rect(
10,
10,
190,
270
);

doc.setFontSize(18);

doc.text(
'BATALHÃO DOS PNEUS',
55,
25
);

doc.setFontSize(12);

doc.text(
`OS Nº ${id}`,
20,
40
);

doc.text(
`Cliente: ${cliente}`,
20,
60
);

doc.text(
`Telefone: ${telefone}`,
20,
70
);

doc.text(
`Placa: ${placa}`,
20,
80
);

doc.text(
`Veículo: ${veiculo}`,
20,
90
);

doc.text(
`Serviço: ${servico}`,
20,
110
);

doc.text(
`Valor: R$ ${valor}`,
20,
120
);

doc.text(
`Status: ${status}`,
20,
130
);

doc.text(
'Observações:',
20,
150
);

doc.text(
observacao || '',
20,
160
);

doc.line(
20,
220,
90,
220
);

doc.text(
'Assinatura Cliente',
20,
228
);

doc.line(
110,
220,
180,
220
);

doc.text(
'Responsável',
120,
228
);

doc.save(
`OS-${id}.pdf`
);

}

function gerarPDF(){

alert(
'Salve a OS primeiro para gerar PDF.'
);

}

carregarOS();
