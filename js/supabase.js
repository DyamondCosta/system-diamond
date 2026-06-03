const clienteSupabase =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function carregarDashboard() {

    const hoje =
    new Date()
    .toISOString()
    .split('T')[0];

    const ontemDate =
    new Date();

    ontemDate.setDate(
        ontemDate.getDate() - 1
    );

    const ontem =
    ontemDate
    .toISOString()
    .split('T')[0];

    /* SERVIÇOS HOJE */

    const {
        count:
        servicosHoje
    } = await clienteSupabase
    .from('servicos')
    .select('*', {
        count:'exact',
        head:true
    })
    .eq(
        'data_servico',
        hoje
    );

    /* SERVIÇOS ONTEM */

    const {
        count:
        servicosOntem
    } = await clienteSupabase
    .from('servicos')
    .select('*', {
        count:'exact',
        head:true
    })
    .eq(
        'data_servico',
        ontem
    );

    /* TOTAL SERVIÇOS */

    const {
        count:
        totalServicos
    } = await clienteSupabase
    .from('servicos')
    .select('*',{
        count:'exact',
        head:true
    });

    document.getElementById(
        'servicos-hoje'
    ).textContent =
    servicosHoje || 0;

    const campoOntem =
    document.getElementById(
        'servicos-ontem'
    );

    if(campoOntem){

        campoOntem.textContent =
        servicosOntem || 0;

    }

    const campoTotal =
    document.getElementById(
        'servicos-total'
    );

    if(campoTotal){

        campoTotal.textContent =
        totalServicos || 0;

    }

}

carregarDashboard();