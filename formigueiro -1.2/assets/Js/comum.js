/* Formigueiro - funções compartilhadas entre cadastro e login */
window.Formigueiro = (function () {
  "use strict";

  function blocoDe(campo) {
    return campo.closest(".campo") || campo.closest(".termos");
  }

  function elementoErro(campo) {
    return document.getElementById("erro-" + campo.id);
  }

  /* O atributo "hidden" não funciona em <svg> via propriedade, então usamos o atributo. */
  function ocultar(el, ocultarAgora) {
    if (!el) return;
    if (ocultarAgora) el.setAttribute("hidden", "");
    else el.removeAttribute("hidden");
  }

  function mostrarErro(campo, texto) {
    var erro = elementoErro(campo);
    if (erro) {
      erro.textContent = texto;
      campo.setAttribute("aria-describedby", erro.id);
    }
    blocoDe(campo).classList.add("invalido");
    campo.setAttribute("aria-invalid", "true");
    return false;
  }

  function limparErro(campo) {
    var erro = elementoErro(campo);
    if (erro) erro.textContent = "";
    blocoDe(campo).classList.remove("invalido");
    campo.removeAttribute("aria-invalid");
    campo.removeAttribute("aria-describedby");
    return true;
  }

  /* E-mail ou celular com DDD */
  function validarContato(campo, msgVazio) {
    var valor = campo.value.trim();
    if (!valor) return mostrarErro(campo, msgVazio || "Informe um e-mail ou celular.");

    if (valor.indexOf("@") !== -1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
        return mostrarErro(campo, "Digite um e-mail válido, como nome@exemplo.com.");
      }
    } else {
      var digitos = valor.replace(/\D/g, "");
      if (digitos.length < 10 || digitos.length > 11) {
        return mostrarErro(campo, "Digite um celular com DDD, como (83) 99999-9999.");
      }
    }
    return limparErro(campo);
  }

  function mascaraCelular(valor) {
    var d = valor.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  /* Só aplica a máscara enquanto a pessoa digita apenas números (celular) */
  function ativarMascaraContato(campo) {
    campo.addEventListener("input", function () {
      var v = campo.value;
      if (v.length > 0 && /^[\d\s()\-]+$/.test(v)) campo.value = mascaraCelular(v);
    });
  }

  /* Valida ao sair do campo; se já há erro, revalida enquanto a pessoa corrige */
  function ligarValidacao(campos, validadores) {
    Object.keys(validadores).forEach(function (nome) {
      var campo = campos[nome];
      if (!campo) return;
      var ehCheckbox = campo.type === "checkbox";

      campo.addEventListener(ehCheckbox ? "change" : "blur", function () {
        validadores[nome](campo);
      });
      if (!ehCheckbox) {
        campo.addEventListener("input", function () {
          if (blocoDe(campo).classList.contains("invalido")) validadores[nome](campo);
        });
      }
    });
  }

  /* Valida tudo e devolve o primeiro campo inválido (ou null) */
  function validarTudo(campos, validadores) {
    var primeiro = null;
    Object.keys(validadores).forEach(function (nome) {
      var ok = validadores[nome](campos[nome]);
      if (!ok && !primeiro) primeiro = campos[nome];
    });
    return primeiro;
  }

  function exibirMensagem(el, texto, tipo) {
    if (!el) return;
    el.textContent = texto;
    el.className = "aviso aviso-" + tipo;
    ocultar(el, false);
  }

  /* Botões Google/Apple: ainda sem integração no protótipo */
  function ligarBotoesSociais(mensagemEl) {
    document.querySelectorAll(".social a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var nome = link.textContent.trim();
        exibirMensagem(mensagemEl, "A conexão com " + nome + " ainda não está disponível neste protótipo.", "info");
      });
    });
  }

  function salvar(chave, objeto) {
    try { localStorage.setItem(chave, JSON.stringify(objeto)); } catch (e) { /* segue o fluxo */ }
  }

  function ler(chave) {
    try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; }
  }

  return {
    ocultar: ocultar,
    mostrarErro: mostrarErro,
    limparErro: limparErro,
    validarContato: validarContato,
    ativarMascaraContato: ativarMascaraContato,
    ligarValidacao: ligarValidacao,
    validarTudo: validarTudo,
    exibirMensagem: exibirMensagem,
    ligarBotoesSociais: ligarBotoesSociais,
    salvar: salvar,
    ler: ler
  };
})();
