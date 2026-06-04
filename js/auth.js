const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

const estaEmPages = window.location.pathname.includes('/pages/');
const caminhoLogin = estaEmPages ? '../login.html' : 'login.html';
const caminhoBase = estaEmPages ? '../' : '';

if (!usuario) {
    window.location.href = caminhoLogin;
}

let tempoInatividade;
function reiniciarTimer() {
    clearTimeout(tempoInatividade);
    tempoInatividade = setTimeout(() => {
        localStorage.removeItem('usuarioLogado');
        alert('Sessão encerrada por inatividade');
        window.location.href = caminhoLogin;
    }, 600000);
}
document.addEventListener('mousemove', reiniciarTimer);
document.addEventListener('keypress', reiniciarTimer);
document.addEventListener('click', reiniciarTimer);
reiniciarTimer();

// Aceita qualquer variação de escrita
const perfilRaw = (usuario.perfil || '').toLowerCase().trim();
const temAcessoTotal =
    perfilRaw === 'admin' ||
    perfilRaw === 'administrador' ||
    perfilRaw === 'gerente';

function montarMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const paginaAtual = window.location.pathname.split('/').pop();

    function linkAtivo(arquivo) {
        return paginaAtual === arquivo ? 'style="opacity:1;font-weight:bold;"' : '';
    }

    let menuHTML = `
    <div style="text-align:center;padding:10px 0 5px;">
        <img src="${caminhoBase}img/logo-batalhao.jpeg"
             style="width:120px;border-radius:12px;margin-bottom:10px;">
        <h3 style="color:white;font-size:16px;margin:0;">Batalhão dos Pneus</h3>
        <p style="font-size:11px;opacity:.7;margin:4px 0 15px;">Sistema de Gestão</p>
    </div>

    <div style="padding:8px 15px;margin-bottom:10px;background:rgba(255,255,255,0.08);border-radius:8px;">
        <p style="color:white;font-size:13px;margin:0;">👤 ${usuario.nome}</p>
        <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:2px 0 0;">${usuario.perfil}</p>
    </div>

    <a href="${caminhoBase}index.html" ${linkAtivo('index.html')}>🏠 Dashboard</a>
    <a href="${caminhoBase}pages/clientes.html" ${linkAtivo('clientes.html')}>👥 Clientes</a>
    <a href="${caminhoBase}pages/pneus.html" ${linkAtivo('pneus.html')}>🛞 Estoque</a>
    <a href="${caminhoBase}pages/servicos.html" ${linkAtivo('servicos.html')}>🔧 Serviços</a>
    <a href="${caminhoBase}pages/ordens-servico.html" ${linkAtivo('ordens-servico.html')}>📋 Orçamentos</a>
    <a href="${caminhoBase}pages/vendas.html" ${linkAtivo('vendas.html')}>💰 Vendas</a>
    <a href="${caminhoBase}pages/agendamentos.html" ${linkAtivo('agendamentos.html')}>📅 Agendamentos</a>
    `;

    if (temAcessoTotal) {
        menuHTML += `
    <a href="${caminhoBase}pages/caixa.html" ${linkAtivo('caixa.html')}>💵 Caixa</a>
    <a href="${caminhoBase}pages/extrato.html" ${linkAtivo('extrato.html')}>📊 Extrato</a>
    <a href="${caminhoBase}pages/usuarios.html" ${linkAtivo('usuarios.html')}>⚙️ Usuários</a>
        `;
    }

    menuHTML += `<br><button id="btn-sair">Sair</button>`;
    sidebar.innerHTML = menuHTML;

    document.getElementById('btn-sair').addEventListener('click', () => {
        localStorage.removeItem('usuarioLogado');
        window.location.href = caminhoLogin;
    });

    if (!temAcessoTotal) {
        setTimeout(() => {
            ['card-financeiro-mes', 'saidas-hoje', 'lucro-ho