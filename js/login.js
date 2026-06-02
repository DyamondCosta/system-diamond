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

    console.log(
        'USUARIO:',
        data
    );

    console.log(
        'ERRO:',
        error
    );

    if (error || !data) {

        alert(
            'Usuário ou senha inválidos'
        );

        return;

    }

    localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(data)
    );

    alert(
        'Login realizado com sucesso'
    );

    window.location.href =
    'index.html';

}