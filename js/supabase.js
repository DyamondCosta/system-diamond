const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function carregarDashboard() {

    const { data, error } = await clienteSupabase
        .from('dashboard')
        .select('*')
        .single();

    console.log(data);
    console.log(error);

    if (error) return;

    document.getElementById('servicos-hoje').textContent =
        data.total_servicos;

    document.getElementById('vendas-hoje').textContent =
        `R$ ${data.total_vendas}`;

    document.getElementById('estoque-baixo').textContent =
        `${data.estoque_baixo} itens`;
}

carregarDashboard();