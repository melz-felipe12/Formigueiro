/* ===== Formigueiro | Nova Campanha ===== */
(function () {
  'use strict';

  var ALIMENTOS = [
    'Arroz', 'Feijão', 'Macarrão', 'Óleo', 'Leite em pó',
    'Açúcar', 'Farinha', 'Legumes', 'Carne'
  ];

  var ICONE_X =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  var form = document.getElementById('form-campanha');
  var elChips = document.getElementById('chips');
  var elPrazo = document.getElementById('prazo');
  var elMensagem = document.getElementById('mensagem-form');
  var botao = form.querySelector('.botao');
  var etapas = document.querySelectorAll('.etapa');

  var selecionados = [];

  /* ---------- Chips de alimentos ---------- */
  function renderChips() {
    elChips.innerHTML = ALIMENTOS.map(function (nome) {
      var ativo = selecionados.indexOf(nome) !== -1;
      return '<button type="button" class="chip" data-nome="' + nome + '" aria-pressed="' + ativo + '">' +
        (ativo ? nome + ICONE_X : '+ ' + nome) + '</button>';
    }).join('');
  }

  elChips.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    var nome = chip.getAttribute('data-nome');
    var i = selecionados.indexOf(nome);
    if (i === -1) selecionados.push(nome);
    else selecionados.splice(i, 1);
    renderChips();
    var novo = elChips.querySelector('[data-nome="' + nome + '"]');
    if (novo) novo.focus();
    mostrarErro('alimentos', '');
  });

  /* ---------- Prazo: não permite data passada ---------- */
  function hojeISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  elPrazo.min = hojeISO();

  /* ---------- Etapas laterais seguem o foco ---------- */
  function marcarEtapa(numero) {
    etapas.forEach(function (li) {
      li.classList.toggle('ativa', li.getAttribute('data-etapa') === String(numero));
    });
  }

  form.addEventListener('focusin', function (e) {
    var grupo = e.target.closest('.grupo');
    if (grupo) marcarEtapa(grupo.getAttribute('data-etapa'));
  });

  /* ---------- Validação ---------- */
  function mostrarErro(campo, texto) {
    var el = document.getElementById('erro-' + campo);
    if (el) el.textContent = texto;
    var input = document.getElementById(campo);
    if (input) input.classList.toggle('invalido', !!texto);
  }

  function validar(dados) {
    var ok = true;
    var primeiro = null;

    function falha(campo, texto) {
      mostrarErro(campo, texto);
      ok = false;
      if (!primeiro) primeiro = campo;
    }

    mostrarErro('titulo', '');
    mostrarErro('alimentos', '');
    mostrarErro('meta', '');
    mostrarErro('prazo', '');
    mostrarErro('local', '');

    if (dados.titulo.length < 5) falha('titulo', 'Informe um título com pelo menos 5 caracteres.');
    if (dados.alimentos.length === 0) falha('alimentos', 'Escolha ao menos um alimento.');
    if (!dados.meta) falha('meta', 'Informe a quantidade esperada. Ex: 20 kg de cada item.');
    if (!dados.prazo) falha('prazo', 'Escolha o prazo final de recebimento.');
    else if (dados.prazo < hojeISO()) falha('prazo', 'O prazo não pode ser uma data passada.');
    if (dados.local.length < 10) falha('local', 'Descreva o local ou a forma de entrega.');

    if (primeiro) {
      var alvo = primeiro === 'alimentos' ? elChips.querySelector('.chip') : document.getElementById(primeiro);
      if (alvo) alvo.focus();
    }
    return ok;
  }

  function aviso(tipo, texto) {
    elMensagem.className = 'aviso ' + tipo;
    elMensagem.textContent = texto;
    elMensagem.hidden = false;
  }

  /* ---------- Envio ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    elMensagem.hidden = true;

    var dados = {
      titulo: form.titulo.value.trim(),
      alimentos: selecionados.slice(),
      meta: form.meta.value.trim(),
      prazo: form.prazo.value,
      local: form.local.value.trim(),
      urgente: form.urgente.checked
    };

    if (!validar(dados)) return;

    botao.disabled = true;
    botao.textContent = 'Publicando...';

    // TODO: enviar `dados` para o back-end (fetch POST) quando a API existir.
    console.log('Campanha pronta para enviar:', dados);

    setTimeout(function () {
      aviso('sucesso', 'Campanha publicada! Redirecionando para a lista de campanhas...');
      setTimeout(function () { window.location.href = 'home-ong.html'; }, 1200);
    }, 600);
  });

  /* Limpa o erro de cada campo ao digitar */
  ['titulo', 'meta', 'prazo', 'local'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { mostrarErro(id, ''); });
  });

  renderChips();
})();
