const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let clientesCarregados = [];

async function salvarCliente() {

    const nome =
    document.getElementById('nome').value;

    const telefone =
    document.getElementById('telefone').value;

    const placa =
    document.getElementById('placa').value;

    const observacao =
    document.getElementById('observacao').value;

    const { error } =
    await clienteSupabase
        .from('clientes')
        .insert([
            {
                nome,
                telefone,
                placa,
                observacao
            }
        ]);

    if (error) {

        console.log(error);

        alert(
            'Erro ao salvar cliente'
        );

        return;

    }

    alert(
        'Cliente salvo com sucesso'
    );

    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('placa').value = '';
    document.getElementById('observacao').value = '';

    carregarClientes();

}

async function carregarClientes() {

    const { data, error } =
    await clienteSupabase
        .from('clientes')
        .select('*')
        .order('id', {
            ascending: false
        });

    if (error) {

        console.log(error);

        return;

    }

    clientesCarregados = data;

    renderizarClientes(
        clientesCarregados
    );

}

function renderizarClientes(
    listaClientes
) {

    const lista =
    document.getElementById(
        'lista-clientes'
    );

    if (!lista) return;

    lista.innerHTML = '';

    listaClientes.forEach(
        cliente => {

            lista.innerHTML += `
                <div class="card">

                    <h3>
                        ${cliente.nome}
                    </h3>

                    <p>
                        📞 ${cliente.telefone || ''}
                    </p>

                    <p>
                        🚗 ${cliente.placa || ''}
                    </p>

                    <p>
                        ${cliente.observacao || ''}
                    </p>

                    <button
                        onclick="excluirCliente(${cliente.id})"
                    >
                        Excluir
                    </button>

                </div>
            `;

        }
    );

}

function filtrarClientes() {

    const texto =
    document
        .getElementById('pesquisa')
        .value
        .toLowerCase();

    const filtrados =
    clientesCarregados.filter(
        cliente => {

            return (
                (cliente.nome || '')
                .toLowerCase()
                .includes(texto)

                ||

                (cliente.placa || '')
                .toLowerCase()
                .includes(texto)
            );

        }
    );

    renderizarClientes(
        filtrados
    );

}

async function excluirCliente(
    id
) {

    const confirmar =
    confirm(
        'Deseja excluir este cliente?'
    );

    if (!confirmar) return;

    const { error } =
    await clienteSupabase
        .from('clientes')
        .delete()
        .eq('id', id);

    if (error) {

        console.log(error);

        alert(
            'Erro ao excluir'
        );

        return;

    }

    carregarClientes();

}

carregarClientes();