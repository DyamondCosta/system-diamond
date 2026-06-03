const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

let usuarioEditando = null;

async function salvarUsuario(){

const nome =
document.getElementById('nome').value;

const email =
document.getElementById('email').value;

const senha =
document.getElementById('senha').value;

const perfil =
document.getElementById('perfil').value;

if(usuarioEditando){

const { error } =
await clienteSupabase
.from('usuarios')
.update({
nome,
email,
senha,
perfil
})
.eq(
'id',
usuarioEditando
);

if(error){

alert(
'Erro ao atualizar usuário'
);

console.log(error);

return;

}

alert(
'Usuário atualizado'
);

usuarioEditando = null;

limparCampos();

carregarUsuarios();

return;

}

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

limparCampos();

carregarUsuarios();

}

function limparCampos(){

document.getElementById('nome').value='';
document.getElementById('email').value='';
document.getElementById('senha').value='';
document.getElementById('perfil').value='Administrador';

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

<button
onclick="editarUsuario(${usuario.id})">
✏️ Editar
</button>

<button
onclick="excluirUsuario(${usuario.id})">
🗑️ Excluir
</button>

</div>
`;

});

}

async function editarUsuario(id){

const { data } =
await clienteSupabase
.from('usuarios')
.select('*')
.eq('id', id)
.single();

if(!data) return;

usuarioEditando = id;

document.getElementById('nome').value =
data.nome || '';

document.getElementById('email').value =
data.email || '';

document.getElementById('senha').value =
data.senha || '';

document.getElementById('perfil').value =
data.perfil || '';

window.scrollTo({
top:0,
behavior:'smooth'
});

}

async function excluirUsuario(id){

const confirmar =
confirm(
'Deseja excluir este usuário?'
);

if(!confirmar){
return;
}

const { error } =
await clienteSupabase
.from('usuarios')
.delete()
.eq('id', id);

if(error){

alert(
'Erro ao excluir usuário'
);

console.log(error);

return;

}

alert(
'Usuário excluído'
);

carregarUsuarios();

}

carregarUsuarios();