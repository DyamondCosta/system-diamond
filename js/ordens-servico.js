const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let osEditando = null;
let osCarregadas = [];
let filtroAtual = 'TODOS';

function calcularTotal() {
    const maoObra = Number(document.getElementById('valor_mao_obra').value) || 0;
    const pecas = Number(document.getElementById('valor_pecas').value) || 0;
    document.getElementById('valor_total').value = (maoObra + pecas).toFixed(2);
}

async function salvarOS() {
    const cliente_nome = document.getElementById('cliente_nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const placa = document.getElementById('placa').value.trim();
    const veiculo = document.getElementById('veiculo').value.trim();
    const servico = document.getElementById('servico').value.trim();
    const valor_mao_obra = Number(document.getElementById('valor_mao_obra').value);
    const valor_pecas = Number(document.getElementById('valor_pecas').value);
    const valor_total = Number(document.getElementById('valor_total').value);
    const status = document.getElementById('status').value;
    const observacao = document.getElementById('observacao').value;

    if (!cliente_nome) { alert('Informe o nome do cliente'); return; }
    if (!servico) { alert('Informe o serviço'); return; }

    if (osEditando) {
        const { error } = await clienteSupabase
            .from('ordens_servico')
            .update({ cliente_nome, telefone, placa, veiculo, servico,
                      valor_mao_obra, valor_pecas, valor_total, status, observacao })
            .eq('id', osEditando);

        if (error) { alert('Erro ao atualizar orçamento'); return; }

        alert('✅ Orçamento atualizado!');
        osEditando = null;
        cancelarEdicao();

    } else {
        const { error } = await clienteSupabase
            .from('ordens_servico')
            .insert([{ cliente_nome, telefone, placa, veiculo, servico,
                       valor_mao_obra, valor_pecas, valor_total, status, observacao }]);

        if (error) { alert('Erro ao salvar orçamento'); return; }
        alert('✅ Orçamento salvo!');
    }

    limparCampos();
    carregarOS();
}

function limparCampos() {
    ['cliente_nome', 'telefone', 'placa', 'veiculo', 'servico',
     'valor_mao_obra', 'valor_pecas', 'valor_total', 'observacao']
     .forEach(id => document.getElementById(id).value = '');
    document.getElementById('status').value = 'ABERTA';
}

function cancelarEdicao() {
    osEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Novo Orçamento';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Orçamento';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarOS() {
    const { data, error } = await clienteSupabase
        .from('ordens_servico')
        .select('*')
        .order('id', { ascending: false });

    if (error) { console.log(error); return; }

    osCarregadas = data || [];
    renderizarOS(osCarregadas);
}

function filtrarOS(status) {
    filtroAtual = status;
    pesquisarOS();
}

function pesquisarOS() {
    const texto = (document.getElementById('pesquisa-os').value || '').toLowerCase();

    let filtrados = osCarregadas;

    if (filtroAtual !== 'TODOS') {
        filtrados = filtrados.filter(os => os.status === filtroAtual);
    }

    if (texto) {
        filtrados = filtrados.filter(os =>
            (os.cliente_nome || '').toLowerCase().includes(texto) ||
            (os.placa || '').toLowerCase().includes(texto) ||
            (os.servico || '').toLowerCase().includes(texto)
        );
    }

    renderizarOS(filtrados);
}

function renderizarOS(lista) {
    const container = document.getElementById('lista-os');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;">Nenhum orçamento encontrado.</p>';
        return;
    }

    lista.forEach(os => {
        let corStatus = '#6b7280';
        let iconeStatus = '📋';
        if (os.status === 'ABERTA')           { corStatus = '#f59e0b'; iconeStatus = '🟡'; }
        if (os.status === 'EM ANDAMENTO')     { corStatus = '#3b82f6'; iconeStatus = '🔵'; }
        if (os.status === 'AGUARDANDO PEÇAS') { corStatus = '#ef4444'; iconeStatus = '🔴'; }
        if (os.status === 'FINALIZADA')       { corStatus = '#10b981'; iconeStatus = '🟢'; }

        container.innerHTML += `
        <div class="card" style="border-left:4px solid ${corStatus};">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
                <div>
                    <h3 style="margin:0 0 4px;">📋 Orçamento #${os.id} — ${os.cliente_nome || ''}</h3>
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                        ${os.placa ? `🚗 ${os.placa}` : ''} ${os.veiculo ? `• ${os.veiculo}` : ''} ${os.telefone ? `• 📞 ${os.telefone}` : ''}
                    </p>
                </div>
                <span style="color:${corStatus};font-weight:bold;">${iconeStatus} ${os.status}</span>
            </div>

            <p style="margin:10px 0 4px;">🔧 ${os.servico || '-'}</p>

            <div style="display:flex;gap:15px;flex-wrap:wrap;margin:10px 0;">
                <div style="background:#f9fafb;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">MÃO DE OBRA</p>
                    <p style="margin:2px 0 0;font-weight:bold;">R$ ${Number(os.valor_mao_obra || 0).toFixed(2)}</p>
                </div>
                <div style="background:#f9fafb;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">PEÇAS</p>
                    <p style="margin:2px 0 0;font-weight:bold;">R$ ${Number(os.valor_pecas || 0).toFixed(2)}</p>
                </div>
                <div style="background:#f0fdf4;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">TOTAL</p>
                    <p style="margin:2px 0 0;font-weight:bold;color:#10b981;font-size:16px;">R$ ${Number(os.valor_total || 0).toFixed(2)}</p>
                </div>
            </div>

            ${os.observacao ? `<p style="color:#6b7280;font-size:13px;margin:0 0 10px;">💬 ${os.observacao}</p>` : ''}

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button onclick="editarOS(${os.id})">✏️ Editar</button>
                ${os.status !== 'FINALIZADA' ? `<button onclick="finalizarOS(${os.id})" style="background:#10b981;">✅ Finalizar</button>` : ''}
                <button onclick="gerarPDFIndividual(${os.id})" style="background:#8b5cf6;">📄 PDF</button>
                <button onclick="excluirOS(${os.id})" style="background:#ef4444;">🗑️ Excluir</button>
            </div>
        </div>`;
    });
}

async function editarOS(id) {
    const os = osCarregadas.find(o => o.id === id);
    if (!os) return;

    osEditando = id;

    document.getElementById('cliente_nome').value = os.cliente_nome || '';
    document.getElementById('telefone').value = os.telefone || '';
    document.getElementById('placa').value = os.placa || '';
    document.getElementById('veiculo').value = os.veiculo || '';
    document.getElementById('servico').value = os.servico || '';
    document.getElementById('valor_mao_obra').value = os.valor_mao_obra || '';
    document.getElementById('valor_pecas').value = os.valor_pecas || '';
    document.getElementById('valor_total').value = os.valor_total || '';
    document.getElementById('status').value = os.status || 'ABERTA';
    document.getElementById('observacao').value = os.observacao || '';

    document.getElementById('titulo-form').textContent = '✏️ Editando Orçamento';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function finalizarOS(id) {
    const { error } = await clienteSupabase
        .from('ordens_servico')
        .update({ status: 'FINALIZADA' })
        .eq('id', id);

    if (error) { alert('Erro ao finalizar'); return; }
    carregarOS();
}

async function excluirOS(id) {
    if (!confirm('Deseja excluir este orçamento?')) return;

    const { error } = await clienteSupabase
        .from('ordens_servico')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }
    carregarOS();
}

function carregarImagemBase64(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = function() { resolve(null); };
        img.src = url;
    });
}

async function gerarPDFIndividual(id) {
    const { data: os } = await clienteSupabase
        .from('ordens_servico')
        .select('*')
        .eq('id', id)
        .single();

    if (!os) return;

    const doc = new jspdf.jsPDF();
    const hoje = new Date().toLocaleDateString('pt-BR');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');

    const logoBase64 = await carregarImagemBase64('../img/logo-batalhao.jpeg');
    if (logoBase64) doc.addImage(logoBase64, 'JPEG', 12, 3, 28, 28);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('BATALHÃO DOS PNEUS', 46, 16);
    doc.setFontSize(10);
    doc.text('Brasília - DF', 46, 24);
    doc.setFontSize(9);
    doc.text('Especialista em Pneus e Serviços Automotivos', 46, 31);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(16);
    doc.text(`ORÇAMENTO Nº ${os.id}`, 15, 50);
    doc.setFontSize(10);
    doc.text(`Data: ${hoje}`, 160, 50);

    doc.roundedRect(10, 58, 190, 32, 3, 3);
    doc.setFontSize(12);
    doc.text('DADOS DO CLIENTE', 15, 66);
    doc.setFontSize(10);
    doc.text(`Cliente: ${os.cliente_nome || ''}`, 15, 75);
    doc.text(`Telefone: ${os.telefone || ''}`, 15, 83);

    doc.roundedRect(10, 97, 190, 28, 3, 3);
    doc.setFontSize(12);
    doc.text('DADOS DO VEÍCULO', 15, 105);
    doc.setFontSize(10);
    doc.text(`Placa: ${os.placa || ''}`, 15, 114);
    doc.text(`Veículo: ${os.veiculo || ''}`, 90, 114);

    doc.roundedRect(10, 132, 190, 35, 3, 3);
    doc.setFontSize(12);
    doc.text('SERVIÇO EXECUTADO', 15, 140);
    doc.setFontSize(10);
    doc.text(os.servico || '', 15, 150);

    doc.roundedRect(10, 174, 190, 38, 3, 3);
    doc.setFontSize(12);
    doc.text('RESUMO FINANCEIRO', 15, 182);
    doc.setFontSize(10);
    doc.text(`Mão de Obra: R$ ${Number(os.valor_mao_obra || 0).toFixed(2)}`, 15, 192);
    doc.text(`Peças: R$ ${Number(os.valor_pecas || 0).toFixed(2)}`, 15, 200);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`TOTAL: R$ ${Number(os.valor_total || 0).toFixed(2)}`, 120, 197);
    doc.setTextColor(0, 0, 0);

    doc.roundedRect(10, 220, 190, 25, 3, 3);
    doc.setFontSize(12);
    doc.text('OBSERVAÇÕES', 15, 228);
    doc.setFontSize(10);
    doc.text(os.observacao || '-', 15, 237);

    doc.line(20, 265, 90, 265);
    doc.text('Assinatura do Cliente', 25, 272);
    doc.line(120, 265, 190, 265);
    doc.text('Responsável Técnico', 128, 272);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Batalhão dos Pneus - Brasília/DF', 68, 285);

    doc.save(`Orcamento-${os.id}.pdf`);
}

carregarOS();