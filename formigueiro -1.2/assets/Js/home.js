/* ===== Formigueiro | Home ONG ===== */
(function () {
  'use strict';

  // Troque por dados vindos da API/back-end quando existir.
  var CAMPANHAS = [
    {
      id: 1,
      ong: 'Mesa Solidária',
      titulo: 'Necessário: Arroz e Feijão',
      prazo: '15/09',
      bairro: 'São Sebastião',
      progresso: 65,
      imagem: 'assets/img/arroz-feijao.jpg'
    },
    {
      id: 2,
      ong: 'ONG Prato Cheio',
      titulo: 'Necessário: Óleo de Cozinha',
      prazo: '28/09',
      bairro: 'Belo Horizonte',
      progresso: 90,
      imagem: 'assets/img/oleo-cozinha.jpg'
    },
    {
      id: 3,
      ong: 'ONG Prato Cheio',
      titulo: 'Necessário: Leite em Pó',
      prazo: '11/10',
      bairro: 'Jatobá',
      progresso: 50,
      imagem: 'assets/img/leite-po.jpg'
    }
  ];

  // Bairros que sempre aparecem no filtro, mesmo sem campanha ativa.
  var BAIRROS_FIXOS = ['São Sebastião', 'Jatobá', 'Salgadinho'];

  var ICONE_CALENDARIO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  var ICONE_LOCAL =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';

  var estado = { bairro: 'todos', busca: '' };

  var elLista = document.getElementById('campanhas');
  var elBairros = document.getElementById('bairros-lista');
  var elBusca = document.getElementById('busca');
  var elVazio = document.getElementById('vazio');

  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function escapar(texto) {
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function listaDeBairros() {
    var nomes = BAIRROS_FIXOS.slice();
    CAMPANHAS.forEach(function (c) {
      if (nomes.indexOf(c.bairro) === -1) nomes.push(c.bairro);
    });
    return nomes;
  }

  function contarPorBairro(bairro) {
    return CAMPANHAS.filter(function (c) { return c.bairro === bairro; }).length;
  }

  function textoContagem(n) {
    if (n === 0) return '0 Ativas';
    return n + (n === 1 ? ' Campanha' : ' Campanhas');
  }

  function renderBairros() {
    var itens = [{ valor: 'todos', nome: 'Todos os bairros', contagem: null }];
    listaDeBairros().forEach(function (nome) {
      itens.push({ valor: nome, nome: nome, contagem: contarPorBairro(nome) });
    });

    elBairros.innerHTML = itens.map(function (item) {
      var ativo = item.valor === estado.bairro;
      return '<li><button type="button" class="bairro' + (ativo ? ' ativo' : '') +
        '" data-bairro="' + escapar(item.valor) + '" aria-pressed="' + ativo + '">' +
        '<span>' + escapar(item.nome) + '</span>' +
        (item.contagem === null ? '' : '<small>' + textoContagem(item.contagem) + '</small>') +
        '</button></li>';
    }).join('');
  }

  function cartao(c) {
    return '<a class="card" href="campanha.html?id=' + c.id + '">' +
      '<div class="card-imagem"><img src="' + escapar(c.imagem) + '" alt="' + escapar(c.titulo) +
      '" loading="lazy" onerror="this.remove()"></div>' +
      '<div class="card-corpo">' +
        '<p class="card-ong">' + escapar(c.ong) + '</p>' +
        '<h3 class="card-titulo">' + escapar(c.titulo) + '</h3>' +
        '<div class="card-info">' +
          '<span>' + ICONE_CALENDARIO + 'Até ' + escapar(c.prazo) + '</span>' +
          '<span>' + ICONE_LOCAL + escapar(c.bairro) + ', Patos</span>' +
        '</div>' +
        '<div class="progresso-topo"><span>Progresso da meta</span><strong>' + c.progresso + '%</strong></div>' +
        '<div class="progresso-trilho" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
          c.progresso + '" aria-label="Progresso da meta"><div class="progresso-barra" style="width:' + c.progresso + '%"></div></div>' +
      '</div></a>';
  }

  function renderCampanhas() {
    var termo = normalizar(estado.busca);

    var filtradas = CAMPANHAS.filter(function (c) {
      var bairroOk = estado.bairro === 'todos' || c.bairro === estado.bairro;
      var buscaOk = !termo || normalizar(c.ong).indexOf(termo) !== -1;
      return bairroOk && buscaOk;
    });

    elLista.innerHTML = filtradas.map(cartao).join('');
    elVazio.hidden = filtradas.length > 0;
  }

  elBairros.addEventListener('click', function (e) {
    var botao = e.target.closest('.bairro');
    if (!botao) return;
    estado.bairro = botao.getAttribute('data-bairro');
    renderBairros();
    renderCampanhas();
  });

  elBusca.addEventListener('input', function () {
    estado.busca = elBusca.value;
    renderCampanhas();
  });

  renderBairros();
  renderCampanhas();
})();