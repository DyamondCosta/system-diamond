const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let servicosCarregados = [];

async function salvarServico() {

    const nome =
    document.getElementById('nome').value;

    const categoria =
    document.getElementById('categoria').value;

    const valor =
    document.getElementById('valor').value;

    const tempo_estimado =
    document.getElementById('tempo_estimado').value;

    const { error } =
    await clienteSupabase
        .from('servicos')
        .insert([
            {
                nome,
                categoria,
                valor,
                tempo_estimado
            }
        ]);

    if (error) {

        console.log(error);

        alert(
            'Erro ao salvar serviço'
        );

        return;

    }

    alert(
        'Serviço salvo com sucesso'
    );

    document.getElementById('nome').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('tempo_estimado').value = '';

    carregarServicos();

}

async function carregarServicos() {

    const { data, error } =
    await clienteSupabase
        .from('servicos')
        .select('*')
        .order('id', {
            ascending: false
        });

    if (error) {

        console.log(error);
        return;

    }

    servicosCarregados = data;

    renderizarServicos(
        servicosCarregados
    );

}

function renderizarServicos(lista) {

    const container =
    document.getElementById(
        'lista-servicos'
    );

    container.innerHTML = '';

    lista.forEach(servico => {

        container.innerHTML += `

            <div class="card">

                <h3>${servico.nome}</h3>

                <p>
                    Categoria:
                    ${servico.categoria || ''}
                </p>

                <p>
                    Valor:
                    R$ ${servico.valor || 0}
                </p>

                <p>
                    Tempo:
                    ${servico.tempo_estimado || ''}
                </p>

                <button
                    onclick="excluirServico(${servico.id})"
                >
                    Excluir
                </button>

            </div>

        `;

    });

}

function filtrarServicos() {

    const texto =
    document
        .getElementById('pesquisa')
        .value
        .toLowerCase();

    const filtrados =
    servicosCarregados.filter(
        servico =>

            (servico.nome || '')
            .toLowerCase()
            .includes(texto)

    );

    renderizarServicos(
        filtrados
    );

}

async function excluirServico(id) {

    const confirmar =
    confirm(
        'Excluir serviço?'
    );

    if (!confirmar) return;

    const { error } =
    await clienteSupabase
        .from('servicos')
        .delete()
        .eq('id', id);

    if (error) {

        console.log(error);

        return;

    }

    carregarServicos();

}

carregarServicos();