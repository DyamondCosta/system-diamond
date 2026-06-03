const clienteSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let osEditando = null;

async function salvarOS() {
  const cliente_nome = document.getElementById('cliente_nome').value;
  const telefone = document.getElementById('telefone').value;
  const placa = document.getElementById('placa').value;
  const veiculo = document.getElementById('veiculo').value;
  const servico = document.getElementById('servico').value;
  const valor_mao_obra = Number(document.getElementById('valor_mao_obra').value);
  const valor_pecas = Number(document.getElementById('valor_pecas').value);
  const valor_total = Number(document.getElementById('valor_total').value);
  const status = document.getElementById('status').value;
  const observacao = document.getElementById('observacao').value;

  if(osEditando) {
    const { error } = await clienteSupabase
      .from('ordens_servico')
      .update({
        cliente_nome, telefone, placa, veiculo, servico,
        valor_mao_obra, valor_pecas, valor_total, status, observacao
      })
      .eq('id', osEditando);

    if(error){
      console.log(error);
      alert('Erro ao atualizar OS');
      return;
    }

    alert('OS atualizada com sucesso');
    osEditando = null;
    limparCampos();
    carregarOS();
    return;
  }

  const { error } = await clienteSupabase
    .from('ordens_servico')
    .insert([{
      cliente_nome, telefone, placa, veiculo, servico,
      valor_mao_obra, valor_pecas, valor_total, status, observacao
    }]);

  if(error){
    console.log(error);
    alert('Erro ao salvar OS');
    return;
  }

  alert('OS salva com sucesso');
  limparCampos();
  carregarOS();
}

function limparCampos() {
  ['cliente_nome','telefone','placa','veiculo','servico',
   'valor_mao_obra','valor_pecas','valor_total','status','observacao']
   .forEach(id => document.getElementById(id).value = '');
}

async function carregarOS() {
  const { data, error } = await clienteSupabase
    .from('ordens_servico')
    .select('*')
    .order('id', {ascending:false});

  if(error){
    console.log(error);
    return;
  }

  const lista = document.getElementById('lista-os');
  lista.innerHTML = '';

  data.forEach(os=>{
    let corStatus = 'black';
    if(os.status === 'ABERTA') corStatus = 'orange';
    else if(os.status === 'FINALIZADA') corStatus = 'green';
    else if(os.status === 'EM ANDAMENTO') corStatus = 'blue';
    else if(os.status === 'AGUARDANDO PEÇAS') corStatus = 'red';

    lista.innerHTML += `
    <div class="card os-card">
      <h3>📋 OS #${os.id}</h3>
      <p>Telefone: ${os.telefone}</p>
      <p>Placa: ${os.placa}</p>
      <p>Veículo: ${os.veiculo}</p>
      <p>Serviço: ${os.servico}</p>
      <p>Mão de Obra: R$ ${os.valor_mao_obra}</p>
      <p>Peças: R$ ${os.valor_pecas}</p>
      <p>Total: R$ ${os.valor_total}</p>
      <p style="font-weight:bold;color:${corStatus};">${os.status}</p>
      <button onclick="editarOS(${os.id})">✏️ Editar</button>
      <button onclick="finalizarOS(${os.id})">✅ Finalizar</button>
      <button onclick="excluirOS(${os.id})">🗑️ Excluir</button>
      <button onclick="gerarPDFIndividual(${os.id})">📄 PDF</button>
    </div>`;
  });
}

async function editarOS(id) {
  const { data } = await clienteSupabase
    .from('ordens_servico')
    .select('*')
    .eq('id', id)
    .single();

  if(!data) return;

  osEditando = id;

  ['cliente_nome','telefone','placa','veiculo','servico',
   'valor_mao_obra','valor_pecas','valor_total','status','observacao']
   .forEach(key => document.getElementById(key).value = data[key] || '');

  window.scrollTo({top:0, behavior:'smooth'});
}

async function finalizarOS(id) {
  const { error } = await clienteSupabase
    .from('ordens_servico')
    .update({status:'FINALIZADA'})
    .eq('id', id);

  if(error){
    console.log(error);
    alert('Erro ao finalizar OS');
    return;
  }

  carregarOS();
}

async function excluirOS(id){
  const confirmar = confirm('Deseja excluir esta OS?');
  if(!confirmar) return;

  const { error } = await clienteSupabase
    .from('ordens_servico')
    .delete()
    .eq('id', id);

  if(error){
    console.log(error);
    alert('Erro ao excluir OS');
    return;
  }

  carregarOS();
}

/* GERAR PDF PROFISSIONAL */
async function gerarPDFIndividual(id){
  const { data: os } = await clienteSupabase
    .from('ordens_servico')
    .select('*')
    .eq('id', id)
    .single();

  if(!os) return;

  const doc = new jsPDF();

  // Cabeçalho
  doc.setDrawColor(30,41,59);
  doc.setFillColor(15,23,42);
  doc.rect(0,0,210,30,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18);
  doc.text('BATALHÃO DOS PNEUS', 20, 20);
  doc.setFontSize(10);
  doc.text('ORDEM DE SERVIÇO', 150, 20);
  doc.setTextColor(0,0,0);
  doc.setFontSize(12);

  // Informações do cliente
  doc.setDrawColor(0);
  doc.rect(10,40,190,35); // caixa cliente
  doc.text(`Cliente: ${os.cliente_nome}`, 15, 55);
  doc.text(`Telefone: ${os.telefone}`, 15, 65);
  doc.text(`Placa: ${os.placa}`, 100, 55);
  doc.text(`Veículo: ${os.veiculo}`, 100, 65);

  // Serviço
  doc.rect(10,80,190,35); // caixa serviço
  doc.text(`Serviço Executado: ${os.servico}`, 15, 95);
  doc.text(`Mão de Obra: R$ ${os.valor_mao_obra}`, 15, 105);
  doc.text(`Peças: R$ ${os.valor_pecas}`, 100, 95);
  doc.text(`Total: R$ ${os.valor_total}`, 100, 105);

  // Observação
  doc.rect(10,120,190,30);
  doc.text(`Observações: ${os.observacao || '-'}`, 15, 135);

  // Rodapé / assinatura
  doc.text('________________________________________', 15, 165);
  doc.text('Assinatura do Cliente', 15, 170);
  doc.text('________________________________________', 115, 165);
  doc.text('Assinatura do Técnico', 115, 170);

  doc.save(`OS-${os.id}.pdf`);
}

carregarOS();