const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let agendamentosCarregados = [];
let filtroAtual = 'TODOS';

// CARREGA SERVIÇOS NO SELECT
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

    const { error } = await clienteSupabase
        .from('agendamentos')
        .insert([{ cliente, telefone, data_agendamento, hora_agendamento, servico, status: 'PENDENTE' }]);

    if (error) { console.log(error); alert('Erro ao salvar'); return; }

    alert('✅ Agendamento criado!');
    limparCampos();
    carregarAgendamentos();
}

function limparCampos() {
    ['cliente', 'telefone', 'data_agendamento', 'hora_agendamento', 'servico'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('servico_select').selectedIndex = 0;
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
        lista.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
        return;
    }

    filtrados.forEach(item => {
        const dataFormatada = item.data_agendamento
            ? item.data_agendamento.split('-').reverse().join('/')
            : '-';

        const horaFormatada = item.hora_agendamento
            ? item.hora_agendamento.substring(0, 5)
            : '-';

        let corStatus = '#6b7280';
        let iconeStatus = '📋';
        if (item.status === 'PENDENTE')   { corStatus = '#f59e0b'; iconeStatus = '⏳'; }
        if (item.status === 'CONFIRMADO') { corStatus = '#3b82f6'; iconeStatus = '✅'; }
        if (item.status === 'CONCLUIDO')  { corStatus = '#10b981'; iconeStatus = '🏁'; }
        if (item.status === 'CANCELADO')  { corStatus = '#ef4444'; iconeStatus = '❌'; }

        lista.innerHTML += `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h3>👤 ${item.cliente}</h3>
                <span style="color:${corStatus};font-weight:bold;">${iconeStatus} ${item.status}</span>
            </div>
            <p>📞 ${item.telefone || '-'}</p>
            <p>📅 ${dataFormatada} às ${horaFormatada}</p>
            <p>🔧 ${item.servico}</p>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
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