const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function carregarDashboard() {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const primeiroDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split('T')[0];

        /*
        VENDAS
        */
        const { data: vendas } = await clienteSupabase.from('vendas').select('*');

        const vendasHoje = (vendas || []).filter(v => v.data_venda === hoje);
        const totalHoje = vendasHoje.reduce((total, v) => total + Number(v.valor_total || 0), 0);

        const vendasMes = (vendas || []).filter(v => v.data_venda >= primeiroDiaMes);
        const totalMes = vendasMes.reduce((total, v) => total + Number(v.valor_total || 0), 0);

        /*
        SERVIÇOS
        */
        const { count: servicosTotal } = await clienteSupabase
            .from('servicos')
            .select('*', { count: 'exact', head: true });

        /*
        OS ABERTAS
        */
        const { count: osAbertas } = await clienteSupabase
            .from('ordens_servico')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'FINALIZADA');

        /*
        ESTOQUE BAIXO
        */
        const { count: estoqueBaixo } = await clienteSupabase
            .from('pneus')
            .select('*', { count: 'exact', head: true })
            .lte('quantidade', 3)
            .eq('ativo', true); // filtra apenas pneus ativos

        /*
        TOTAL DE PNEUS
        */
        const { data: pneus } = await clienteSupabase
            .from('pneus')
            .select('quantidade')
            .eq('ativo', true); // filtra apenas pneus ativos

        const totalPneus = (pneus || []).reduce((total, p) => total + Number(p.quantidade || 0), 0);

        /*
        ATUALIZA DASHBOARD
        */
        document.getElementById('servicos-hoje').textContent = servicosTotal || 0;
        document.getElementById('vendas-hoje').textContent = `R$ ${totalHoje.toFixed(2)}`;
        document.getElementById('faturamento-mes').textContent = `R$ ${totalMes.toFixed(2)}`;
        document.getElementById('os-abertas').textContent = osAbertas || 0;
        document.getElementById('estoque-baixo').textContent = estoqueBaixo || 0;
        document.getElementById('total-pneus').textContent = totalPneus || 0;

    } catch (erro) {
        console.error('Erro Dashboard:', erro);
    }
}

carregarDashboard();