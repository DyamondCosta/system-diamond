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
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        .toISOString().split('T')[0];
    const fim = hojeStr();
    document.getElementById('data-inicio').value = inicio;
    document.getElementById('data-fim').value = fim;
    buscarExtrato();
}

async function buscarExtrato() {
    const inicio = document.getElementById('data-inicio').value;
    const fim = document.getElementById('data-fim').value;

    if(!inicio || !fim) {
        alert('Selecione as datas');
        return;
    }

    const { data, error } = await clienteSupabase
        .from('caixa')
        .select('*')
        .gte('data_movimento', inicio)
        .lte('data_movimento', fim)
        .order('data_movimento', { ascending: false });

    if(error) { console.log(error); return; }

    renderizarResumoExtrato(data || [], inicio, fim);
    renderizarListaExtrato(data || []);
}

function renderizarResumoExtrato(lista, inicio, fim) {
    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {
        if(item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if(item.tipo === 'SAIDA') saidas += Number(item.valor);
    });

    const saldo = entradas - saidas;

    const dataInicioFormatada = inicio.split('-').reverse().join('/');
    const dataFimFormatada = fim.split('-').reverse().join('/');

    document.getElementById('resumo-extrato').innerHTML = `
    <div class="card">
        <h3>Período: ${dataInicioFormatada} até ${dataFimFormatada}</h3>
        <p><strong>Total de Entradas:</strong> <span style="color:green;">R$ ${entradas.toFixed(2)}</span></p>
        <p><strong>Total de Saídas:</strong> <span style="color:red;">R$ ${saidas.toFixed(2)}</span></p>
        <p><strong>Saldo do Período:</strong> <span style="color:${saldo >= 0 ? 'green' : 'red'};">R$ ${saldo.toFixed(2)}</span></p>
        <p><strong>Total de lançamentos:</strong> ${lista.length}</p>
    </div>`;
}

function renderizarListaExtrato(lista) {
    const div = document.getElementById('lista-extrato');
    div.innerHTML = '';

    if(lista.length === 0) {
        div.innerHTML = '<p>Nenhuma movimentação encontrada neste período.</p>';
        return;
    }

    lista.forEach(item => {
        const cor = item.tipo === 'ENTRADA' ? 'green' : 'red';
        const dataFormatada = item.data_movimento
            ? item.data_movimento.split('-').reverse().join('/')
            : '-';

        div.innerHTML += `
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h3 style="color:${cor};">${item.tipo}</h3>
                <span style="color:#6b7280;font-size:13px;">${dataFormatada}</span>
            </div>
            <p>${item.descricao}</p>
            <p><strong>R$ ${Number(item.valor).toFixed(2)}</strong></p>
            <p>${item.forma_pagamento}</p>
        </div>`;
    });
}

// Carrega o mês atual ao abrir
buscarMesAtual();