const clienteSupabase =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function carregarDashboard() {

    const hojeDate = new Date();

    const hoje =
    hojeDate.toISOString().split('T')[0];

    const ontemDate =
    new Date();

    ontemDate.setDate(
        ontemDate.getDate() - 1
    );

    const ontem =
    ontemDate.toISOString().split('T')[0];

    const inicioMes =
    new Date(
        hojeDate.getFullYear(),
        hojeDate.getMonth(),
        1
    ).toISOString().split('T')[0];

    /* SERVIÇOS HOJE */

    const {
        count: servicosHoje
    } = await clienteSupabase
    .from('servicos_executados')
    .select('*',{
        count:'exact',
        head:true
    })
    .eq(
        'data_servico',
        hoje
    );

    /* SERVIÇOS ONTEM */

    const {
        count: servicosOntem
    } = await clienteSupabase
    .from('servicos_executados')
    .select('*',{
        count:'exact',
        head:true
    })
    .eq(
        'data_servico',
        ontem
    );

    /* SERVIÇOS TOTAL */

    const {
        count: servicosTotal
    } = await clienteSupabase
    .from('servicos_executados')
    .select('*',{
        count:'exact',
        head:true
    });

    /* VENDAS HOJE */

    const {
        data: vendasHoje
    } = await clienteSupabase
    .from('vendas')
    .select('valor_total')
    .eq(
        'data_venda',
        hoje
    );

    /* VENDAS ONTEM */

    const {
        data: vendasOntem
    } = await clienteSupabase
    .from('vendas')
    .select('valor_total')
    .eq(
        'data_venda',
        ontem
    );

    /* FATURAMENTO MÊS */

    const {
        data: vendasMes
    } = await clienteSupabase
    .from('vendas')
    .select('valor_total')
    .gte(
        'data_venda',
        inicioMes
    );

    /* OS ABERTAS */

    const {
        count: osAbertas
    } = await clienteSupabase
    .from('ordens_servico')
    .select('*',{
        count:'exact',
        head:true
    })
    .neq(
        'status',
        'FINALIZADA'
    );

    /* ESTOQUE BAIXO */

    const {
        count: estoqueBaixo
    } = await clienteSupabase
    .from('pneus')
    .select('*',{
        count:'exact',
        head:true
    })
    .lte(
        'quantidade',
        5
    );

    const totalHoje =
    (vendasHoje || [])
    .reduce(
        (s,v) =>
        s + Number(v.valor_total || 0),
        0
    );

    const totalOntem =
    (vendasOntem || [])
    .reduce(
        (s,v) =>
        s + Number(v.valor_total || 0),
        0
    );

    const totalMes =
    (vendasMes || [])
    .reduce(
        (s,v) =>
        s + Number(v.valor_total || 0),
        0
    );

    document.getElementById(
        'servicos-hoje'
    ).textContent =
    servicosHoje || 0;

    document.getElementById(
        'servicos-ontem'
    ).textContent =
    servicosOntem || 0;

    document.getElementById(
        'servicos-total'
    ).textContent =
    servicosTotal || 0;

    document.getElementById(
        'vendas-hoje'
    ).textContent =
    `R$ ${totalHoje.toFixed(2)}`;

    document.getElementById(
        'vendas-ontem'
    ).textContent =
    `R$ ${totalOntem.toFixed(2)}`;

    document.getElementById(
        'faturamento-mes'
    ).textContent =
    `R$ ${totalMes.toFixed(2)}`;

    document.getElementById(
        'os-abertas'
    ).textContent =
    osAbertas || 0;

    document.getElementById(
        'estoque-baixo'
    ).textContent =
    estoqueBaixo || 0;

}

carregarDashboard();