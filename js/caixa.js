const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hojeStr() {
    return new Date().toISOString().split('T')[0];
}

async function salvarMovimento() {
    const tipo = document.getElementById('tipo').value;
    const descricao = document.getElementById('descricao').value;
    const valor = Number(document.getElementById('valor').value);
    const forma_pagamento = document.getElementById('forma_pagamento').value;

    if(!descricao || !valor) {
        alert('Preencha descrição e valor');
        return;
    }

    const { error } = await clienteSupabase
        .from('caixa')
        .insert([{ tipo, descricao, valor, forma_pagamento, data_movimento: hojeStr() }]);

    if(error) { console.log(error); alert('Erro ao salvar'); return; }

    alert('Movimento registrado');
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    carregarCaixa();
}

async function carregarCaixa() {
    const hoje = hojeStr();

    const { data, error } = await clienteSupabase
        .from('caixa')
        .select('*')
        .eq('data_movimento', hoje)
        .order('id', { ascending: false });

    if(error) { console.log(error); return; }

    renderizarResumo(data || []);
    renderizarMovimentos(data || []);
}

function renderizarResumo(lista) {
    let entradas = 0;
    let saidas = 0;

    lista.forEach(item => {
        if(item.tipo === 'ENTRADA') entradas += Number(item.valor);
        if(item.tipo === 'SAIDA') saidas += Number(item.valor);
    });

    const saldo = entradas - saidas;

    document.getElementById('resumo-caixa').innerHTML = `
    <div class="card">
        <p><strong>Entradas:</strong> R$ ${entradas.toFixed(2)}</p>
        <p><strong>Saídas:</strong> R$ ${saidas.toFixed(2)}</p>
        <p><strong>Saldo do Dia:</strong> R$ ${saldo.toFixed(2)}</p>
    </div>`;
}

function renderizarMovimentos(lista) {
    const div = document.getElementById('lista-caixa');
    div.innerHTML = '';

    if(lista.length === 0) {
        div.innerHTML = '<p>Nenhuma movimentação hoje.</p>';
        return;
    }

    lista.forEach(item => {
        const cor = item.tipo === 'ENTRADA' ? 'green' : 'red';
        div.innerHTML += `
        <div class="card">
            <h3 style="color:${cor};">${item.tipo}</h3>
            <p>${item.descricao}</p>
            <p><strong>R$ ${Number(item.valor).toFixed(2)}</strong></p>
            <p>${item.forma_pagamento}</p>
            <button onclick="excluirMovimento(${item.id})">🗑️ Excluir</button>
        </div>`;
    });
}

async function excluirMovimento(id) {
    if(!confirm('Excluir lançamento?')) return;

    const { error } = await clienteSupabase
        .from('caixa')
        .delete()
        .eq('id', id);

    if(error) { console.log(error); return; }
    carregarCaixa();
}

carregarCaixa();