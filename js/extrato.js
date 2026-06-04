const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hojeStr() {
    return new Date().toISOString().split('T')[0];
}

function buscarHoje() {
    const hoje = hojeStr();
    document.getElementById('data-inicio').value = hoje;
    document.getElementById('data-fim').value = hoje;
    buscarExtrato();
}

function buscarMesAtual() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('data-inicio').value = inicio;
    document.getElementById('data-fim').value = hojeStr();
    buscarExtrato();
}

function buscarMesAnterior() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().split('T')[0];
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0).toISOString().split('T')[0];
    document.getElementById('data-inicio').value = inicio;
    document.getElementById('data-fim').value = fim;
    buscarExtrato();
}

async function buscarExtrato() {
    const inicio = document.getElementById('data-inicio').value;
    const fim = document.getElementById('data-fim').value;

    if (!inicio || !fim) { alert('Selecione as datas'); return; }

    // CAIXA
    const { data: caixa } = await clienteSupabase
        .from('caixa')
        .select('*')
        .gte('data_movimento', inicio)
        .lte('data_movimento', fim)
        .order('data_movimento', { ascending: false });

    // LUCRO DAS VENDAS NO PERÍODO
    const { data: vendas } = await clienteSupabase
        .from('vendas')
        .select('lucro, tipo, data_venda')
        .gte('data_venda', inicio)
        .lte('data_venda', fim);

    const lucroTotal = (vendas || [])
        .reduce((total, v) => total + Number(v.lucro || 0), 0);

    renderizarResumo(caixa || [], lucroTotal, inicio, fim);
    renderizarLista(caixa || []);
}

function renderizarResumo(lista, lucroTotal, inicio, fim) {
    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {
        if (item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if (item.tipo === 'SAIDA') saidas += Number(item.valor);
    });

    const saldo = entradas - saidas;
    const inicioF = inicio.split('-').reverse().join('/');
    const fimF = fim.split('-').reverse().join('/');

    document.getElementById('resumo-extrato').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:25px;">

        <div style="background:#f0fdf4;padding:16px;border-radius:10px;border-left:4px solid #10b981;">
            <p style="margin:0;font-size:11px;color:#6b7280;">ENTRADAS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#10b981;">R$ ${entradas.toFixed(2)}</p>
        </div>

        <div style="background:#fef2f2;padding:16px;border-radius:10px;border-left:4px solid #ef4444;">
            <p style="margin:0;font-size:11px;color:#6b7280;">SAÍDAS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#ef4444;">R$ ${saidas.toFixed(2)}</p>
        </div>

        <div style="background:#eff6ff;padding:16px;border-radius:10px;border-left:4px solid #3b82f6;">
            <p style="margin:0;font-size:11px;color:#6b7280;">SALDO</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:${saldo >= 0 ? '#3b82f6' : '#ef4444'};">R$ ${saldo.toFixed(2)}</p>
        </div>

        <div style="background:#faf5ff;padding:16px;border-radius:10px;border-left:4px solid #8b5cf6;">
            <p style="margin:0;font-size:11px;color:#6b7280;">LUCRO REAL</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:${lucroTotal >= 0 ? '#8b5cf6' : '#ef4444'};">R$ ${lucroTotal.toFixed(2)}</p>
        </div>

        <div style="background:#fff7ed;padding:16px;border-radius:10px;border-left:4px solid #f59e0b;">
            <p style="margin:0;font-size:11px;color:#6b7280;">LANÇAMENTOS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#f59e0b;">${lista.length}</p>
        </div>

    </div>

    <p style="color:#6b7280;font-size:13px;margin-bottom:15px;">
        📅 Período: <strong>${inicioF}</strong> até <strong>${fimF}</strong>
    </p>

    <h2>Movimentações</h2>`;
}

function renderizarLista(lista) {
    const div = document.getElementById('lista-extrato');
    div.innerHTML = '';

    if (lista.length === 0) {
        div.innerHTML = '<p style="color:#6b7280;">Nenhuma movimentação encontrada neste período.</p>';
        return;
    }

    lista.forEach(item => {
        const cor = item.tipo === 'ENTRADA' ? '#10b981' : '#ef4444';
        const bg = item.tipo === 'ENTRADA' ? '#f0fdf4' : '#fef2f2';
        const dataF = item.data_movimento
            ? item.data_movimento.split('-').reverse().join('/')
            : '-';

        div.innerHTML += `
        <div class="card" style="border-left:4px solid ${cor};">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <span style="background:${bg};color:${cor};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">
                        ${item.tipo}
                    </span>
                    <p style="margin:6px 0 0;font-weight:600;">${item.descricao}</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">${item.forma_pagamento}</p>
                </div>
                <div style="text-align:right;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:${cor};">R$ ${Number(item.valor).toFixed(2)}</p>
                    <p style="margin:2px 0 0;color:#6b7280;font-size:12px;">📅 ${dataF}</p>
                </div>
            </div>
        </div>`;
    });
}

buscarMesAtual();