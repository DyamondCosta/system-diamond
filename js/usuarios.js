const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let usuarioEditando = null;

async function salvarUsuario() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const perfil = document.getElementById('perfil').value;

    if (!nome) { alert('Informe o nome'); return; }
    if (!email) { alert('Informe o email'); return; }
    if (!senha && !usuarioEditando) { alert('Informe a senha'); return; }

    if (usuarioEditando) {
        const dados = { nome, email, perfil };
        if (senha) dados.senha = senha;

        const { error } = await clienteSupabase
            .from('usuarios')
            .update(dados)
            .eq('id', usuarioEditando);

        if (error) { alert('Erro ao atualizar usuário'); return; }
        alert('✅ Usuário atualizado!');
        cancelarEdicao();

    } else {
        const { error } = await clienteSupabase
            .from('usuarios')
            .insert([{ nome, email, senha, perfil, ativo: true }]);

        if (error) { alert('Erro ao salvar usuário'); return; }
        alert('✅ Usuário criado com sucesso!');
    }

    limparCampos();
    carregarUsuarios();
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('perfil').value = 'Administrador';
}

function cancelarEdicao() {
    usuarioEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Novo Usuário';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Usuário';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarUsuarios() {
    const { data } = await clienteSupabase
        .from('usuarios')
        .select('*')
        .order('nome', { ascending: true });

    const lista = document.getElementById('lista-usuarios');
    lista.innerHTML = '';

    if (!data || data.length === 0) {
        lista.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
        return;
    }

    (data || []).forEach(usuario => {
        const perfil = usuario.perfil || '';
        const perfilLower = perfil.toLowerCase().trim();

        let cor = '#6b7280';
        if (perfilLower === 'admin' || perfilLower === 'administrador') cor = '#ef4444';
        else if (perfilLower === 'gerente') cor = '#3b82f6';
        else if (perfilLower === 'funcionario' || perfilLower === 'funcionário') cor = '#10b981';

        lista.innerHTML += `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <h3 style="margin:0 0 4px;">${usuario.nome}</h3>
                    <p style="color:#6b7280;margin:0;font-size:13px;">✉️ ${usuario.email}</p>
                </div>
                <span style="background:${cor};color:white;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:bold;">
                    ${perfil}
                </span>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <button onclick="editarUsuario(${usuario.id})">✏️ Editar</button>
                <button onclick="excluirUsuario(${usuario.id})" style="background:#ef4444;">🗑️ Excluir</button>
            </div>
        </div>`;
    });
}

async function editarUsuario(id) {
    const { data } = await clienteSupabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

    if (!data) return;

    usuarioEditando = id;

    document.getElementById('nome').value = data.nome || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('senha').value = '';
    document.getElementById('perfil').value = data.perfil || 'Administrador';

    document.getElementById('titulo-form').textContent = '✏️ Editando Usuário';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function excluirUsuario(id) {
    if (!confirm('Deseja excluir este usuário?')) return;

    const { error } = await clienteSupabase
        .from('usuarios')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }
    carregarUsuarios();
}

carregarUsuarios();