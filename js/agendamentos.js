const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function salvarAgendamento(){

const cliente =
document.getElementById(
'cliente'
).value;

const telefone =
document.getElementById(
'telefone'
).value;

const data_agendamento =
document.getElementById(
'data_agendamento'
).value;

const hora_agendamento =
document.getElementById(
'hora_agendamento'
).value;

const servico =
document.getElementById(
'servico'
).value;

const { error } =
await clienteSupabase
.from('agendamentos')
.insert([
{
cliente,
telefone,
data_agendamento,
hora_agendamento,
servico,
status:'PENDENTE'
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
'Agendamento criado'
);

carregarAgendamentos();

}

async function carregarAgendamentos(){

const { data } =
await clienteSupabase
.from('agendamentos')
.select('*')
.order(
'id',
{
ascending:false
}
);

const lista =
document.getElementById(
'lista-agendamentos'
);

lista.innerHTML='';

data.forEach(item=>{

lista.innerHTML +=
`
<div class="card">

<h3>
${item.cliente}
</h3>

<p>
${item.telefone}
</p>

<p>
${item.data_agendamento}
</p>

<p>
${item.hora_agendamento}
</p>

<p>
${item.servico}
</p>

<p>
${item.status}
</p>

</div>
`;

});

}

carregarAgendamentos();