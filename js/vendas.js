const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let vendasCarregadas = [];
let pneusCarregados = [];
let servicosCarregados = [];

function hojeStr() {
    return new Date().toISOString().split('T')[0];
}

// ALTERNA ENTRE PNEU E SERVIÇO
function alternarTipo() {
    const tipo = document.getElementById('tipo_venda').value;
    document.getElementById('campos-pneu').style.display = tipo === 'pneu' ? 'block' : 'none';
    document.getElementById('campos-servico').style.display = tipo === 'servico' ? 'block' : 'none';
}

// CARREGA PNEUS NO SELECT
async function carregarPneus() {
    const { data } = await clienteSupabase
        .from('pneus')
        .select('*')
        .eq('ativo', true)
        .gt('quantidade', 0)
        .order('marca');

    pneusCarregados = data || [];

    const select = document.getElementById('pneu_id');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o Pneu</option>';
    pneusCarregados.forEach(pneu => {
        select.innerHTML += `
        <option value="${pneu.id}"
            data-preco="${pneu.preco_venda}"
            data-custo="${pneu.preco_compra}">
            ${pneu.marca} ${pneu.modelo} - ${pneu.medida} | Estoque: ${pneu.quantidade} | R$ ${Number(pneu.preco_venda).toFixed(2)}
        </option>`;
    });
}

// PREENCHE VALOR AO SELECIONAR PNEU
function preencherValorPneu() {
    const select = document.getElementById('pneu_id');
    const option = select.options[select.selectedIndex];
    const preco = option.getAttribute('data-preco') || 0;
    const qtd = Number(document.getElementById('quantidade').value) || 1;
    document.getElementById('valor_total').value = (Number(preco) * qtd).toFixed(2);
    calcularTotalPneu();
}

// CALCULA TOTAL E LUCRO AO MUDAR QUANTIDADE
function calcularTotalPneu() {
    const select = document.getElementById('pneu_id');
    const option = select.options[select.selectedIndex];
    const preco = Number(option.getAttribute('data-preco')) || 0;
    const custo = Number(option.getAttribute('data-custo')) || 0;
    const qtd = Number(document.getElementById('quantidade').value) || 0;

    const total = preco * qtd;
    const lucro = (preco - custo) * qtd;

    document.getElementById('valor_total').value = total.toFixed(2);
    document.getElementById('info-lucro').textContent =
        qtd > 0 ? `💡 Lucro estimado: R$ ${lucro.toFixed(2)}` : '';
}

// CARREGA SERVIÇOS NO SELECT
async function carregarServicos() {
    const { data } = await clienteSupabase
        .from('servicos')
        .select('*')
        .order('nome');

    servicosCarregados = data || [];

    const select = document.getElementById('servico_id');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione o Serviço</option>';
    servicosCarregados.forEach(s => {
        select.innerHTML += `
        <option value="${s.id}" data-valor="${s.valor || 0}">
            ${s.nome} ${s.valor ? '- R$ ' + Number(s.valor).toFixed(2) : ''}
        </option>`;
    });
}

// PREENCHE VALOR AO SELECIONAR SERVIÇO
function preencherValorServico() {
    const select = document.getElementById('servico_id');
    const option = select.options[select.selectedIndex];
    const valor = option.getAttribute('data-valor') || 0;
    document.getElementById('valor_servico').value = Number(valor).toFixed(2);
}

// SALVAR VENDA OU SERVIÇO
async function salvarVenda() {
    const tipo = document.getElementById('tipo_venda').value;
    const cliente = document.getElementById('cliente').value.trim();
    const forma_pagamento = document.getElementById('forma_pagamento').value;
    const observacao = document.getElementById('observacao').value;

    if (!cliente) { alert('Informe o nome do cliente'); return; }

    if (tipo === 'pneu') {
        await salvarVendaPneu(cliente, forma_pagamento, observacao);
    } else {
        await salvarVendaServico(cliente, forma_pagamento, observacao);
    }
}

async function salvarVendaPneu(cliente, forma_pagamento, observacao) {
    const pneu_id = document.getElementById('pneu_id').value;
    const quantidade = Number(document.getElementById('quantidade').value);
    const valor_total = Number(document.getElementById('valor_total').value);

    if (!pneu_id) { alert('Selecione um pneu'); return; }
    if (!quantidade || quantidade < 1) { alert('Informe a quantidade'); return; }
    if (!valor_total) { alert('Informe o valor total'); return; }

    const pneu = pneusCarregados.find(p => p.id == pneu_id);
    if (!pneu) { alert('Pneu não encontrado'); return; }
    if (quantidade > Number(pneu.quantidade)) { alert('Estoque insuficiente! Disponível: ' + pneu.quantidade); return; }

    const lucro = (Number(pneu.preco_venda) - Number(pneu.preco_compra)) * quantidade;

    // REGISTRA NO CAIXA
    const { data: caixaData, error: caixaErro } = await clienteSupabase
        .from('caixa')
        .insert([{
            tipo: 'ENTRADA',
            descricao: `Venda de Pneu - ${cliente} (${pneu.marca} ${pneu.modelo})`,
            valor: valor_total,
            forma_pagamento,
            data_movimento: hojeStr()
        }])
        .select()
        .single();

    if (caixaErro) { alert('Erro ao registrar no caixa'); return; }

    // REGISTRA VENDA
    const { error } = await clienteSupabase
        .from('vendas')
        .insert([{
            cliente,
            pneu_id,
            pneu_nome: `${pneu.marca} ${pneu.modelo}`,
            quantidade,
            valor_total,
            lucro: lucro.toFixed(2),
            forma_pagamento,
            status: 'FINALIZADA',
            observacao,
            data_venda: hojeStr(),
            caixa_id: caixaData.id,
            tipo: 'pneu'
        }]);

    if (error) { alert('Erro ao salvar venda'); return; }

    // SUBTRAI ESTOQUE
    await clienteSupabase
        .from('pneus')
        .update({ quantidade: Number(pneu.quantidade) - quantidade })
        .eq('id', pneu_id);

    alert('✅ Venda registrada com sucesso!');
    limparCampos();
    carregarPneus();
    carregarVendas();
}

async function salvarVendaServico(cliente, forma_pagamento, observacao) {
    const servico_id = document.getElementById('servico_id').value;
    const valor_total = Number(document.getElementById('valor_servico').value);

    if (!servico_id) { alert('Selecione um serviço'); return; }
    if (!valor_total) { alert('Informe o valor cobrado'); return; }

    const servico = servicosCarregados.find(s => s.id == servico_id);

    // REGISTRA NO CAIXA
    const { data: caixaData, error: caixaErro } = await clienteSupabase
        .from('caixa')
        .insert([{
            tipo: 'ENTRADA',
            descricao: `Serviço - ${servico ? servico.nome : ''} - ${cliente}`,
            valor: valor_total,
            forma_pagamento,
            data_movimento: hojeStr()
        }])
        .select()
        .single();

    if (caixaErro) { alert('Erro ao registrar no caixa'); return; }

    // REGISTRA VENDA
    const { error } = await clienteSupabase
        .from('vendas')
        .insert([{
            cliente,
            pneu_nome: servico ? servico.nome : 'Serviço',
            quantidade: 1,
            valor_total,
            lucro: valor_total,
            forma_pagamento,
            status: 'FINALIZADA',
            observacao,
            data_venda: hojeStr(),
            caixa_id: caixaData.id,
            tipo: 'servico'
        }]);

    if (error) { alert('Erro ao salvar serviço'); return; }

    alert('✅ Serviço registrado com sucesso!');
    limparCampos();
    carregarVendas();
}

function limparCampos() {
    document.getElementById('cliente').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('valor_total').value = '';
    document.getElementById('valor_servico').value = '';
    document.getElementById('observacao').value = '';
    document.getElementById('info-lucro').textContent = '';
    document.getElementById('pneu_id').selectedIndex = 0;
    document.getElementById('servico_id').selectedIndex = 0;
}

// CARREGA HISTÓRICO
async function carregarVendas() {
    const { data, error } = await clienteSupabase
        .from('vendas')
        .select('*')
        .order('id', { ascending: false });

    if (error) { console.log(error); return; }

    vendasCarregadas = data;
    renderizarVendas(data);
}

function renderizarVendas(lista) {
    const div = document.getElementById('lista-vendas');
    div.innerHTML = '';

    if (lista.length === 0) {
        div.innerHTML = '<p>Nenhuma venda encontrada.</p>';
        return;
    }

    lista.forEach(venda => {
        const icone = venda.tipo === 'servico' ? '🔧' : '🛞';
        const dataFormatada = venda.data_venda
            ? venda.data_venda.split('-').reverse().join('/')
            : '-';

        div.innerHTML += `
        <div class="card">
            <div style="display:flex;justify-content:space-between;">
                <h3>${icone} ${venda.cliente}</h3>
                <span style="color:#6b7280;font-size:13px;">${dataFormatada}</span>
            </div>
            <p>${venda.pneu_nome || ''} ${venda.quantidade > 1 ? '× ' + venda.quantidade : ''}</p>
            <p><strong>R$ ${Number(venda.valor_total || 0).toFixed(2)}</strong>
               ${venda.lucro ? `<span style="color:green;margin-left:10px;">Lucro: R$ ${Number(venda.lucro).toFixed(2)}</span>` : ''}
            </p>
            <p style="color:#6b7280;">${venda.forma_pagamento}</p>
            <button onclick="excluirVenda(${venda.id})">🗑️ Excluir</button>
        </div>`;
    });
}

function filtrarVendas() {
    const texto = document.getElementById('pesquisa').value.toLowerCase();
    const resultado = vendasCarregadas.filter(v =>
        (v.cliente || '').toLowerCase().includes(texto)
    );
    renderizarVendas(resultado);
}

async function excluirVenda(id) {
    if (!confirm('Excluir esta venda?')) return;

    const { data: venda } = await clienteSupabase
        .from('vendas')
        .select('*')
        .eq('id', id)
        .single();

    if (!venda) return;

    // DEVOLVE ESTOQUE SE FOR PNEU
    if (venda.tipo === 'pneu' && venda.pneu_id) {
        const { data: pneu } = await clienteSupabase
            .from('pneus')
            .select('quantidade')
            .eq('id', venda.pneu_id)
            .single();

        if (pneu) {
            await clienteSupabase
                .from('pneus')
                .update({ quantidade: Number(pneu.quantidade) + Number(venda.quantidade) })
                .eq('id', venda.pneu_id);
        }
    }

    // REMOVE DO CAIXA
    if (venda.caixa_id) {
        await clienteSupabase.from('caixa').delete().eq('id', venda.caixa_id);
    }

    await clienteSupabase.from('vendas').delete().eq('id', id);

    alert('Venda excluída');
    carregarPneus();
    carregarVendas();
}

carregarPneus();
carregarServicos();
carregarVendas();