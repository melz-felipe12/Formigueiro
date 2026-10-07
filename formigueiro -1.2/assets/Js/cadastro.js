/* Formigueiro - Cadastro (ONG e Doador) */
(function () {
  "use strict";

  var F = window.Formigueiro;
  var form = document.getElementById("form-cadastro");
  if (!form) return;

  var tipo = form.dataset.tipo === "doador" ? "doador" : "ong";
  var ehOng = tipo === "ong";

  var botao = form.querySelector(".botao");
  var mensagem = document.getElementById("mensagem-form");

  var inputFoto = document.getElementById("foto");
  var previa = document.getElementById("foto-previa");
  var iconeFoto = document.getElementById("foto-icone");
  var erroFoto = document.getElementById("erro-foto");
  var TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

  var campos = {
    nome: document.getElementById("nome"),
    contato: document.getElementById("contato"),
    senha: document.getElementById("senha"),
    endereco: document.getElementById("endereco"),
    termos: document.getElementById("termos")
  };

  /* ---------- Validações ---------- */
  var validadores = {
    nome: function (campo) {
      var valor = campo.value.trim();
      if (!valor) return F.mostrarErro(campo, ehOng ? "Informe o nome da instituição." : "Informe seu nome.");
      if (valor.length < 3) return F.mostrarErro(campo, "O nome precisa ter pelo menos 3 caracteres.");
      return F.limparErro(campo);
    },

    contato: function (campo) {
      return F.validarContato(campo, "Informe um e-mail ou celular.");
    },

    senha: function (campo) {
      var valor = campo.value;
      if (!valor) return F.mostrarErro(campo, "Crie uma senha.");
      if (valor.length < 8) return F.mostrarErro(campo, "A senha precisa ter pelo menos 8 caracteres.");
      if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
        return F.mostrarErro(campo, "Use letras e números na senha.");
      }
      return F.limparErro(campo);
    },

    endereco: function (campo) {
      var valor = campo.value.trim();
      if (!valor) return F.mostrarErro(campo, ehOng ? "Informe o endereço da instituição." : "Informe seu endereço.");
      if (valor.length < 8) return F.mostrarErro(campo, "Digite o endereço completo, com rua, bairro e cidade.");
      return F.limparErro(campo);
    },

    termos: function (campo) {
      if (!campo.checked) return F.mostrarErro(campo, "Aceite os termos para criar a conta.");
      return F.limparErro(campo);
    }
  };

  F.ativarMascaraContato(campos.contato);
  F.ligarValidacao(campos, validadores);
  F.ligarBotoesSociais(mensagem);

  /* ---------- Foto de perfil ---------- */
  inputFoto.addEventListener("change", function () {
    var arquivo = inputFoto.files[0];
    erroFoto.textContent = "";
    if (!arquivo) return;

    if (arquivo.type.indexOf("image/") !== 0) {
      inputFoto.value = "";
      erroFoto.textContent = "Escolha um arquivo de imagem (JPG, PNG ou WebP).";
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      inputFoto.value = "";
      erroFoto.textContent = "A imagem é maior que 2 MB. Escolha uma menor.";
      return;
    }

    if (previa.src && previa.src.indexOf("blob:") === 0) URL.revokeObjectURL(previa.src);
    previa.src = URL.createObjectURL(arquivo);
    F.ocultar(previa, false);
    F.ocultar(iconeFoto, true);
  });

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
    botao.textContent = "Cadastrando...";

    // A senha nunca deve ser guardada no navegador.
    // TODO: trocar este bloco por uma chamada ao back-end (fetch POST).
    var conta = {
      tipo: tipo,
      nome: campos.nome.value.trim(),
      contato: campos.contato.value.trim(),
      endereco: campos.endereco.value.trim()
    };

    setTimeout(function () {
      F.salvar("formigueiro:" + tipo, conta);
      F.exibirMensagem(mensagem, "Conta criada! Redirecionando para o login...", "sucesso");
      setTimeout(function () { window.location.href = "login-" + tipo + ".html"; }, 1500);
    }, 800);
  });
})();
