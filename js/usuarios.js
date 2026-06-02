const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function salvarUsuario(){

const nome =
document.getElementById(
'nome'
).value;

const email =
document.getElementById(
'email'
).value;

const senha =
document.getElementById(
'senha'
).value;

const perfil =
document.getElementById(
'perfil'
).value;

const { error } =
await clienteSupabase
.from('usuarios')
.insert([
{
nome,
email,
senha,
perfil,
ativo:true
}
]);

if(error){

alert(
'Erro ao salvar'
);

console.log(error);

return;

}

alert(
'Usuário salvo'
);

carregarUsuarios();

}

async function carregarUsuarios(){

const { data } =
await clienteSupabase
.from('usuarios')
.select('*')
.order(
'id',
{
ascending:false
}
);

const lista =
document.getElementById(
'lista-usuarios'
);

lista.innerHTML='';

data.forEach(usuario=>{

lista.innerHTML +=
`
<div class="card">

<h3>
${usuario.nome}
</h3>

<p>
${usuario.email}
</p>

<p>
${usuario.perfil}
</p>

</div>
`;

});

}

carregarUsuarios();