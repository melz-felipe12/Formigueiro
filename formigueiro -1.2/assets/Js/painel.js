/* ===== Formigueiro | Painel da ONG ===== */
(function () {
  'use strict';

  // Troque por dados vindos da API/back-end quando existir.
  var DOACOES_BASE = 14;

  var CAMPANHAS = [
    {
      id: 1,
      titulo: 'Arrecadação: Óleo de Cozinha',
      itens: 'Óleo de cozinha soja (900ml)',
      arrecadado: 65,
      meta: 100,
      unidade: 'garrafas'
    },
    {
      id: 2,
      titulo: 'Arrecadação de Leite em Pó',
      itens: 'Leite em pó integral (sachê)',
      arrecadado: 120,
      meta: 120,
      unidade: ''
    }
  ];

  var doacoes = DOACOES_BASE;

  var ICONE_EDITAR =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  var ICONE_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

  var elLista = document.getElementById('lista');
  var elVazio = document.getElementById('vazio');
  var elAtivas = document.getElementById('stat-ativas');
  var elDoacoes = document.getElementById('stat-doacoes');
  var elToast = document.getElementById('toast');
  var modal = document.getElementById('modal');
  var formModal = document.getElementById('form-recebimento');
  var inputQtd = document.getElementById('quantidade');
  var erroQtd = document.getElementById('erro-quantidade');
  var textoModal = document.getElementById('modal-campanha');

  var campanhaAberta = null;
  var temporizadorToast = null;

  function escapar(texto) {
    var div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function encerrada(c) { return c.arrecadado >= c.meta; }

  function percentual(c) {
    return Math.min(100, Math.round((c.arrecadado / c.meta) * 100));
  }

  function textoArrecadado(c) {
    return 'Arrecadado: ' + c.arrecadado + ' de ' + c.meta + (c.unidade ? ' ' + c.unidade : '');
  }

  function renderResumo() {
    elAtivas.textContent = CAMPANHAS.filter(function (c) { return !encerrada(c); }).length;
    elDoacoes.textContent = doacoes;
  }

  function renderLista() {
    elVazio.hidden = CAMPANHAS.length > 0;

    elLista.innerHTML = CAMPANHAS.map(function (c) {
      var fim = encerrada(c);
      return '<article class="item" data-id="' + c.id + '">' +
        '<div>' +
          '<div class="item-titulo"><h3>' + escapar(c.titulo) + '</h3>' +
          '<span class="selo ' + (fim ? 'encerrada' : 'ativa') + '">' + (fim ? 'Encerrada' : 'Ativa') + '</span></div>' +
          '<p class="item-itens">Itens: ' + escapar(c.itens) + '</p>' +
        '</div>' +
        '<div class="item-progresso">' +
          '<p>' + escapar(textoArrecadado(c)) + '</p>' +
          '<div class="trilho" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percentual(c) +
            '" aria-label="Progresso da campanha"><div class="barra" style="width:' + percentual(c) + '%"></div></div>' +
        '</div>' +
        '<div class="item-acoes">' +
          '<a class="btn btn-neutro" href="criar-campanha.html?id=' + c.id + '">' + ICONE_EDITAR + 'Editar</a>' +
          '<button type="button" class="btn btn-verde" data-acao="confirmar"' + (fim ? ' disabled title="Campanha encerrada"' : '') + '>' +
            ICONE_CHECK + 'Confirmar Recebimento</button>' +
        '</div>' +
      '</article>';
    }).join('');

    renderResumo();
  }

  function avisar(texto) {
    elToast.textContent = texto;
    elToast.hidden = false;
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () { elToast.hidden = true; }, 3500);
  }

  /* ---------- Modal de confirmação ---------- */
  function abrirModal(campanha) {
    campanhaAberta = campanha;
    textoModal.textContent = campanha.titulo + ' · faltam ' + (campanha.meta - campanha.arrecadado) +
      (campanha.unidade ? ' ' + campanha.unidade : '');
    inputQtd.value = '';
    inputQtd.max = campanha.meta - campanha.arrecadado;
    inputQtd.classList.remove('invalido');
    erroQtd.textContent = '';
    modal.showModal();
    inputQtd.focus();
  }

  function fecharModal() {
    modal.close();
    campanhaAberta = null;
  }

  elLista.addEventListener('click', function (e) {
    var botao = e.target.closest('[data-acao="confirmar"]');
    if (!botao || botao.disabled) return;
    var id = Number(botao.closest('.item').getAttribute('data-id'));
    var campanha = CAMPANHAS.filter(function (c) { return c.id === id; })[0];
    if (campanha) abrirModal(campanha);
  });

  document.getElementById('modal-cancelar').addEventListener('click', fecharModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) fecharModal(); // clique no fundo escuro
  });

  formModal.addEventListener('submit', function (e) {
    e.preventDefault();
    var restante = campanhaAberta.meta - campanhaAberta.arrecadado;
    var qtd = parseInt(inputQtd.value, 10);

    if (!qtd || qtd < 1) {
      erroQtd.textContent = 'Informe uma quantidade maior que zero.';
      inputQtd.classList.add('invalido');
      return;
    }
    if (qtd > restante) {
      erroQtd.textContent = 'A quantidade passa da meta. Máximo: ' + restante + '.';
      inputQtd.classList.add('invalido');
      return;
    }

    // TODO: enviar a confirmação para o back-end (fetch POST) quando a API existir.
    campanhaAberta.arrecadado += qtd;
    doacoes += 1;
    var titulo = campanhaAberta.titulo;
    var fim = encerrada(campanhaAberta);

    fecharModal();
    renderLista();
    avisar(fim ? 'Meta atingida! "' + titulo + '" foi encerrada.' : 'Recebimento confirmado.');
  });

  inputQtd.addEventListener('input', function () {
    erroQtd.textContent = '';
    inputQtd.classList.remove('invalido');
  });

  renderLista();
})();
