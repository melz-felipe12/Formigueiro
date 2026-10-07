/* Formigueiro - Login (ONG e Doador) */
(function () {
  "use strict";

  var F = window.Formigueiro;
  var form = document.getElementById("form-login");
  if (!form) return;

  var tipo = form.dataset.tipo === "doador" ? "doador" : "ong";
  var destino = form.dataset.destino || "campanhas.html";

  var botao = form.querySelector(".botao");
  var mensagem = document.getElementById("mensagem-form");
  var esqueceu = document.getElementById("esqueceu");
  var verSenha = form.querySelector(".ver-senha");

  var campos = {
    email: document.getElementById("email"),
    senha: document.getElementById("senha")
  };

  /* ---------- Validações ---------- */
  var validadores = {
    email: function (campo) {
      return F.validarContato(campo, "Informe seu e-mail ou celular.");
    },
    senha: function (campo) {
      if (!campo.value) return F.mostrarErro(campo, "Digite sua senha.");
      return F.limparErro(campo);
    }
  };

  F.ativarMascaraContato(campos.email);
  F.ligarValidacao(campos, validadores);
  F.ligarBotoesSociais(mensagem);

  /* Se a pessoa acabou de se cadastrar, já preenche o e-mail/celular */
  var cadastro = F.ler("formigueiro:" + tipo);
  if (cadastro && cadastro.contato) {
    campos.email.value = cadastro.contato;
    campos.senha.focus();
  }

  /* ---------- Mostrar / ocultar senha ---------- */
  var ICONE_OLHO = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  var ICONE_OLHO_CORTADO = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

  if (verSenha) {
    verSenha.addEventListener("click", function () {
      var mostrando = campos.senha.type === "text";
      campos.senha.type = mostrando ? "password" : "text";
      verSenha.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
      verSenha.querySelector("svg").innerHTML = mostrando ? ICONE_OLHO : ICONE_OLHO_CORTADO;
      campos.senha.focus();
    });
  }

  /* ---------- Esqueceu a senha (ainda sem tela no protótipo) ---------- */
  if (esqueceu) {
    esqueceu.addEventListener("click", function (e) {
      e.preventDefault();
      F.exibirMensagem(mensagem, "A recuperação de senha ainda não está disponível neste protótipo.", "info");
    });
  }

  /* ---------- Envio ---------- */
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    F.ocultar(mensagem, true);

    var primeiroInvalido = F.validarTudo(campos, validadores);
    if (primeiroInvalido) {
      primeiroInvalido.focus();
      return;
    }

    botao.disabled = true;
    botao.textContent = "Entrando...";

    // TODO: trocar este bloco por uma chamada de autenticação ao back-end (fetch POST).
    setTimeout(function () {
      F.salvar("formigueiro:sessao", { tipo: tipo, contato: campos.email.value.trim() });
      F.exibirMensagem(mensagem, "Login realizado! Entrando...", "sucesso");
      setTimeout(function () { window.location.href = destino; }, 900);
    }, 800);
  });
})();
