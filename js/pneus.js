const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let pneuEditando = null;
let pneusCarregados = [];
let filtroAtual = 'todos';

async function salvarPneu() {
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();
    const medida = document.getElementById('medida').value.trim();
    const tipo = document.getElementById('tipo').value.trim();
    const preco_compra = Number(document.getElementById('preco_compra').value);
    const preco_venda = Number(document.getElementById('preco_venda').value);
    const quantidade = Number(document.getElementById('quantidade').value);
    const estoque_minimo = Number(document.getElementById('estoque_minimo').value) || 2;

    if (!marca) { alert('Informe a marca'); return; }
    if (!modelo) { alert('Informe o modelo'); return; }
    if (!preco_venda) { alert('Informe o preço de venda'); return; }

    if (pneuEditando) {
        const { error } = await clienteSupabase
            .from('pneus')
            .update({ marca, modelo, medida, tipo, preco_compra, preco_venda, quantidade, estoque_minimo })
            .eq('id', pneuEditando);

        if (error) { alert('Erro ao atualizar pneu'); return; }

        alert('✅ Pneu atualizado!');
        pneuEditando = null;
        cancelarEdicao();

    } else {
        const { error } = await clienteSupabase
            .from('pneus')
            .insert([{ marca, modelo, medida, tipo, preco_compra, preco_venda, quantidade, estoque_minimo, ativo: true }]);

        if (error) { alert('Erro ao salvar pneu'); return; }
        alert('✅ Pneu cadastrado com sucesso!');
    }

    limparCampos();
    carregarPneus();
}

function limparCampos() {
    ['marca', 'modelo', 'medida', 'tipo', 'preco_compra', 'preco_venda', 'quantidade', 'estoque_minimo']
        .forEach(id => document.getElementById(id).value = '');
}

function cancelarEdicao() {
    pneuEditando = null;
    limparCampos();
    document.getElementById('titulo-form').textContent = 'Cadastrar Pneu';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Pneu';
    document.getElementById('btn-cancelar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarPneus() {
    const { data, error } = await clienteSupabase
        .from('pneus')
        .select('*')
        .eq('ativo', true)
        .order('marca', { ascending: true });

    if (error) { console.log(error); return; }

    pneusCarregados = data || [];
    renderizarPneus(pneusCarregados);
}

function filtrarEstoque(filtro) {
    filtroAtual = filtro;
    pesquisarPneu();
}

function pesquisarPneu() {
    const texto = (document.getElementById('pesquisa-pneu').value || '').toLowerCase();

    let filtrados = pneusCarregados;

    if (filtroAtual === 'baixo') {
        filtrados = filtrados.filter(p => Number(p.quantidade) <= Number(p.estoque_minimo || 2));
    } else if (filtroAtual === 'ok') {
        filtrados = filtrados.filter(p => Number(p.quantidade) > Number(p.estoque_minimo || 2));
    }

    if (texto) {
        filtrados = filtrados.filter(p =>
            (p.marca || '').toLowerCase().includes(texto) ||
            (p.modelo || '').toLowerCase().includes(texto) ||
            (p.medida || '').toLowerCase().includes(texto) ||
            (p.tipo || '').toLowerCase().includes(texto)
        );
    }

    renderizarPneus(filtrados);
}

function renderizarPneus(lista) {
    const container = document.getElementById('lista-pneus');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;">Nenhum pneu encontrado.</p>';
        return;
    }

    lista.forEach(pneu => {
        const estoqueBaixo = Number(pneu.quantidade) <= Number(pneu.estoque_minimo || 2);
        const margem = Number(pneu.preco_venda) - Number(pneu.preco_compra);
        const margemPct = pneu.preco_compra > 0
            ? ((margem / Number(pneu.preco_compra)) * 100).toFixed(0)
            : 0;

        container.innerHTML += `
        <div class="card" style="${estoqueBaixo ? 'border-left:4px solid #ef4444;' : 'border-left:4px solid #10b981;'}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
                <div>
                    <h3 style="margin:0 0 4px;font-size:18px;">${pneu.marca} ${pneu.modelo}</h3>
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                        📐 ${pneu.medida || '-'} • 🏷️ ${pneu.tipo || '-'}
                    </p>
                </div>
                <div style="text-align:right;">
                    <p style="margin:0;font-size:24px;font-weight:bold;color:${estoqueBaixo ? '#ef4444' : '#10b981'};">
                        ${pneu.quantidade} un.
                    </p>
                    <p style="margin:2px 0 0;font-size:11px;color:${estoqueBaixo ? '#ef4444' : '#10b981'};font-weight:bold;">
                        ${estoqueBaixo ? '⚠️ ESTOQUE BAIXO' : '✅ ESTOQUE OK'}
                    </p>
                </div>
            </div>

            <div style="display:flex;gap:20px;margin:12px 0;flex-wrap:wrap;">
                <div style="background:#f0fdf4;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">COMPRA</p>
                    <p style="margin:2px 0 0;font-weight:bold;color:#374151;">R$ ${Number(pneu.preco_compra || 0).toFixed(2)}</p>
                </div>
                <div style="background:#eff6ff;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">VENDA</p>
                    <p style="margin:2px 0 0;font-weight:bold;color:#374151;">R$ ${Number(pneu.preco_venda || 0).toFixed(2)}</p>
                </div>
                <div style="background:#faf5ff;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">MARGEM</p>
                    <p style="margin:2px 0 0;font-weight:bold;color:#8b5cf6;">R$ ${margem.toFixed(2)} (${margemPct}%)</p>
                </div>
                <div style="background:#fff7ed;padding:8px 14px;border-radius:8px;">
                    <p style="margin:0;font-size:11px;color:#6b7280;">MÍN. ESTOQUE</p>
                    <p style="margin:2px 0 0;font-weight:bold;color:#f59e0b;">${pneu.estoque_minimo || 2} un.</p>
                </div>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button onclick="editarPneu(${pneu.id})">✏️ Editar</button>
                <button onclick="entradaEstoque(${pneu.id})" style="background:#10b981;">📦 Entrada</button>
                <button onclick="saidaEstoque(${pneu.id})" style="background:#f59e0b;">📤 Saída</button>
                <button onclick="inativarPneu(${pneu.id})" style="background:#ef4444;">🗑️ Inativar</button>
            </div>
        </div>`;
    });
}

async function editarPneu(id) {
    const pneu = pneusCarregados.find(p => p.id === id);
    if (!pneu) return;

    pneuEditando = id;

    document.getElementById('marca').value = pneu.marca || '';
    document.getElementById('modelo').value = pneu.modelo || '';
    document.getElementById('medida').value = pneu.medida || '';
    document.getElementById('tipo').value = pneu.tipo || '';
    document.getElementById('preco_compra').value = pneu.preco_compra || '';
    document.getElementById('preco_venda').value = pneu.preco_venda || '';
    document.getElementById('quantidade').value = pneu.quantidade || '';
    document.getElementById('estoque_minimo').value = pneu.estoque_minimo || '';

    document.getElementById('titulo-form').textContent = '✏️ Editando Pneu';
    document.getElementById('btn-salvar').textContent = '💾 Salvar Alterações';
    document.getElementById('btn-cancelar').style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function entradaEstoque(id) {
    const qtd = prompt('Quantidade para entrada no estoque:');
    if (!qtd || isNaN(qtd) || Number(qtd) <= 0) return;

    const pneu = pneusCarregados.find(p => p.id === id);
    if (!pneu) return;

    const novaQtd = Number(pneu.quantidade) + Number(qtd);

    const { error } = await clienteSupabase
        .from('pneus')
        .update({ quantidade: novaQtd })
        .eq('id', id);

    if (error) { alert('Erro ao atualizar estoque'); return; }

    alert(`✅ Entrada de ${qtd} unidades registrada!`);
    carregarPneus();
}

async function saidaEstoque(id) {
    const qtd = prompt('Quantidade para saída do estoque:');
    if (!qtd || isNaN(qtd) || Number(qtd) <= 0) return;

    const pneu = pneusCarregados.find(p => p.id === id);
    if (!pneu) return;

    const novaQtd = Number(pneu.quantidade) - Number(qtd);

    if (novaQtd < 0) { alert('Estoque insuficiente!'); return; }

    const { error } = await clienteSupabase
        .from('pneus')
        .update({ quantidade: novaQtd })
        .eq('id', id);

    if (error) { alert('Erro ao atualizar estoque'); return; }

    alert(`✅ Saída de ${qtd} unidades registrada!`);
    carregarPneus();
}

async function inativarPneu(id) {
    if (!confirm('Deseja inativar este pneu? Ele não aparecerá mais no estoque.')) return;

    const { error } = await clienteSupabase
        .from('pneus')
        .update({ ativo: false })
        .eq('id', id);

    if (error) { alert('Erro ao inativar'); return; }

    alert('Pneu inativado!');
    carregarPneus();
}

carregarPneus();