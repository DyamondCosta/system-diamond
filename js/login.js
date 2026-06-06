const clienteSupabase =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function fazerLogin() {

    const email =
    document
        .getElementById('email')
        .value
        .trim();

    const senha =
    document
        .getElementById('senha')
        .value
        .trim();

    const { data, error } =
    await clienteSupabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single();

    if (error || !data) {
        alert('Usuario ou senha invalidos');
        return;
    }

    localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(data)
    );

    const temAviso = verificarVencimento();

    if (!temAviso) {
        window.location.href = 'index.html';
    }
}

function verificarVencimento() {
    const hoje = new Date();
    const dia = hoje.getDate();

    if (dia === 9) {
        mostrarAviso(
            '⚠️ Mensalidade vence amanha!',
            'A mensalidade do sistema PRUVENX ERP vence amanha, dia 10. Para evitar interrupcao no acesso, realize o pagamento o quanto antes.\n\nDuvidas? pruvenx@outlook.com',
            '#ff9800'
        );
        return true;
    }

    if (dia === 10) {
        mostrarAviso(
            '🔴 Mensalidade vence HOJE!',
            'Hoje e o dia 10, data de vencimento da mensalidade do PRUVENX ERP. Realize o pagamento para garantir a continuidade do sistema.\n\nDuvidas? pruvenx@outlook.com',
            '#ef4444'
        );
        return true;
    }

    return false;
}

function mostrarAviso(titulo, mensagem, cor) {
    const existente = document.getElementById('aviso-vencimento');
    if (existente) existente.remove();

    const aviso = document.createElement('div');
    aviso.id = 'aviso-vencimento';
    aviso.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        width: 420px;
        background: white;
        border-radius: 16px;
        border-top: 5px solid ${cor};
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        font-family: Segoe UI, sans-serif;
        overflow: hidden;
        animation: fadeInAviso 0.3s ease;
    `;

    aviso.innerHTML = `
        <style>
            @keyframes fadeInAviso {
                from { opacity:0; transform:translate(-50%,-60%) scale(0.92); }
                to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
            }
        </style>

        <div style="background:${cor};padding:18px 20px;display:flex;align-items:center;gap:12px;">
            <span style="font-size:26px;">⚡</span>
            <p style="margin:0;color:white;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                ${titulo}
            </p>
        </div>

        <div style="padding:20px;">
            <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;white-space:pre-line;">
                ${mensagem}
            </p>
            <button onclick="fecharAviso()" style="
                width:100%;padding:12px;border:none;border-radius:10px;
                background:${cor};color:white;font-size:14px;font-weight:700;
                cursor:pointer;letter-spacing:0.5px;">
                ENTENDIDO — IR PARA O SISTEMA
            </button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'overlay-vencimento';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(aviso);
}

function fecharAviso() {
    const aviso = document.getElementById('aviso-vencimento');
    const overlay = document.getElementById('overlay-vencimento');
    if (aviso) aviso.remove();
    if (overlay) overlay.remove();
    window.location.href = 'index.html';
}