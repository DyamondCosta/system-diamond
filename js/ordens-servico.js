const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let osEditando = null;

document.addEventListener(
'DOMContentLoaded',
()=>{
calcularTotal();
}
);

function calcularTotal(){

const maoObra =
Number(
document.getElementById(
'valor_mao_obra'
)?.value || 0
);

const pecas =
Number(
document.getElementById(
'valor_pecas'
)?.value || 0
);

document.getElementById(
'valor_total'
).value =
(maoObra + pecas).toFixed(2);

}

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

const valor_mao_obra =
Number(
document.getElementById(
'valor_mao_obra'
).value || 0
);

const valor_pecas =
Number(
document.getElementById(
'valor_pecas'
).value || 0
);

const valor_total =
valor_mao_obra +
valor_pecas;

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
valor_mao_obra,
valor_pecas,
valor_total,
status,
observacao
})
.eq(
'id',
osEditando
);

if(error){

console.log(error);

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
valor_mao_obra,
valor_pecas,
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
'valor_mao_obra'
).value='';

document.getElementById(
'valor_pecas'
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

let corStatus =
'#000';

if(
os.status === 'ABERTA'
){
corStatus='#ff9800';
}

if(
os.status === 'EM ANDAMENTO'
){
corStatus='#2196f3';
}

if(
os.status === 'AGUARDANDO PEÇAS'
){
corStatus='#f44336';
}

if(
os.status === 'FINALIZADA'
){
corStatus='#4caf50';
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
💼 Mão de Obra:
R$ ${Number(
os.valor_mao_obra || 0
).toFixed(2)}
</p>

<p>
🧰 Peças:
R$ ${Number(
os.valor_pecas || 0
).toFixed(2)}
</p>

<p>
💰 Total:
R$ ${Number(
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
✏️ Editar
</button>

<button
onclick="finalizarOS(${os.id})">
✅ Finalizar
</button>

<button
onclick="excluirOS(${os.id})">
🗑️ Excluir
</button>

<button
onclick="gerarPDFIndividual(${os.id})">
📄 PDF
</button>

</div>

`;

});

}

async function editarOS(id){

const { data } =
await clienteSupabase
.from('ordens_servico')
.select('*')
.eq('id',id)
.single();

if(!data) return;

osEditando=id;

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
'valor_mao_obra'
).value =
data.valor_mao_obra || 0;

document.getElementById(
'valor_pecas'
).value =
data.valor_pecas || 0;

document.getElementById(
'valor_total'
).value =
data.valor_total || 0;

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

await clienteSupabase
.from('ordens_servico')
.delete()
.eq(
'id',
id
);

carregarOS();

}

async function finalizarOS(id){

await clienteSupabase
.from('ordens_servico')
.update({
status:'FINALIZADA'
})
.eq(
'id',
id
);

carregarOS();

}

async function gerarPDFIndividual(id){

const { data } =
await clienteSupabase
.from('ordens_servico')
.select('*')
.eq('id',id)
.single();

if(!data) return;

const { jsPDF } =
window.jspdf;

const doc =
new jsPDF();

doc.setFontSize(18);

doc.text(
'BATALHÃO DOS PNEUS',
50,
20
);

doc.setFontSize(12);

doc.text(
`OS Nº ${data.id}`,
20,
40
);

doc.text(
`Cliente: ${data.cliente_nome}`,
20,
55
);

doc.text(
`Telefone: ${data.telefone}`,
20,
65
);

doc.text(
`Placa: ${data.placa}`,
20,
75
);

doc.text(
`Veículo: ${data.veiculo}`,
20,
85
);

doc.text(
`Serviço: ${data.servico}`,
20,
100
);

doc.text(
`Mão de Obra: R$ ${data.valor_mao_obra}`,
20,
115
);

doc.text(
`Peças: R$ ${data.valor_pecas}`,
20,
125
);

doc.text(
`Total: R$ ${data.valor_total}`,
20,
135
);

doc.text(
`Status: ${data.status}`,
20,
145
);

doc.text(
'Observações:',
20,
165
);

doc.text(
data.observacao || '',
20,
175
);

doc.save(
`OS-${data.id}.pdf`
);

}

function gerarPDF(){

alert(
'Salve a OS primeiro.'
);

}

document
.getElementById(
'valor_mao_obra'
)
?.addEventListener(
'input',
calcularTotal
);

document
.getElementById(
'valor_pecas'
)
?.addEventListener(
'input',
calcularTotal
);

carregarOS();