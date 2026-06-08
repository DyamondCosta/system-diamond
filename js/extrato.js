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

    dadosExtrato = caixa || [];

    renderizarResumo(dadosExtrato, inicio, fim);
    renderizarLista(dadosExtrato);
}

function renderizarResumo(lista, inicio, fim) {
    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {
        if (item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if (item.tipo === 'SAIDA')   saidas   += Number(item.valor);
    });

    const saldo      = entradas - saidas;
    const lucroReal  = entradas - saidas;
    const inicioF    = inicio.split('-').reverse().join('/');
    const fimF       = fim.split('-').reverse().join('/');

    document.getElementById('resumo-extrato').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">

        <div style="background:#f0fdf4;padding:16px;border-radius:10px;border-left:4px solid #10b981;">
            <p style="margin:0;font-size:11px;color:#6b7280;">ENTRADAS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#10b981;">R$ ${entradas.toFixed(2)}</p>
        </div>

        <div style="background:#fef2f2;padding:16px;border-radius:10px;border-left:4px solid #ef4444;">
            <p style="margin:0;font-size:11px;color:#6b7280;">SAIDAS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#ef4444;">R$ ${saidas.toFixed(2)}</p>
        </div>

        <div style="background:#eff6ff;padding:16px;border-radius:10px;border-left:4px solid #3b82f6;">
            <p style="margin:0;font-size:11px;color:#6b7280;">SALDO</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:${saldo >= 0 ? '#3b82f6' : '#ef4444'};">R$ ${saldo.toFixed(2)}</p>
        </div>

        <div style="background:#faf5ff;padding:16px;border-radius:10px;border-left:4px solid #8b5cf6;">
            <p style="margin:0;font-size:11px;color:#6b7280;">LUCRO REAL</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:${lucroReal >= 0 ? '#8b5cf6' : '#ef4444'};">R$ ${lucroReal.toFixed(2)}</p>
        </div>

        <div style="background:#fff7ed;padding:16px;border-radius:10px;border-left:4px solid #f59e0b;">
            <p style="margin:0;font-size:11px;color:#6b7280;">LANCAMENTOS</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#f59e0b;">${lista.length}</p>
        </div>

    </div>

    <p style="color:#6b7280;font-size:13px;margin-bottom:15px;">
        📅 Periodo: <strong>${inicioF}</strong> ate <strong>${fimF}</strong>
    </p>

    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
        <button onclick="imprimirRelatorio()" style="background:#3b82f6;">🖨️ Imprimir Relatorio</button>
        <button onclick="limparPeriodo('${inicio}','${fim}')" style="background:#ef4444;">🗑️ Apagar Movimentacoes deste Periodo</button>
    </div>

    <h2>Movimentacoes</h2>`;
}

function renderizarLista(lista) {
    const div = document.getElementById('lista-extrato');
    div.innerHTML = '';

    if (lista.length === 0) {
        div.innerHTML = '<p style="color:#6b7280;">Nenhuma movimentacao encontrada neste periodo.</p>';
        return;
    }

    lista.forEach(item => {
        const cor  = item.tipo === 'ENTRADA' ? '#10b981' : '#ef4444';
        const bg   = item.tipo === 'ENTRADA' ? '#f0fdf4' : '#fef2f2';
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
    if (!confirm('Excluir este lancamento?')) return;

    const { error } = await clienteSupabase
        .from('caixa')
        .delete()
        .eq('id', id);

    if (error) { alert('Erro ao excluir'); return; }

    alert('Lancamento excluido!');
    buscarExtrato();
}

async function limparPeriodo(inicio, fim) {
    const inicioF = inicio.split('-').reverse().join('/');
    const fimF    = fim.split('-').reverse().join('/');

    const c1 = confirm(`ATENCAO!\n\nVoce vai apagar TODAS as movimentacoes de ${inicioF} ate ${fimF}.\n\nCertifique-se de ter impresso o relatorio antes!\n\nDeseja continuar?`);
    if (!c1) return;

    const c2 = confirm('Ultima confirmacao! Esta acao NAO pode ser desfeita. Tem certeza?');
    if (!c2) return;

    const { error } = await clienteSupabase
        .from('caixa')
        .delete()
        .gte('data_movimento', inicio)
        .lte('data_movimento', fim);

    if (error) { alert('Erro ao apagar'); return; }

    alert('Movimentacoes apagadas!');
    buscarExtrato();
}

function imprimirRelatorio() {
    const inicio  = periodoAtual.inicio;
    const fim     = periodoAtual.fim;
    const inicioF = inicio.split('-').reverse().join('/');
    const fimF    = fim.split('-').reverse().join('/');

    let entradas = 0, saidas = 0;
    dadosExtrato.forEach(item => {
        if (item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if (item.tipo === 'SAIDA')   saidas   += Number(item.valor);
    });
    const saldo     = entradas - saidas;
    const lucroReal = entradas - saidas;

    let linhas = '';
    dadosExtrato.forEach((item, i) => {
        const dataF = item.data_movimento
            ? item.data_movimento.split('-').reverse().join('/')
            : '-';
        const cor = item.tipo === 'ENTRADA' ? '#166534' : '#991b1b';
        const bg  = i % 2 === 0 ? '#ffffff' : '#f9fafb';
        linhas += `
        <tr style="background:${bg};">
            <td>${dataF}</td>
            <td><span style="color:${cor};font-weight:600;font-size:11px;">${item.tipo}</span></td>
            <td>${item.descricao}</td>
            <td>${item.forma_pagamento}</td>
            <td style="text-align:right;font-weight:600;color:${cor};">R$ ${Number(item.valor).toFixed(2)}</td>
        </tr>`;
    });

    const janela = window.open('', '_blank');
    janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Relatorio Financeiro — ${inicioF} a ${fimF}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:Arial,sans-serif; font-size:12px; color:#111; background:white; padding:25px 30px; }

            /* CABEÇALHO */
            .header {
                display:flex; justify-content:space-between; align-items:center;
                padding:16px 20px;
                background:#0f172a;
                border-radius:8px;
                margin-bottom:20px;
            }
            .header-left h1 { font-size:18px; font-weight:900; color:white; letter-spacing:1px; }
            .header-left p  { font-size:10px; color:#ff9800; margin-top:3px; }
            .header-right   { text-align:right; }
            .header-right p { font-size:12px; color:#ff9800; font-weight:700; }
            .header-right small { font-size:10px; color:rgba(255,255,255,0.4); }

            /* RESUMO */
            .resumo {
                display:grid;
                grid-template-columns:repeat(5,1fr);
                gap:8px;
                margin-bottom:18px;
            }
            .card-r {
                padding:10px 12px;
                border-radius:6px;
                text-align:center;
            }
            .card-r .label {
                font-size:9px;
                font-weight:700;
                text-transform:uppercase;
                letter-spacing:0.5px;
                color:#6b7280;
                margin-bottom:4px;
            }
            .card-r .valor {
                font-size:15px;
                font-weight:800;
            }

            /* DIVISOR */
            .divisor {
                border:none;
                border-top:1px solid #e5e7eb;
                margin:14px 0;
            }

            /* TABELA */
            table {
                width:100%;
                border-collapse:collapse;
                font-size:11px;
            }
            thead tr {
                background:#0f172a;
                color:white;
            }
            thead td {
                padding:8px 10px;
                font-weight:700;
                font-size:10px;
                text-transform:uppercase;
                letter-spacing:0.5px;
            }
            tbody td {
                padding:6px 10px;
                border-bottom:1px solid #f3f4f6;
                vertical-align:middle;
            }
            tbody tr:last-child td { border-bottom:none; }

            /* TOTALIZADOR */
            .total-row td {
                padding:8px 10px;
                font-weight:700;
                font-size:12px;
                border-top:2px solid #0f172a;
                background:#f8fafc;
            }

            /* RODAPÉ */
            .footer {
                margin-top:20px;
                padding-top:12px;
                border-top:1px solid #e5e7eb;
                display:flex;
                justify-content:space-between;
                align-items:center;
                color:#9ca3af;
                font-size:10px;
            }

            @media print {
                body { padding:15px 20px; }
                .header { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                .card-r { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                thead tr { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
                .total-row td { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
            }
        </style>
    </head>
    <body>

        <div class="header">
            <div class="header-left">
                <h1>BATALHAO DOS PNEUS</h1>
                <p>Relatorio Financeiro — PRUVENX ERP v1.0</p>
            </div>
            <div class="header-right">
                <p>${inicioF} ate ${fimF}</p>
                <small>Gerado em ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</small>
            </div>
        </div>

        <div class="resumo">
            <div class="card-r" style="background:#f0fdf4;">
                <div class="label">Entradas</div>
                <div class="valor" style="color:#16a34a;">R$ ${entradas.toFixed(2)}</div>
            </div>
            <div class="card-r" style="background:#fef2f2;">
                <div class="label">Saidas</div>
                <div class="valor" style="color:#dc2626;">R$ ${saidas.toFixed(2)}</div>
            </div>
            <div class="card-r" style="background:#eff6ff;">
                <div class="label">Saldo</div>
                <div class="valor" style="color:${saldo >= 0 ? '#2563eb' : '#dc2626'};">R$ ${saldo.toFixed(2)}</div>
            </div>
            <div class="card-r" style="background:#faf5ff;">
                <div class="label">Lucro Real</div>
                <div class="valor" style="color:${lucroReal >= 0 ? '#7c3aed' : '#dc2626'};">R$ ${lucroReal.toFixed(2)}</div>
            </div>
            <div class="card-r" style="background:#fff7ed;">
                <div class="label">Lancamentos</div>
                <div class="valor" style="color:#d97706;">${dadosExtrato.length}</div>
            </div>
        </div>

        <hr class="divisor">

        <table>
            <thead>
                <tr>
                    <td style="width:80px;">Data</td>
                    <td style="width:75px;">Tipo</td>
                    <td>Descricao</td>
                    <td style="width:100px;">Pagamento</td>
                    <td style="width:90px;text-align:right;">Valor</td>
                </tr>
            </thead>
            <tbody>
                ${linhas}
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="4">TOTAL DO PERIODO</td>
                    <td style="text-align:right;color:${saldo >= 0 ? '#166534' : '#991b1b'};">
                        R$ ${saldo.toFixed(2)}
                    </td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <span>Batalhao dos Pneus • PRUVENX ERP v1.0 • Desenvolvido por L. Costa</span>
            <span>pruvenx@outlook.com</span>
        </div>

        <script>window.onload = function(){ window.print(); }<\/script>
    </body>
    </html>`);

    janela.document.close();
}

buscarMesAtual();