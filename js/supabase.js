const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function carregarDashboard() {
    try {

        const hoje = new Date();
        const hojeStr = hoje.toISOString().split('T')[0];
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
            .toISOString().split('T')[0];

        // CAIXA - busca todas as movimentações
        const { data: caixa } = await clienteSupabase
            .from('caixa')
            .select('*');

        // ENTRADAS E SAÍDAS DE HOJE
        const entradasHoje = (caixa || [])
            .filter(item => item.tipo === 'ENTRADA' && item.data_movimento === hojeStr)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        const saidasHoje = (caixa || [])
            .filter(item => item.tipo === 'SAIDA' && item.data_movimento === hojeStr)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        const saldoHoje = entradasHoje - saidasHoje;

        // FATURAMENTO DO MÊS
        const faturamentoMes = (caixa || [])
            .filter(item => item.tipo === 'ENTRADA' && item.data_movimento >= primeiroDiaMes)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        // SERVIÇOS
        const { count: servicosTotal } = await clienteSupabase
            .from('servicos')
            .select('*', { count: 'exact', head: true });

        // ORÇAMENTOS ABERTOS
        const { count: osAbertas } = await clienteSupabase
            .from('ordens_servico')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'FINALIZADA');

        // ESTOQUE BAIXO
        const { count: estoqueBaixo } = await clienteSupabase
            .from('pneus')
            .select('*', { count: 'exact', head: true })
            .lte('quantidade', 3)
            .eq('ativo', true);

        // TOTAL DE PNEUS
        const { data: pneus } = await clienteSupabase
            .from('pneus')
            .select('quantidade')
            .eq('ativo', true);

        const totalPneus = (pneus || [])
            .reduce((total, pneu) => total + Number(pneu.quantidade || 0), 0);

        // ATUALIZA O DASHBOARD
        document.getElementById('servicos-hoje').textContent = servicosTotal || 0;
        document.getElementById('os-abertas').textContent = osAbertas || 0;
        document.getElementById('estoque-baixo').textContent = estoqueBaixo || 0;
        document.getElementById('total-pneus').textContent = totalPneus || 0;
        document.getElementById('faturamento-mes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
        document.getElementById('vendas-hoje').textContent = `R$ ${entradasHoje.toFixed(2)}`;
        document.getElementById('saidas-hoje').textContent = `R$ ${saidasHoje.toFixed(2)}`;
        document.getElementById('lucro-hoje').textContent = `R$ ${saldoHoje.toFixed(2)}`;

    } catch (erro) {
        console.error('Erro Dashboard:', erro);
    }
}

carregarDashboard();