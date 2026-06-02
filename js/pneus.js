const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function salvarPneu() {

    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const medida = document.getElementById('medida').value;
    const tipo = document.getElementById('tipo').value;

    const preco_compra =
        document.getElementById('preco_compra').value;

    const preco_venda =
        document.getElementById('preco_venda').value;

    const quantidade =
        document.getElementById('quantidade').value;

    const { error } = await clienteSupabase
        .from('pneus')
        .insert([
            {
                marca,
                modelo,
                medida,
                tipo,
                preco_compra,
                preco_venda,
                quantidade
            }
        ]);

    if (error) {

        console.log(error);
        alert('Erro ao salvar');

        return;
    }

    alert('Pneu salvo');

    carregarPneus();

}

async function carregarPneus() {

    const { data } = await clienteSupabase
        .from('pneus')
        .select('*')
        .order('id', { ascending: false });

    const lista =
        document.getElementById('lista-pneus');

    lista.innerHTML = '';

    data.forEach(pneu => {

        lista.innerHTML += `
            <div class="card">

                <h3>
                    ${pneu.marca}
                    ${pneu.modelo}
                </h3>

                <p>
                    ${pneu.medida}
                </p>

                <p>
                    Estoque:
                    ${pneu.quantidade}
                </p>

            </div>
        `;

    });

}

carregarPneus();