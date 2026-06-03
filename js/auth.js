const usuario = JSON.parse(
    localStorage.getItem('usuarioLogado')
);

const estaEmPages =
window.location.pathname.includes('/pages/');

const caminhoLogin =
estaEmPages
? '../login.html'
: 'login.html';

if (!usuario) {

    window.location.href =
    caminhoLogin;

}

let tempoInatividade;

function reiniciarTimer() {

    clearTimeout(
        tempoInatividade
    );

    tempoInatividade =
    setTimeout(() => {

        localStorage.removeItem(
            'usuarioLogado'
        );

        alert(
            'Sessão encerrada por inatividade'
        );

        window.location.href =
        caminhoLogin;

    }, 600000);

}

document.addEventListener(
'mousemove',
reiniciarTimer
);

document.addEventListener(
'keypress',
reiniciarTimer
);

document.addEventListener(
'click',
reiniciarTimer
);

reiniciarTimer();

const usuarioLogado =
document.getElementById(
'usuario-logado'
);

if (
usuarioLogado &&
usuario
) {

let perfilExibicao =
usuario.perfil;

if(
usuario.perfil === 'admin'
){

perfilExibicao =
'Administrador';

}

if(
usuario.perfil === 'gerente'
){

perfilExibicao =
'Gerente de Loja';

}

usuarioLogado.innerHTML =

`
👤 ${usuario.nome}
<br>
${perfilExibicao}
`;

}

const btnSair =
document.getElementById(
'btn-sair'
);

if (btnSair) {

btnSair.addEventListener(
'click',
() => {

localStorage.removeItem(
'usuarioLogado'
);

window.location.href =
caminhoLogin;

}
);

}

/*
================================
PERMISSÕES
================================
*/

const adminPermitidos =

[
'Lucas',
'Paulo',
'Administrador'
];

const ehAdmin =

adminPermitidos.includes(
usuario.nome
)

||

usuario.perfil ===
'admin';

if (!ehAdmin) {

const menuCaixa =
document.getElementById(
'menu-caixa'
);

if(menuCaixa){

menuCaixa.style.display =
'none';

}

const menuUsuarios =
document.getElementById(
'menu-usuarios'
);

if(menuUsuarios){

menuUsuarios.style.display =
'none';

}

/* CARDS FINANCEIROS */

const cardFinanceiro =
document.getElementById(
'card-financeiro'
);

if(cardFinanceiro){

cardFinanceiro.style.display =
'none';

}

const cardFinanceiroOntem =
document.getElementById(
'card-financeiro-ontem'
);

if(cardFinanceiroOntem){

cardFinanceiroOntem.style.display =
'none';

}

const cardFinanceiroMes =
document.getElementById(
'card-financeiro-mes'
);

if(cardFinanceiroMes){

cardFinanceiroMes.style.display =
'none';

}

}