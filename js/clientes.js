const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let clientesCarregados = [];
let clienteEditando = null;

async function salvarCliente() {

    const nome =
    document.getElementById('nome').value;

    const telefone =
    document.getElementById('telefone').value;

    const placa =
    document.getElementById('placa').value;

    const observacao =
    document.getElementById('observacao').value;

    if(clienteEditando){

        const { error } =
        await clienteSupabase
        .from('clientes')
        .update({
            nome,
            telefone,
            placa,
            observacao
        })
        .eq('id', clienteEditando);

        if(error){

            console.log(error);

            alert(
                'Erro ao atualizar cliente'
            );

            return;

        }

        alert(
            'Cliente atualizado com sucesso'
        );

        clienteEditando = null;

        limparCampos();

        carregarClientes();

        return;
    }

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

    if(error){

        console.log(error);

        alert(
            'Erro ao salvar cliente'
        );

        return;

    }

    alert(
        'Cliente salvo com sucesso'
    );

    limparCampos();

    carregarClientes();

}

function limparCampos(){

    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('placa').value = '';
    document.getElementById('observacao').value = '';

}

async function carregarClientes(){

    const { data, error } =
    await clienteSupabase
    .from('clientes')
    .select('*')
    .order('id',{
        ascending:false
    });

    if(error){

        console.log(error);
        return;

    }

    clientesCarregados = data;

    renderizarClientes(
        data
    );

}

function renderizarClientes(listaClientes){

    const lista =
    document.getElementById(
        'lista-clientes'
    );

    if(!lista) return;

    lista.innerHTML = `

    <table style="
        width:100%;
        background:white;
        border-radius:12px;
        overflow:hidden;
        border-collapse:collapse;
    ">

        <thead>

            <tr style="
                background:#0f172a;
                color:white;
            ">

                <th style="padding:12px;">
                    Nome
                </th>

                <th style="padding:12px;">
                    Telefone
                </th>

                <th style="padding:12px;">
                    Placa
                </th>

                <th style="padding:12px;">
                    Ações
                </th>

            </tr>

        </thead>

        <tbody id="tbody-clientes">

        </tbody>

    </table>

    `;

    const tbody =
    document.getElementById(
        'tbody-clientes'
    );

    listaClientes.forEach(cliente=>{

        tbody.innerHTML += `

        <tr style="
            border-bottom:1px solid #e5e7eb;
        ">

            <td style="padding:12px;">
                ${cliente.nome || ''}
            </td>

            <td style="padding:12px;">
                ${cliente.telefone || ''}
            </td>

            <td style="padding:12px;">
                ${cliente.placa || ''}
            </td>

            <td style="padding:12px;">

                <button
                onclick="editarCliente(${cliente.id})">
                Editar
                </button>

                <button
                onclick="excluirCliente(${cliente.id})">
                Excluir
                </button>

            </td>

        </tr>

        `;

    });

}

async function editarCliente(id){

    const { data } =
    await clienteSupabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single();

    if(!data) return;

    clienteEditando = id;

    document.getElementById('nome').value =
    data.nome || '';

    document.getElementById('telefone').value =
    data.telefone || '';

    document.getElementById('placa').value =
    data.placa || '';

    document.getElementById('observacao').value =
    data.observacao || '';

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });

}

function filtrarClientes(){

    const texto =
    document
    .getElementById('pesquisa')
    .value
    .toLowerCase();

    const filtrados =
    clientesCarregados.filter(cliente =>

        (cliente.nome || '')
        .toLowerCase()
        .includes(texto)

        ||

        (cliente.placa || '')
        .toLowerCase()
        .includes(texto)

        ||

        (cliente.telefone || '')
        .toLowerCase()
        .includes(texto)

    );

    renderizarClientes(
        filtrados
    );

}

async function excluirCliente(id){

    const confirmar =
    confirm(
        'Deseja excluir este cliente?'
    );

    if(!confirmar) return;

    const { error } =
    await clienteSupabase
    .from('clientes')
    .delete()
    .eq('id', id);

    if(error){

        console.log(error);

        alert(
            'Erro ao excluir'
        );

        return;

    }

    carregarClientes();

}

carregarClientes();