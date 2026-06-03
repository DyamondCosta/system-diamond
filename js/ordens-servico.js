const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

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

carregarOS();

}catch(erro){

console.log(erro);

alert(
'Erro interno'
);

}

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

lista.innerHTML += `

<div class="card">

<h3>
OS #${os.id}
</h3>

<p>
Cliente:
${os.cliente_nome}
</p>

<p>
Telefone:
${os.telefone || ''}
</p>

<p>
Placa:
${os.placa}
</p>

<p>
Veículo:
${os.veiculo}
</p>

<p>
Serviço:
${os.servico}
</p>

<p>
Valor:
R$ ${Number(
os.valor_total || 0
).toFixed(2)}
</p>

<p>
Status:
${os.status}
</p>

<button
onclick="gerarPDFIndividual(
'${os.cliente_nome}',
'${os.telefone || ''}',
'${os.placa}',
'${os.veiculo}',
'${os.servico}',
'${os.valor_total}',
'${os.status}',
'${os.observacao || ''}',
'${os.id}'
)">
PDF </button>

</div>

`;

});

}

function gerarPDF(){

const { jsPDF } =
window.jspdf;

const doc =
new jsPDF();

doc.setFontSize(18);

doc.text(
'BATALHÃO DOS PNEUS',
20,
20
);

doc.setFontSize(12);

doc.text(
'ORDEM DE SERVIÇO',
20,
30
);

doc.text(
'Cliente: ' +
document.getElementById(
'cliente_nome'
).value,
20,
50
);

doc.text(
'Telefone: ' +
document.getElementById(
'telefone'
).value,
20,
60
);

doc.text(
'Placa: ' +
document.getElementById(
'placa'
).value,
20,
70
);

doc.text(
'Veículo: ' +
document.getElementById(
'veiculo'
).value,
20,
80
);

doc.text(
'Serviço: ' +
document.getElementById(
'servico'
).value,
20,
90
);

doc.text(
'Valor: R$ ' +
document.getElementById(
'valor_total'
).value,
20,
100
);

doc.text(
'Observações:',
20,
120
);

doc.text(
document.getElementById(
'observacao'
).value,
20,
130
);

doc.save(
'ordem-servico.pdf'
);

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

doc.setFontSize(18);

doc.text(
'BATALHÃO DOS PNEUS',
20,
20
);

doc.setFontSize(12);

doc.text(
'OS #' + id,
20,
35
);

doc.text(
'Cliente: ' + cliente,
20,
50
);

doc.text(
'Telefone: ' + telefone,
20,
60
);

doc.text(
'Placa: ' + placa,
20,
70
);

doc.text(
'Veículo: ' + veiculo,
20,
80
);

doc.text(
'Serviço: ' + servico,
20,
90
);

doc.text(
'Valor: R$ ' + valor,
20,
100
);

doc.text(
'Status: ' + status,
20,
110
);

doc.text(
'Observação:',
20,
125
);

doc.text(
observacao,
20,
135
);

doc.save(
`OS-${id}.pdf`
);

}

carregarOS();
