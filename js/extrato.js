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

let dadosExtrato = [];
let lucroExtratoAtual = 0;
let periodoAtual = { inicio: '', fim: '' };

async function buscarExtrato() {
    const inicio = document.getElementById('data-inicio').value;
    const fim = document.getElementById('data-fim').value;

    if (!inicio || !fim) { alert('Selecione as datas'); return; }

    periodoAtual = { inicio, fim };

    const { data: caixa } = await clienteSupabase
        .from('caixa')
        .select('*')
        .gte('data_movimento', inicio)
        .lte('data_movimento', fim)
        .order('data_movimento', { ascending: false });

    const { data: vendas } = await clienteSupabase
        .from('vendas')
        .select('lucro')
        .gte('data_venda', inicio)
        .lte('data_venda', fim);

    lucroExtratoAtual = (vendas || [])
        .reduce((total, v) => total + Number(v.lucro || 0), 0);

    dadosExtrato = caixa || [];

    renderizarResumo(dadosExtrato, lucroExtratoAtual, inicio, fim);
    renderizarLista(dadosExtrato);
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
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">

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

    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
        <button onclick="imprimirRelatorio()" style="background:#3b82f6;">🖨️ Imprimir Relatório</button>
        <button onclick="limparPeriodo('${inicio}','${fim}')" style="background:#ef4444;">🗑️ Apagar Movimentações deste Período</button>
    </div>

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
                    <button onclick="excluirLancamento(${item.id})"
                        style="background:#ef4444;margin-top:6px;padding:4px 10px;font-size:12px;">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        </div>`;
    });
}

async function excluirLancamento(id) {
    if (!confirm('Excluir este lançamento?')) return;

    const { error } = await clienteSupabase
        .from('caixa')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }

    alert('✅ Lançamento excluído!');
    buscarExtrato();
}

async function limparPeriodo(inicio, fim) {
    const inicioF = inicio.split('-').reverse().join('/');
    const fimF = fim.split('-').reverse().join('/');

    const confirmar = confirm(
        `⚠️ ATENÇÃO!\n\nVocê vai apagar TODAS as movimentações de ${inicioF} até ${fimF}.\n\nCertifique-se de ter impresso o relatório antes!\n\nDeseja continuar?`
    );
    if (!confirmar) return;

    const confirmar2 = confirm('⚠️ Última confirmação! Esta ação NÃO pode ser desfeita. Tem certeza?');
    if (!confirmar2) return;

    const { error } = await clienteSupabase
        .from('caixa')
        .delete()
        .gte('data_movimento', inicio)
        .lte('data_movimento', fim);

    if (error) { alert('Erro ao apagar'); return; }

    alert('✅ Movimentações apagadas!');
    buscarExtrato();
}

function imprimirRelatorio() {
    const inicio = periodoAtual.inicio;
    const fim = periodoAtual.fim;
    const inicioF = inicio.split('-').reverse().join('/');
    const fimF = fim.split('-').reverse().join('/');

    let entradas = 0;
    let saidas = 0;
    dadosExtrato.forEach(item => {
        if (item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if (item.tipo === 'SAIDA') saidas += Number(item.valor);
    });
    const saldo = entradas - saidas;

    let linhas = '';
    dadosExtrato.forEach(item => {
        const dataF = item.data_movimento ? item.data_movimento.split('-').reverse().join('/') : '-';
        linhas += `
        <tr>
            <td>${dataF}</td>
            <td><span style="color:${item.tipo === 'ENTRADA' ? '#16a34a' : '#dc2626'};font-weight:bold;">${item.tipo}</span></td>
            <td>${item.descricao}</td>
            <td>${item.forma_pagamento}</td>
            <td style="text-align:right;font-weight:bold;color:${item.tipo === 'ENTRADA' ? '#16a34a' : '#dc2626'};">
                R$ ${Number(item.valor).toFixed(2)}
            </td>
        </tr>`;
    });

    const janela = window.open('', '_blank');
    janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro — ${inicioF} a ${fimF}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; font-family:Arial,sans-serif; }
            body { padding:30px; color:#111; }
            .header { background:#0f172a; color:white; padding:20px 25px; border-radius:10px; margin-bottom:25px; display:flex; justify-content:space-between; align-items:center; }
            .header h1 { font-size:22px; font-weight:900; letter-spacing:1px; }
            .header p { font-size:12px; opacity:0.7; margin-top:4px; }
            .header .periodo { text-align:right; }
            .header .periodo p { font-size:14px; opacity:1; color:#ff9800; font-weight:bold; }
            .resumo { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:25px; }
            .card-r { padding:14px; border-radius:8px; text-align:center; }
            .card-r p:first-child { font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:600; }
            .card-r p:last-child { font-size:18px; font-weight:bold; margin-top:4px; }
            table { width:100%; border-collapse:collapse; font-size:13px; }
            thead tr { background:#0f172a; color:white; }
            thead td { padding:10px 12px; font-weight:bold; }
            tbody tr:nth-child(even) { background:#f9fafb; }
            tbody td { padding:9px 12px; border-bottom:1px solid #e5e7eb; }
            .footer { margin-top:30px; text-align:center; color:#9ca3af; font-size:11px; border-top:1px solid #e5e7eb; padding-top:15px; }
            @media print {
                body { padding:15px; }
                button { display:none; }
            }
        </style>
    </head>
    <body>

        <div class="header">
            <div>
                <h1>BATALHÃO DOS PNEUS</h1>
                <p>Relatório Financeiro Mensal — LC Solutions ERP</p>
            </div>
            <div class="periodo">
                <p>${inicioF} até ${fimF}</p>
                <p style="font-size:11px;opacity:0.6;color:white;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>

        <div class="resumo">
            <div class="card-r" style="background:#f0fdf4;border-left:3px solid #16a34a;">
                <p>Entradas</p>
                <p style="color:#16a34a;">R$ ${entradas.toFixed(2)}</p>
            </div>
            <div class="card-r" style="background:#fef2f2;border-left:3px solid #dc2626;">
                <p>Saídas</p>
                <p style="color:#dc2626;">R$ ${saidas.toFixed(2)}</p>
            </div>
            <div class="card-r" style="background:#eff6ff;border-left:3px solid #2563eb;">
                <p>Saldo</p>
                <p style="color:${saldo >= 0 ? '#2563eb' : '#dc2626'};">R$ ${saldo.toFixed(2)}</p>
            </div>
            <div class="card-r" style="background:#faf5ff;border-left:3px solid #7c3aed;">
                <p>Lucro Real</p>
                <p style="color:#7c3aed;">R$ ${lucroExtratoAtual.toFixed(2)}</p>
            </div>
            <div class="card-r" style="background:#fff7ed;border-left:3px solid #d97706;">
                <p>Lançamentos</p>
                <p style="color:#d97706;">${dadosExtrato.length}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <td>Data</td>
                    <td>Tipo</td>
                    <td>Descrição</td>
                    <td>Pagamento</td>
                    <td style="text-align:right;">Valor</td>
                </tr>
            </thead>
            <tbody>
                ${linhas}
            </tbody>
        </table>

        <div class="footer">
            Batalhão dos Pneus • LC Solutions ERP v1.0 • Desenvolvido por L. Costa
        </div>

        <script>window.onload = function(){ window.print(); }<\/script>
    </body>
    </html>`);

    janela.document.close();
}

buscarMesAtual();