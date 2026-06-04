const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let clientesCarregados = [];
let clienteEditando = null;

async function salvarCliente() {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const placa = document.getElementById('placa').value.trim();
    const veiculo = document.getElementById('veiculo').value.trim();
    const observacao = document.getElementById('observacao').value.trim();

    if (!nome) { alert('Informe o nome do cliente'); return; }

    if (clienteEditando) {
        const { error } = await clienteSupabase
            .from('clientes')
            .update({ nome, telefone, placa, veiculo, observacao })
            .eq('id', clienteEditando);

        if (error) { alert('Erro ao atualizar cliente'); return; }

        alert('✅ Cliente atualizado!');
        clienteEditando = null;
        cancelarEdicao();

    } else {
        const { error } = await clienteSupabase
            .from('clientes')
            .insert([{ nome, telefone, placa, veiculo, observacao }]);

        if (error) { alert('Erro ao salvar cliente'); return; }
        alert('✅ Cliente salvo com sucesso!');
    }

    limparCampos();
    carregarClientes();
}

function limparCampos() {
    ['nome', 'telefone', 'placa', 'veiculo', 'observacao'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function cancelarEdicao() {
    clienteEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Novo Cliente';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Cliente';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarClientes() {
    const { data, error } = await clienteSupabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

    if (error) { console.log(error); return; }

    clientesCarregados = data;
    renderizarClientes(data);
}

function renderizarClientes(lista) {
    const container = document.getElementById('lista-clientes');
    if (!container) return;

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;">Nenhum cliente encontrado.</p>';
        return;
    }

    container.innerHTML = `
    <table style="width:100%;background:white;border-radius:12px;overflow:hidden;border-collapse:collapse;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <thead>
            <tr style="background:#0f172a;color:white;">
                <th style="padding:14px;text-align:left;">👤 Nome</th>
                <th style="padding:14px;text-align:left;">📞 Telefone</th>
                <th style="padding:14px;text-align:left;">🚗 Placa</th>
                <th style="padding:14px;text-align:left;">🚙 Veículo</th>
                <th style="padding:14px;text-align:center;">Ações</th>
            </tr>
        </thead>
        <tbody id="tbody-clientes"></tbody>
    </table>`;

    const tbody = document.getElementById('tbody-clientes');

    lista.forEach((cliente, index) => {
        const bg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        tbody.innerHTML += `
        <tr style="border-bottom:1px solid #e5e7eb;background:${bg};">
            <td style="padding:12px;font-weight:600;">${cliente.nome || ''}</td>
            <td style="padding:12px;color:#6b7280;">${cliente.telefone || '-'}</td>
            <td style="padding:12px;">
                ${cliente.placa ? `<span style="background:#0f172a;color:white;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:bold;">${cliente.placa}</span>` : '-'}
            </td>
            <td style="padding:12px;color:#6b7280;">${cliente.veiculo || '-'}</td>
            <td style="padding:12px;text-align:center;">
                <button onclick="verHistorico(${cliente.id})" style="background:#3b82f6;margin:2px;">📋 Histórico</button>
                <button onclick="editarCliente(${cliente.id})" style="margin:2px;">✏️ Editar</button>
                <button onclick="excluirCliente(${cliente.id})" style="background:#ef4444;margin:2px;">🗑️ Excluir</button>
            </td>
        </tr>`;
    });
}

async function editarCliente(id) {
    const cliente = clientesCarregados.find(c => c.id === id);
    if (!cliente) return;

    clienteEditando = id;

    document.getElementById('nome').value = cliente.nome || '';
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('placa').value = cliente.placa || '';
    document.getElementById('veiculo').value = cliente.veiculo || '';
    document.getElementById('observacao').value = cliente.observacao || '';

    document.getElementById('titulo-form').textContent = '✏️ Editando Cliente';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function verHistorico(clienteId) {
    const cliente = clientesCarregados.find(c => c.id === clienteId);
    if (!cliente) return;

    const { data: vendas } = await clienteSupabase
        .from('vendas')
        .select('*')
        .ilike('cliente', `%${cliente.nome}%`)
        .order('data_venda', { ascending: false });

    const { data: agendamentos } = await clienteSupabase
        .from('agendamentos')
        .select('*')
        .ilike('cliente', `%${cliente.nome}%`)
        .order('data_agendamento', { ascending: false });

    const container = document.getElementById('lista-clientes');

    let html = `
    <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;">📋 Histórico de ${cliente.nome}</h3>
            <button onclick="carregarClientes()" style="background:#6b7280;">← Voltar</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
            <div style="background:#f0fdf4;padding:15px;border-radius:8px;border-left:4px solid #10b981;">
                <p style="margin:0;color:#6b7280;font-size:12px;">TOTAL GASTO</p>
                <p style="margin:5px 0 0;font-size:22px;font-weight:bold;color:#10b981;">
                    R$ ${(vendas || []).reduce((t, v) => t + Number(v.valor_total || 0), 0).toFixed(2)}
                </p>
            </div>
            <div style="background:#eff6ff;padding:15px;border-radius:8px;border-left:4px solid #3b82f6;">
                <p style="margin:0;color:#6b7280;font-size:12px;">VISITAS</p>
                <p style="margin:5px 0 0;font-size:22px;font-weight:bold;color:#3b82f6;">
                    ${(vendas || []).length}
                </p>
            </div>
        </div>

        <h4>🛞 Compras e Serviços</h4>`;

    if (!vendas || vendas.length === 0) {
        html += '<p style="color:#6b7280;">Nenhuma compra registrada.</p>';
    } else {
        vendas.forEach(v => {
            const data = v.data_venda ? v.data_venda.split('-').reverse().join('/') : '-';
            const icone = v.tipo === 'servico' ? '🔧' : '🛞';
            html += `
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <p style="margin:0;font-weight:600;">${icone} ${v.pneu_nome || ''}</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${data} • ${v.forma_pagamento}</p>
                </div>
                <span style="font-size:16px;font-weight:bold;color:#10b981;">R$ ${Number(v.valor_total || 0).toFixed(2)}</span>
            </div>`;
        });
    }

    html += '<h4 style="margin-top:20px;">📅 Agendamentos</h4>';

    if (!agendamentos || agendamentos.length === 0) {
        html += '<p style="color:#6b7280;">Nenhum agendamento registrado.</p>';
    } else {
        agendamentos.forEach(a => {
            const data = a.data_agendamento ? a.data_agendamento.split('-').reverse().join('/') : '-';
            let corStatus = '#6b7280';
            if (a.status === 'PENDENTE')   corStatus = '#f59e0b';
            if (a.status === 'CONFIRMADO') corStatus = '#3b82f6';
            if (a.status === 'CONCLUIDO')  corStatus = '#10b981';
            if (a.status === 'CANCELADO')  corStatus = '#ef4444';

            html += `
            <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <p style="margin:0;font-weight:600;">🔧 ${a.servico}</p>
                    <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${data} às ${(a.hora_agendamento || '').substring(0,5)}</p>
                </div>
                <span style="color:${corStatus};font-weight:bold;">${a.status}</span>
            </div>`;
        });
    }

    html += '</div>';
    container.innerHTML = html;
}

function filtrarClientes() {
    const texto = document.getElementById('pesquisa').value.toLowerCase();
    const filtrados = clientesCarregados.filter(c =>
        (c.nome || '').toLowerCase().includes(texto) ||
        (c.placa || '').toLowerCase().includes(texto) ||
        (c.telefone || '').toLowerCase().includes(texto)
    );
    renderizarClientes(filtrados);
}

async function excluirCliente(id) {
    if (!confirm('Deseja excluir este cliente?')) return;

    const { error } = await clienteSupabase
        .from('clientes')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }
    carregarClientes();
}

carregarClientes();