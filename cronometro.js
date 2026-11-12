// Cronômetro de descanso
// Cria o próprio HTML na página. Para iniciar ao marcar um exercício: iniciarDescanso(90)
(function () {
  function montar() {
    var raiz = document.createElement('div');
    raiz.id = 'descanso';
    raiz.innerHTML =
      '<div id="descanso-painel" hidden>' +
        '<div id="descanso-tempo" role="timer" aria-live="off">00:00</div>' +
        '<div class="linha">' +
          '<button type="button" data-s="30">0:30</button>' +
          '<button type="button" data-s="60">1:00</button>' +
          '<button type="button" data-s="90">1:30</button>' +
          '<button type="button" data-s="120">2:00</button>' +
        '</div>' +
        '<div class="linha">' +
          '<button type="button" data-a="-15">-15 s</button>' +
          '<button type="button" id="descanso-pausa">Iniciar</button>' +
          '<button type="button" data-a="15">+15 s</button>' +
        '</div>' +
        '<button type="button" id="descanso-zerar">Zerar</button>' +
      '</div>' +
      '<button type="button" id="descanso-fab" aria-label="Abrir cronômetro de descanso">Descanso</button>';
    document.body.appendChild(raiz);

    var painel = document.getElementById('descanso-painel');
    var tempo = document.getElementById('descanso-tempo');
    var fab = document.getElementById('descanso-fab');
    var btnPausa = document.getElementById('descanso-pausa');

    var rodando = false;
    var fim = 0;          // instante (ms) em que o tempo acaba, quando rodando
    var restanteMs = 0;   // tempo que sobra quando pausado
    var ultimo = 60;      // última duração usada, em segundos
    var timer = null;
    var ctx = null;

    function formatar(s) {
      var m = Math.floor(s / 60);
      var r = s % 60;
      return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
    }

    function segundos() {
      var ms = rodando ? fim - Date.now() : restanteMs;
      return Math.max(0, Math.ceil(ms / 1000));
    }

    function atualizar() {
      var s = segundos();
      tempo.textContent = formatar(s);
      var ativo = rodando || restanteMs > 0;
      fab.textContent = ativo ? formatar(s) : 'Descanso';
      btnPausa.textContent = rodando ? 'Pausar' : (restanteMs > 0 ? 'Retomar' : 'Iniciar');
      if (rodando && s === 0) terminar();
    }

    function parar() {
      clearInterval(timer);
      timer = null;
    }

    function preparaAudio() {
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
      } catch (e) {}
    }

    function beep() {
      try {
        preparaAudio();
        [0, 0.25, 0.5].forEach(function (t) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.frequency.value = 880;
          o.connect(g);
          g.connect(ctx.destination);
          var inicio = ctx.currentTime + t;
          g.gain.setValueAtTime(0.25, inicio);
          g.gain.exponentialRampToValueAtTime(0.001, inicio + 0.18);
          o.start(inicio);
          o.stop(inicio + 0.2);
        });
      } catch (e) {}
    }

    function terminar() {
      rodando = false;
      restanteMs = 0;
      parar();
      beep();
      if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
      painel.hidden = false;
      painel.classList.add('fim');
      tempo.textContent = '00:00';
      fab.textContent = 'Descanso';
      btnPausa.textContent = 'Iniciar';
    }

    function iniciar(seg) {
      preparaAudio();
      ultimo = seg;
      painel.classList.remove('fim');
      restanteMs = seg * 1000;
      fim = Date.now() + restanteMs;
      rodando = true;
      parar();
      timer = setInterval(atualizar, 250);
      atualizar();
    }

    function ajustar(delta) {
      painel.classList.remove('fim');
      if (rodando) {
        fim = Math.max(Date.now(), fim + delta * 1000);
      } else {
        restanteMs = Math.max(0, restanteMs + delta * 1000);
      }
      atualizar();
    }

    function alternar() {
      painel.classList.remove('fim');
      if (rodando) {
        restanteMs = Math.max(0, fim - Date.now());
        rodando = false;
        parar();
      } else if (restanteMs > 0) {
        preparaAudio();
        fim = Date.now() + restanteMs;
        rodando = true;
        parar();
        timer = setInterval(atualizar, 250);
      } else {
        iniciar(ultimo);
        return;
      }
      atualizar();
    }

    function zerar() {
      rodando = false;
      restanteMs = 0;
      parar();
      painel.classList.remove('fim');
      atualizar();
    }

    fab.addEventListener('click', function () {
      painel.hidden = !painel.hidden;
      painel.classList.remove('fim');
      fab.setAttribute('aria-label', painel.hidden ? 'Abrir cronômetro de descanso' : 'Fechar cronômetro de descanso');
    });

    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.s) iniciar(parseInt(b.dataset.s, 10));
      else if (b.dataset.a) ajustar(parseInt(b.dataset.a, 10));
    });
    btnPausa.addEventListener('click', alternar);
    document.getElementById('descanso-zerar').addEventListener('click', zerar);

    // Recalcula ao voltar para a aba (o tempo é medido pelo relógio, não pelo intervalo)
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && rodando) atualizar();
    });

    // Uso: iniciarDescanso(90) começa uma contagem de 90 segundos
    window.iniciarDescanso = function (seg) {
      iniciar(seg || ultimo);
    };

    atualizar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
