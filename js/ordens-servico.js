const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function salvarOS(){

const cliente_nome =
document.getElementById(
'cliente_nome'
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
.insert([{
cliente_nome,
placa,
veiculo,
servico,
valor_total,
status,
observacao
}]);

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

carregarOS();

}

async function carregarOS(){

const { data } =
await clienteSupabase
.from('ordens_servico')
.select('*')
.order(
'id',
{
ascending:false
}
);

const lista =
document.getElementById(
'lista-os'
);

lista.innerHTML='';

data.forEach(os=>{

lista.innerHTML += `

<div class="card">

<h3>
OS ${os.id}
</h3>

<p>
Cliente:
${os.cliente_nome}
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
R$ ${os.valor_total}
</p>

<p>
Status:
${os.status}
</p>

</div>

`;

});

}

carregarOS();