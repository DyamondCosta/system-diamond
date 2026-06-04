const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let agendamentosCarregados = [];
let filtroAtual = 'TODOS';
let agendamentoEditando = null;

async function carregarServicosSelect() {
    const { data } = await clienteSupabase
        .from('servicos')
        .select('*')
        .order('nome');

    const select = document.getElementById('servico_select');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o Serviço</option>';
    (data || []).forEach(s => {
        select.innerHTML += `<option value="${s.nome}">${s.nome}</option>`;
    });

    select.addEventListener('change', () => {
        const manual = document.getElementById('servico');
        if (select.value) manual.value = select.value;
    });
}

async function salvarAgendamento() {
    const cliente = document.getElementById('cliente').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const data_agendamento = document.getElementById('data_agendamento').value;
    const hora_agendamento = document.getElementById('hora_agendamento').value;
    const servico = document.getElementById('servico').value.trim();

    if (!cliente) { alert('Informe o nome do cliente'); return; }
    if (!data_agendamento) { alert('Informe a data'); return; }
    if (!hora_agendamento) { alert('Informe o horário'); return; }
    if (!servico) { alert('Informe o serviço'); return; }

    if (agendamentoEditando) {
        const { error } = await clienteSupabase
            .from('agendamentos')
            .update({ cliente, telefone, data_agendamento, hora_agendamento, servico })
            .eq('id', agendamentoEditando);

        if (error) { alert('Erro ao atualizar'); return; }

        alert('✅ Agendamento atualizado!');
        agendamentoEditando = null;
        document.getElementById('titulo-form').textContent = 'Novo Agendamento';
        document.getElementById('btn-salvar').textContent = '💾 Salvar Agendamento';
        document.getElementById('btn-cancelar').style.display = 'none';

    } else {
        const { error } = await clienteSupabase
            .from('agendamentos')
            .insert([{ cliente, telefone, data_agendamento, hora_agendamento, servico, status: 'PENDENTE' }]);

        if (error) { alert('Erro ao salvar'); return; }
        alert('✅ Agendamento criado!');
    }

    limparCampos();
    carregarAgendamentos();
}

function limparCampos() {
    ['cliente', 'telefone', 'data_agendamento', 'hora_agendamento', 'servico'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('servico_select').selectedIndex = 0;
}

function cancelarEdicao() {
    agendamentoEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Novo Agendamento';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Agendamento';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editarAgendamento(id) {
    const item = agendamentosCarregados.find(a => a.id === id);
    if (!item) return;

    agendamentoEditando = id;

    document.getElementById('cliente').value = item.cliente || '';
    document.getElementById('telefone').value = item.telefone || '';
    document.getElementById('data_agendamento').value = item.data_agendamento || '';
    document.getElementById('hora_agendamento').value = item.hora_agendamento || '';
    document.getElementById('servico').value = item.servico || '';

    document.getElementById('titulo-form').textContent = '✏️ Editando Agendamento';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarAgendamentos() {
    const { data } = await clienteSupabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: true })
        .order('hora_agendamento', { ascending: true });

    agendamentosCarregados = data || [];
    renderizarAgendamentos();
}

function filtrarStatus(status) {
    filtroAtual = status;
    renderizarAgendamentos();
}

function renderizarAgendamentos() {
    const lista = document.getElementById('lista-agendamentos');
    lista.innerHTML = '';

    let filtrados = agendamentosCarregados;
    if (filtroAtual !== 'TODOS') {
        filtrados = agendamentosCarregados.filter(a => a.status === filtroAtual);
    }

    if (filtrados.length === 0) {
        lista.innerHTML = '<p style="color:#6b7280;">Nenhum agendamento encontrado.</p>';
        return;
    }

    const hoje = new Date().toISOString().split('T')[0];

    filtrados.forEach(item => {
        const dataFormatada = item.data_agendamento
            ? item.data_agendamento.split('-').reverse().join('/')
            : '-';
        const horaFormatada = item.hora_agendamento
            ? item.hora_agendamento.substring(0, 5)
            : '-';

        const ehHoje = item.data_agendamento === hoje;
        const destaque = ehHoje ? 'border-left:4px solid #3b82f6;' : '';

        let corStatus = '#6b7280';
        let iconeStatus = '📋';
        if (item.status === 'PENDENTE')   { corStatus = '#f59e0b'; iconeStatus = '⏳'; }
        if (item.status === 'CONFIRMADO') { corStatus = '#3b82f6'; iconeStatus = '✅'; }
        if (item.status === 'CONCLUIDO')  { corStatus = '#10b981'; iconeStatus = '🏁'; }
        if (item.status === 'CANCELADO')  { corStatus = '#ef4444'; iconeStatus = '❌'; }

        lista.innerHTML += `
        <div class="card" style="${destaque}">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <h3 style="margin:0 0 4px;">👤 ${item.cliente}</h3>
                    ${item.telefone ? `<p style="color:#6b7280;margin:0;font-size:13px;">📞 ${item.telefone}</p>` : ''}
                </div>
                <div style="text-align:right;">
                    <span style="color:${corStatus};font-weight:bold;">${iconeStatus} ${item.status}</span>
                    ${ehHoje ? '<span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:8px;">HOJE</span>' : ''}
                </div>
            </div>
            <p style="margin:8px 0 4px;">📅 ${dataFormatada} às ${horaFormatada}</p>
            <p style="margin:0 0 10px;">🔧 ${item.servico}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button onclick="editarAgendamento(${item.id})" style="background:#8b5cf6;">✏️ Editar</button>
                ${item.status !== 'CONFIRMADO' && item.status !== 'CONCLUIDO' && item.status !== 'CANCELADO' ? `
                <button onclick="atualizarStatus(${item.id}, 'CONFIRMADO')" style="background:#3b82f6;">✅ Confirmar</button>` : ''}
                ${item.status !== 'CONCLUIDO' && item.status !== 'CANCELADO' ? `
                <button onclick="atualizarStatus(${item.id}, 'CONCLUIDO')" style="background:#10b981;">🏁 Concluir</button>` : ''}
                ${item.status !== 'CANCELADO' ? `
                <button onclick="atualizarStatus(${item.id}, 'CANCELADO')" style="background:#ef4444;">❌ Cancelar</button>` : ''}
                <button onclick="excluirAgendamento(${item.id})" style="background:#6b7280;">🗑️ Excluir</button>
            </div>
        </div>`;
    });
}

async function atualizarStatus(id, novoStatus) {
    const { error } = await clienteSupabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id);

    if (error) { alert('Erro ao atualizar'); return; }
    carregarAgendamentos();
}

async function excluirAgendamento(id) {
    if (!confirm('Excluir este agendamento?')) return;

    const { error } = await clienteSupabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }
    carregarAgendamentos();
}

carregarServicosSelect();
carregarAgendamentos();