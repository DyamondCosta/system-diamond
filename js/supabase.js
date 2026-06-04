const clienteSupabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

async function carregarDashboard() {

    try {

        const primeiroDiaMes =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        )
        .toISOString()
        .split('T')[0];

        /*
        VENDAS
        */
        const { data: vendas } =
        await clienteSupabase
        .from('vendas')
        .select('*');

        const vendasMes =
        (vendas || [])
        .filter(
            v => v.data_venda >= primeiroDiaMes
        );

        const faturamentoMes =
        vendasMes.reduce(
            (total, v) =>
            total +
            Number(v.valor_total || 0),
            0
        );

        /*
        CAIXA
        */
        const { data: caixa } =
        await clienteSupabase
        .from('caixa')
        .select('*');

        const entradas =
        (caixa || [])
        .filter(
            item =>
            item.tipo === 'ENTRADA'
        )
        .reduce(
            (total, item) =>
            total +
            Number(item.valor || 0),
            0
        );

        const saidas =
        (caixa || [])
        .filter(
            item =>
            item.tipo === 'SAIDA'
        )
        .reduce(
            (total, item) =>
            total +
            Number(item.valor || 0),
            0
        );

        const saldo =
        entradas - saidas;

        /*
        SERVIÇOS
        */
        const { count: servicosTotal } =
        await clienteSupabase
        .from('servicos')
        .select('*', {
            count:'exact',
            head:true
        });

        /*
        ORÇAMENTOS ABERTOS
        */
        const { count: osAbertas } =
        await clienteSupabase
        .from('ordens_servico')
        .select('*', {
            count:'exact',
            head:true
        })
        .neq(
            'status',
            'FINALIZADA'
        );

        /*
        ESTOQUE BAIXO
        */
        const { count: estoqueBaixo } =
        await clienteSupabase
        .from('pneus')
        .select('*', {
            count:'exact',
            head:true
        })
        .lte(
            'quantidade',
            3
        )
        .eq(
            'ativo',
            true
        );

        /*
        TOTAL PNEUS
        */
        const { data: pneus } =
        await clienteSupabase
        .from('pneus')
        .select('quantidade')
        .eq(
            'ativo',
            true
        );

        const totalPneus =
        (pneus || [])
        .reduce(
            (total, pneu) =>
            total +
            Number(
                pneu.quantidade || 0
            ),
            0
        );

        /*
        DASHBOARD
        */

        document.getElementById(
            'servicos-hoje'
        ).textContent =
        servicosTotal || 0;

        document.getElementById(
            'os-abertas'
        ).textContent =
        osAbertas || 0;

        document.getElementById(
            'estoque-baixo'
        ).textContent =
        estoqueBaixo || 0;

        document.getElementById(
            'total-pneus'
        ).textContent =
        totalPneus || 0;

        document.getElementById(
            'faturamento-mes'
        ).textContent =
        `R$ ${faturamentoMes.toFixed(2)}`;

        document.getElementById(
            'vendas-hoje'
        ).textContent =
        `R$ ${entradas.toFixed(2)}`;

        document.getElementById(
            'saidas-hoje'
        ).textContent =
        `R$ ${saidas.toFixed(2)}`;

        document.getElementById(
            'lucro-hoje'
        ).textContent =
        `R$ ${saldo.toFixed(2)}`;

    }

    catch(erro) {

        console.error(
            'Erro Dashboard:',
            erro
        );

    }

}

carregarDashboard();