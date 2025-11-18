const API_BASE = 'http://localhost:3000';
let pontos = []; // lista global de pontos de descarte carregados da API

/* Navegação entre telas */
function mostrarTela(idTela) {
  const telas = document.querySelectorAll('.tela');
  telas.forEach(t => t.classList.remove('ativa'));
  document.getElementById(idTela).classList.add('ativa');
}

/* Ao carregar a página, buscar pontos de descarte */
window.addEventListener('load', () => {
  carregarPontos();
});

// 1) CADASTRO DE PONTO  (POST /ponto)
async function enviarPonto(event) {
  event.preventDefault();

  const nome = document.getElementById('pontoNome').value.trim();
  const bairro = document.getElementById('pontoBairro').value.trim();
  const tipoLocal = document.querySelector("input[name='pontoTipo']:checked").value;

  const categoria = document.getElementById('pontoCategoria').value;

  const latitude = parseFloat(document.getElementById('pontoLat').value);
  const longitude = parseFloat(document.getElementById('pontoLon').value);

  const spot = {
    name: nome,
    neighborhood: bairro,
    locationType: tipoLocal,
    category: categoria,
    geo: {
      lat: latitude,
      lng: longitude
    }
  };

  console.log(JSON.stringify(spot));

  try {
    const response = await fetch(`${API_BASE}/ponto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spot),
    });

    const result = await response.text();
    alert(result); // padrão do BBB

    document.getElementById('formPonto').reset();
    await carregarPontos();
  } catch (err) {
    console.error(err);
    alert('Erro ao cadastrar ponto de descarte.');
  }
}

// LISTAR PONTOS  (GET /ponto) * preenche selects e resumo
async function carregarPontos() {
  try {
    const response = await fetch(`${API_BASE}/ponto`);
    pontos = await response.json();

    const selDescarte = document.getElementById('descPonto');
    const selFiltro = document.getElementById('filtPonto');
    const resumo = document.getElementById('listaPontosResumo');

    if (selDescarte) selDescarte.innerHTML = '<option value="">Selecione um ponto</option>';
    if (selFiltro) selFiltro.innerHTML = '<option value="">Todos</option>';
    if (resumo) resumo.innerHTML = '';

    if (Array.isArray(pontos)) {
      pontos.forEach((p) => {
        const id = p.id || p._id; // ajuste conforme seu schema

        if (selDescarte) {
          selDescarte.innerHTML += `<option value="${id}">${p.name}</option>`;
        }
        if (selFiltro) {
          selFiltro.innerHTML += `<option value="${id}">${p.name}</option>`;
        }
        if (resumo) {
          const div = document.createElement('div');
          div.className = 'card-ponto';
          div.innerHTML = `
            <strong>${p.name}</strong><br>
            Bairro: ${p.neighborhood}<br>
            Tipo: ${p.locationType}<br>
            Categoria: ${p.category}<br>
            Lat: ${p.geo.lat} / Lon: ${p.geo.lng}
          `;
          resumo.appendChild(div);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// 2) REGISTRO DE DESCARTE  (POST /descarte)
async function enviarDescarte(event) {
  event.preventDefault();

  const userName = document.getElementById('descUsuario').value.trim();
  const spotId = document.getElementById('descPonto').value;
  const wasteType = document.getElementById('descTipoResiduo').value;
  const disposalDate = document.getElementById('descData').value;

  const descarte = {
    userName,
    spotId,
    wasteType,
    disposalDate,
  };

  try {
    const response = await fetch(`${API_BASE}/descarte`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(descarte),
    });

    const result = await response.text();
    alert(result);

    document.getElementById('formDescarte').reset();
  } catch (err) {
    console.error(err);
    alert('Erro ao registrar descarte.');
  }
}

// 3) HISTÓRICO DE DESCARTES  (GET /descarte/filtrar)
async function buscarHistorico(event) {
  event.preventDefault();

  const userName   = document.getElementById('filtUsuario').value.trim();
  const wasteType  = document.getElementById('filtTipoResiduo').value;
  const spotId     = document.getElementById('filtPonto').value;
  const dataInicio = document.getElementById('filtDataInicio').value;
  const dataFim    = document.getElementById('filtDataFim').value;

  const resultadosAcumulados = [];

  try {
    // Sem intervalo informado: consulta única (sem filtro de data)
    if (!dataInicio && !dataFim) {
      const params = new URLSearchParams();
      if (userName)  params.append('userName', userName);
      if (wasteType) params.append('wasteType', wasteType);
      if (spotId)    params.append('spotId', spotId);

      const url = `${API_BASE}/descarte/filtrar?${params.toString()}`;
      const resp = await fetch(url);
      const lista = await resp.json();
      resultadosAcumulados.push(...lista);
    } else {
      // Intervalo de datas (inclusive)
      const inicio = new Date(dataInicio || dataFim);
      const fim    = new Date(dataFim || dataInicio);

      // Normaliza: se veio invertido, corrige
      if (inicio > fim) {
        const tmp = inicio;
        inicio.setTime(fim.getTime());
        fim.setTime(tmp.getTime());
      }

      // Loop dia a dia
      for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
        const dataISO = formatarDataISO(d);

        const params = new URLSearchParams();
        if (userName)  params.append('userName', userName);
        if (wasteType) params.append('wasteType', wasteType);
        if (spotId)    params.append('spotId', spotId);
        params.append('disposalDate', dataISO); // API filtra por data EXATA

        const url = `${API_BASE}/descarte/filtrar?${params.toString()}`;
        const resp = await fetch(url);
        const lista = await resp.json();

        if (Array.isArray(lista) && lista.length > 0) {
          resultadosAcumulados.push(...lista);
        }
      }
    }

    renderizarHistorico(resultadosAcumulados);
  } catch (err) {
    console.error(err);
    alert('Erro ao consultar histórico.');
  }
}

// Função auxiliar para formatar Date em 'YYYY-MM-DD'
function formatarDataISO(date) {
  const ano  = date.getFullYear();
  const mes  = String(date.getMonth() + 1).padStart(2, '0');
  const dia  = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// 3) HISTÓRICO DE DESCARTES  (GET /descarte/filtrar)
/* async function buscarHistorico(event) {
  event.preventDefault();

  const userName  = document.getElementById('filtUsuario').value.trim();
  const wasteType = document.getElementById('filtTipoResiduo').value;
  const spotId    = document.getElementById('filtPonto').value;

  // A API filtra por data EXATA (disposalDate)
  const disposalDate = document.getElementById('filtDataInicio').value;

  console.log("Data inserida: ", typeof(disposalDate), disposalDate);

  const params = new URLSearchParams();
  if (userName)      params.append('userName', userName);
  if (wasteType)     params.append('wasteType', wasteType);
  if (spotId)        params.append('spotId', spotId);
  if (disposalDate)  params.append('disposalDate', disposalDate);

  const url = `${API_BASE}/descarte/filtrar?${params.toString()}`;

  try {
    const response  = await fetch(url);
    const historico = await response.json();
    renderizarHistorico(historico);
  } catch (err) {
    console.error(err);
    alert('Erro ao consultar histórico.');
  }
}
*/

/* renderização da tabela de histórico */
function renderizarHistorico(lista) {
  const container = document.getElementById('resultadoHistorico');
  if (!container) return;

  container.innerHTML = '';

  if (!Array.isArray(lista) || lista.length === 0) {
    container.innerHTML = '<p>Nenhum registro encontrado.</p>';
    return;
  }

  const tabela = document.createElement('table');
  tabela.innerHTML = `
    <thead>
      <tr>
        <th>Data</th>
        <th>Tipo de resíduo</th>
        <th>ID Ponto</th>
        <th>Nome Ponto</th>
        <th>Usuário</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabela.querySelector('tbody');

  lista.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatarDataBr(item.disposalDate)}</td>
      <td>${item.wasteType || ''}</td>
      <td>${item.spotId || ''}</td>
      <td>${obterNomePonto(item.spotId)}</td>
      <td>${item.userName || ''}</td>
    `;
    tbody.appendChild(tr);
  });

  container.appendChild(tabela);
}

// função auxiliar para formatar data ISO em 'DD/MM/YYYY' para a tabela do histórico
function formatarDataBr(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// função auxiliar para obter nome do ponto pelo ID para a tabela do histórico
function obterNomePonto(id) {
  const p = pontos.find(x => x._id === id || x.id === id);
  return p ? p.name : id;
}

// 4) RELATÓRIO / DASHBOARD  (GET /descarte/relatorio)
async function carregarRelatorio() {
  try {
    const response = await fetch(`${API_BASE}/descarte/relatorio`);
    const rel = await response.json();

    const c = document.getElementById('relatorioContainer');
    if (!c) return;

    if (!rel || typeof rel !== 'object') {
      c.innerHTML = '<p>Nenhum dado de relatório disponível.</p>';
      return;
    }

    // Mapeamento direto dos campos da API para os spans do HTML
    const local = rel.localComMaiorNumeroRegistros;
    const tipo = rel.tipoResiduoMaisFrequente;

    document.getElementById('relLocal').textContent =
      local ? `${local.name} (${local.neighborhood}) - ${local.totalRegistros} registros` : '';

    document.getElementById('relTipoResiduo').textContent =
      tipo ? `${tipo.wasteType} (${tipo.totalRegistros} registros)` : '';

    document.getElementById('relMediaDia').textContent =
      rel.mediaDescartesPorDiaUltimos30Dias ?? '';

    document.getElementById('relTotalUsuarios').textContent =
      rel.numeroTotalUsuarios ?? '';

    document.getElementById('relTotalPontos').textContent =
      rel.totalPontosDescarte ?? '';

    document.getElementById('relVariacaoMensal').textContent =
      rel.percentualCrescimentoReducao != null
        ? `${rel.percentualCrescimentoReducao}%`
        : '';

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar relatório.');
  }
}
