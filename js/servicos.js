const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let servicosCarregados = [];
let servicoEditando = null;

async function salvarServico() {
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value;
    const valor = document.getElementById('valor').value;
    const tempo_estimado = document.getElementById('tempo_estimado').value.trim();
    const descricao = document.getElementById('descricao').value.trim();

    if (!nome) { alert('Informe o nome do serviço'); return; }
    if (!valor) { alert('Informe o valor do serviço'); return; }

    if (servicoEditando) {
        const { error } = await clienteSupabase
            .from('servicos')
            .update({ nome, categoria, valor, tempo_estimado, descricao })
            .eq('id', servicoEditando);

        if (error) { alert('Erro ao atualizar serviço'); return; }

        alert('✅ Serviço atualizado!');
        servicoEditando = null;
        cancelarEdicao();

    } else {
        const { error } = await clienteSupabase
            .from('servicos')
            .insert([{ nome, categoria, valor, tempo_estimado, descricao }]);

        if (error) { alert('Erro ao salvar serviço'); return; }
        alert('✅ Serviço salvo com sucesso!');
    }

    limparCampos();
    carregarServicos();
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('tempo_estimado').value = '';
    document.getElementById('descricao').value = '';
}

function cancelarEdicao() {
    servicoEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Novo Serviço';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Serviço';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editarServico(id) {
    const servico = servicosCarregados.find(s => s.id === id);
    if (!servico) return;

    servicoEditando = id;

    document.getElementById('nome').value = servico.nome || '';
    document.getElementById('categoria').value = servico.categoria || '';
    document.getElementById('valor').value = servico.valor || '';
    document.getElementById('tempo_estimado').value = servico.tempo_estimado || '';
    document.getElementById('descricao').value = servico.descricao || '';

    document.getElementById('titulo-form').textContent = '✏️ Editando Serviço';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarServicos() {
    const { data, error } = await clienteSupabase
        .from('servicos')
        .select('*')
        .order('nome', { ascending: true });

    if (error) { console.log(error); return; }

    servicosCarregados = data;
    renderizarServicos(data);
}

function renderizarServicos(lista) {
    const container = document.getElementById('lista-servicos');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
        return;
    }

    lista.forEach(servico => {
        const categoriaColor = {
            'Pneus': '#3b82f6',
            'Alinhamento': '#8b5cf6',
            'Balanceamento': '#f59e0b',
            'Suspensão': '#ef4444',
            'Freios': '#ec4899',
            'Manutenção Geral': '#10b981',
            'Outros': '#6b7280'
        }[servico.categoria] || '#6b7280';

        container.innerHTML += `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
                <div>
                    <h2 style="font-size:20px;margin:0 0 6px;">${servico.nome}</h2>
                    ${servico.categoria ? `<span style="background:${categoriaColor};color:white;padding:3px 10px;border-radius:20px;font-size:12px;">${servico.categoria}</span>` : ''}
                </div>
                <div style="text-align:right;">
                    <p style="font-size:22px;font-weight:bold;color:#10b981;margin:0;">R$ ${Number(servico.valor || 0).toFixed(2)}</p>
                    ${servico.tempo_estimado ? `<p style="color:#6b7280;font-size:13px;margin:4px 0 0;">⏱️ ${servico.tempo_estimado}</p>` : ''}
                </div>
            </div>
            ${servico.descricao ? `<p style="color:#6b7280;margin:10px 0 0;font-size:14px;">${servico.descricao}</p>` : ''}
            <div style="display:flex;gap:8px;margin-top:12px;">
                <button onclick="editarServico(${servico.id})">✏️ Editar</button>
                <button onclick="excluirServico(${servico.id})" style="background:#ef4444;">🗑️ Excluir</button>
            </div>
        </div>`;
    });
}

function filtrarServicos() {
    const texto = document.getElementById('pesquisa').value.toLowerCase();
    const filtrados = servicosCarregados.filter(s =>
        (s.nome || '').toLowerCase().includes(texto) ||
        (s.categoria || '').toLowerCase().includes(texto)
    );
    renderizarServicos(filtrados);
}

async function excluirServico(id) {
    if (!confirm('Excluir este serviço?')) return;

    const { error } = await clienteSupabase
        .from('servicos')
        .delete()
        .eq('id', id);

    if (error) { console.log(error); return; }
    carregarServicos();
}

carregarServicos();