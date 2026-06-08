const clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function carregarDashboard() {
    try {

        const hoje = new Date();
        const hojeStr = hoje.toISOString().split('T')[0];
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
            .toISOString().split('T')[0];

        // CAIXA
        const { data: caixa } = await clienteSupabase
            .from('caixa')
            .select('*');

        const entradasHoje = (caixa || [])
            .filter(item => item.tipo === 'ENTRADA' && item.data_movimento === hojeStr)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        const saidasHoje = (caixa || [])
            .filter(item => item.tipo === 'SAIDA' && item.data_movimento === hojeStr)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        const saldoHoje = entradasHoje - saidasHoje;

        const faturamentoMes = (caixa || [])
            .filter(item => item.tipo === 'ENTRADA' && item.data_movimento >= primeiroDiaMes)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        const saidasMes = (caixa || [])
            .filter(item => item.tipo === 'SAIDA' && item.data_movimento >= primeiroDiaMes)
            .reduce((total, item) => total + Number(item.valor || 0), 0);

        // LUCRO = entradas do caixa - saidas do caixa
        const lucroHoje = entradasHoje - saidasHoje;
        const lucroMes  = faturamentoMes - saidasMes;

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

        // AGENDAMENTOS DE HOJE
        const { data: agendamentosHoje } = await clienteSupabase
            .from('agendamentos')
            .select('*')
            .eq('data_agendamento', hojeStr)
            .order('hora_agendamento', { ascending: true });

        // ATUALIZA CARDS
        document.getElementById('vendas-hoje').textContent     = `R$ ${entradasHoje.toFixed(2)}`;
        document.getElementById('saidas-hoje').textContent     = `R$ ${saidasHoje.toFixed(2)}`;
        document.getElementById('lucro-hoje').textContent      = `R$ ${lucroHoje.toFixed(2)}`;
        document.getElementById('saldo-hoje').textContent      = `R$ ${saldoHoje.toFixed(2)}`;
        document.getElementById('faturamento-mes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
        document.getElementById('saidas-mes').textContent      = `R$ ${saidasMes.toFixed(2)}`;
        document.getElementById('lucro-mes').textContent       = `R$ ${lucroMes.toFixed(2)}`;
        document.getElementById('servicos-hoje').textContent   = servicosTotal || 0;
        document.getElementById('os-abertas').textContent      = osAbertas || 0;
        document.getElementById('estoque-baixo').textContent   = estoqueBaixo || 0;
        document.getElementById('total-pneus').textContent     = totalPneus || 0;
        document.getElementById('agendamentos-hoje').textContent = (agendamentosHoje || []).length;

        // LISTA AGENDAMENTOS DO DIA
        const listaDiv = document.getElementById('lista-agendamentos-dia');
        if (listaDiv) {
            if (!agendamentosHoje || agendamentosHoje.length === 0) {
                listaDiv.innerHTML = '<p style="color:#6b7280;">Nenhum agendamento para hoje.</p>';
            } else {
                listaDiv.innerHTML = '';
                agendamentosHoje.forEach(a => {
                    const hora = a.hora_agendamento ? a.hora_agendamento.substring(0, 5) : '-';
                    let corStatus = '#6b7280';
                    if (a.status === 'PENDENTE')   corStatus = '#f59e0b';
                    if (a.status === 'CONFIRMADO') corStatus = '#3b82f6';
                    if (a.status === 'CONCLUIDO')  corStatus = '#10b981';
                    if (a.status === 'CANCELADO')  corStatus = '#ef4444';

                    listaDiv.innerHTML += `
                    <div class="card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                        <div>
                            <strong>⏰ ${hora}</strong> —
                            <strong>${a.cliente}</strong>
                            <span style="color:#6b7280;"> | ${a.servico}</span>
                            ${a.telefone ? `<span style="color:#6b7280;"> | 📞 ${a.telefone}</span>` : ''}
                        </div>
                        <span style="color:${corStatus};font-weight:bold;">${a.status}</span>
                    </div>`;
                });
            }
        }

    } catch (erro) {
        console.error('Erro Dashboard:', erro);
    }
}

carregarDashboard();