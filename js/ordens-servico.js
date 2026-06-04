const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let osEditando = null;

function calcularTotal() {
    const maoObra = Number(document.getElementById('valor_mao_obra').value) || 0;
    const pecas = Number(document.getElementById('valor_pecas').value) || 0;
    document.getElementById('valor_total').value = (maoObra + pecas).toFixed(2);
}

async function salvarOS() {
    const cliente_nome = document.getElementById('cliente_nome').value;
    const telefone = document.getElementById('telefone').value;
    const placa = document.getElementById('placa').value;
    const veiculo = document.getElementById('veiculo').value;
    const servico = document.getElementById('servico').value;
    const valor_mao_obra = Number(document.getElementById('valor_mao_obra').value);
    const valor_pecas = Number(document.getElementById('valor_pecas').value);
    const valor_total = Number(document.getElementById('valor_total').value);
    const status = document.getElementById('status').value;
    const observacao = document.getElementById('observacao').value;

    if(osEditando) {
        const { error } = await clienteSupabase
            .from('ordens_servico')
            .update({cliente_nome, telefone, placa, veiculo, servico,
                     valor_mao_obra, valor_pecas, valor_total, status, observacao})
            .eq('id', osEditando);

        if(error){ alert('Erro ao atualizar OS'); return; }

        alert('OS atualizada com sucesso');
        osEditando = null;
        limparCampos();
        carregarOS();
        return;
    }

    const { error } = await clienteSupabase
        .from('ordens_servico')
        .insert([{cliente_nome, telefone, placa, veiculo, servico,
                  valor_mao_obra, valor_pecas, valor_total, status, observacao}]);

    if(error){ alert('Erro ao salvar OS'); return; }

    alert('OS salva com sucesso');
    limparCampos();
    carregarOS();
}

function limparCampos() {
    ['cliente_nome','telefone','placa','veiculo','servico',
     'valor_mao_obra','valor_pecas','valor_total','status','observacao']
     .forEach(id => document.getElementById(id).value = '');
}

async function carregarOS() {
    const { data, error } = await clienteSupabase
        .from('ordens_servico')
        .select('*')
        .order('id', {ascending:false});

    if(error){ console.log(error); return; }

    const lista = document.getElementById('lista-os');
    lista.innerHTML = '';

    data.forEach(os=>{
        let corStatus = 'black';
        if(os.status === 'ABERTA') corStatus = 'orange';
        else if(os.status === 'FINALIZADA') corStatus = 'green';
        else if(os.status === 'EM ANDAMENTO') corStatus = 'blue';
        else if(os.status === 'AGUARDANDO PEÇAS') corStatus = 'red';

        lista.innerHTML += `
        <div class="card os-card">
            <h3>📋 ORÇAMENTO #${os.id}</h3>
            <p>Telefone: ${os.telefone}</p>
            <p>Placa: ${os.placa}</p>
            <p>Veículo: ${os.veiculo}</p>
            <p>Serviço: ${os.servico}</p>
            <p>Mão de Obra: R$ ${os.valor_mao_obra}</p>
            <p>Peças: R$ ${os.valor_pecas}</p>
            <p>Total: R$ ${os.valor_total}</p>
            <p style="font-weight:bold;color:${corStatus};">${os.status}</p>
            <button onclick="editarOS(${os.id})">✏️ Editar</button>
            <button onclick="finalizarOS(${os.id})">✅ Finalizar</button>
            <button onclick="excluirOS(${os.id})">🗑️ Excluir</button>
            <button onclick="gerarPDFIndividual(${os.id})">📄 PDF</button>
        </div>`;
    });
}

async function editarOS(id) {
    const { data } = await clienteSupabase
        .from('ordens_servico')
        .select('*')
        .eq('id', id)
        .single();

    if(!data) return;

    osEditando = id;

    ['cliente_nome','telefone','placa','veiculo','servico',
     'valor_mao_obra','valor_pecas','valor_total','status','observacao']
     .forEach(key => document.getElementById(key).value = data[key] || '');

    window.scrollTo({top:0, behavior:'smooth'});
}

async function finalizarOS(id) {
    const { error } = await clienteSupabase
        .from('ordens_servico')
        .update({status:'FINALIZADA'})
        .eq('id', id);

    if(error){ alert('Erro ao finalizar OS'); return; }
    carregarOS();
}

async function excluirOS(id){
    if(!confirm('Deseja excluir esta OS?')) return;

    const { error } = await clienteSupabase
        .from('ordens_servico')
        .delete()
        .eq('id', id);

    if(error){ alert('Erro ao excluir OS'); return; }
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
        img.onerror = function() {
            resolve(null);
        };
        img.src = url;
    });
}

async function gerarPDFIndividual(id){

    const { data: os } = await clienteSupabase
        .from('ordens_servico')
        .select('*')
        .eq('id', id)
        .single();

    if(!os) return;

    const doc = new jspdf.jsPDF();
    const hoje = new Date().toLocaleDateString('pt-BR');

    /* CABEÇALHO */
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');

    /* LOGO */
    const logoBase64 = await carregarImagemBase64('../img/logo-batalhao.jpeg');
    if(logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 12, 3, 28, 28);
    }

    /* NOME DA EMPRESA */
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('BATALHÃO DOS PNEUS', 46, 16);
    doc.setFontSize(10);
    doc.text('Brasília - DF', 46, 24);
    doc.setFontSize(9);
    doc.text('Especialista em Pneus e Serviços Automotivos', 46, 31);

    doc.setTextColor(0, 0, 0);

    /* TÍTULO */
    doc.setFontSize(16);
    doc.text(`ORÇAMENTO Nº ${os.id}`, 15, 50);
    doc.setFontSize(10);
    doc.text(`Data: ${hoje}`, 160, 50);

    /* CLIENTE */
    doc.roundedRect(10, 58, 190, 32, 3, 3);
    doc.setFontSize(12);
    doc.text('DADOS DO CLIENTE', 15, 66);
    doc.setFontSize(10);
    doc.text(`Cliente: ${os.cliente_nome || ''}`, 15, 75);
    doc.text(`Telefone: ${os.telefone || ''}`, 15, 83);

    /* VEÍCULO */
    doc.roundedRect(10, 97, 190, 28, 3, 3);
    doc.setFontSize(12);
    doc.text('DADOS DO VEÍCULO', 15, 105);
    doc.setFontSize(10);
    doc.text(`Placa: ${os.placa || ''}`, 15, 114);
    doc.text(`Veículo: ${os.veiculo || ''}`, 90, 114);

    /* SERVIÇO */
    doc.roundedRect(10, 132, 190, 35, 3, 3);
    doc.setFontSize(12);
    doc.text('SERVIÇO EXECUTADO', 15, 140);
    doc.setFontSize(10);
    doc.text(os.servico || '', 15, 150);

    /* FINANCEIRO */
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

    /* OBSERVAÇÕES */
    doc.roundedRect(10, 220, 190, 25, 3, 3);
    doc.setFontSize(12);
    doc.text('OBSERVAÇÕES', 15, 228);
    doc.setFontSize(10);
    doc.text(os.observacao || '-', 15, 237);

    /* ASSINATURAS */
    doc.line(20, 265, 90, 265);
    doc.text('Assinatura do Cliente', 25, 272);
    doc.line(120, 265, 190, 265);
    doc.text('Responsável Técnico', 128, 272);

    /* RODAPÉ */
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Batalhão dos Pneus - Brasília/DF', 68, 285);

    doc.save(`Orcamento-${os.id}.pdf`);
}

carregarOS();