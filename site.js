/* Nicole Leão · Psicóloga Clínica: comportamento compartilhado entre as páginas */
(function(){
  /* Google Analytics 4: preencha o ID (ex.: "G-XXXXXXX") para ativar em todas as páginas.
     Vazio = nenhum cookie e nenhum aviso. */
  var GA_ID = "";

  var temIO = "IntersectionObserver" in window;
  var reduzMov = window.matchMedia("(prefers-reduced-motion: reduce)");
  function cada(lista, fn){ Array.prototype.forEach.call(lista, fn); }

  // Menu do celular
  var btn = document.getElementById("menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) {
    var fecharMenu = function(){ nav.classList.remove("aberto"); btn.setAttribute("aria-expanded","false"); };
    btn.addEventListener("click", function(){
      var aberto = nav.classList.toggle("aberto");
      btn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    nav.addEventListener("click", function(e){ if (e.target.closest("a")) fecharMenu(); });
    document.addEventListener("click", function(e){
      if (nav.classList.contains("aberto") && !e.target.closest(".topo")) fecharMenu();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && nav.classList.contains("aberto")) { fecharMenu(); btn.focus(); }
    });
  }

  // Submenu "Atendimentos" no computador: abre no clique, fecha com Esc, clique fora ou quando o foco sai dele
  var grupo = document.querySelector(".nav-grupo"), subBtn = grupo && grupo.querySelector(".nav-sub-btn");
  if (subBtn) {
    var fecharSub = function(){ grupo.classList.remove("aberto"); subBtn.setAttribute("aria-expanded","false"); };
    subBtn.addEventListener("click", function(){
      var aberto = grupo.classList.toggle("aberto");
      subBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    document.addEventListener("click", function(e){
      if (grupo.classList.contains("aberto") && !grupo.contains(e.target)) fecharSub();
    });
    grupo.addEventListener("focusout", function(e){
      if (e.relatedTarget && !grupo.contains(e.relatedTarget)) fecharSub();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && grupo.classList.contains("aberto")) { fecharSub(); subBtn.focus(); }
    });
  }

  // Cabeçalho fixo: a borda e a sombra só aparecem quando há conteúdo passando por baixo
  var topo = document.querySelector(".topo");
  if (topo) {
    var marcarTopo = function(){ topo.classList.toggle("rolado", window.scrollY > 4); };
    window.addEventListener("scroll", marcarTopo, { passive: true });
    marcarTopo();
  }

  // Botão flutuante: some sempre que outro botão de WhatsApp já está na tela (abertura, rodapé ou botões do texto),
  // para nunca haver dois iguais à vista nem um cobrindo o outro
  var flut = document.querySelector(".flutuante");
  var cobertos = document.querySelectorAll("[data-sem-flutuante]");
  if (flut) {
    var mostrar = function(sim){
      flut.classList.toggle("recolhido", !sim);
      flut.setAttribute("tabindex", sim ? "0" : "-1");
      if (sim) flut.removeAttribute("aria-hidden"); else flut.setAttribute("aria-hidden", "true");
    };
    if (!temIO || !cobertos.length) {
      mostrar(true);
    } else {
      var naTela = [];
      var obsFlut = new IntersectionObserver(function(entradas){
        entradas.forEach(function(e){
          var i = naTela.indexOf(e.target);
          if (e.intersectionRatio >= 0.2 && i === -1) naTela.push(e.target);
          if (e.intersectionRatio < 0.2 && i !== -1) naTela.splice(i, 1);
        });
        mostrar(naTela.length === 0);
      }, { threshold: [0, 0.2] });
      cada(cobertos, function(el){ obsFlut.observe(el); });
    }
  }

  // Sinais por público: as abas alternam sozinhas e param de vez quando a pessoa escolhe uma.
  // O tempo de cada aba é a própria animação da barrinha de progresso (5s no CSS): ao terminar, avança.
  var troca = document.querySelector("[data-sinais]");
  if (troca) {
    var abas = Array.prototype.slice.call(troca.querySelectorAll('[role="tab"]'));
    var faixaAbas = troca.querySelector('[role="tablist"]');
    var botaoWA = document.querySelector("[data-wa-publico]");
    var atual = 0;
    var mostrarAba = function(i, focar){
      atual = (i + abas.length) % abas.length;
      abas.forEach(function(aba, n){
        var sel = n === atual;
        aba.setAttribute("aria-selected", sel ? "true" : "false");
        aba.tabIndex = sel ? 0 : -1;
        document.getElementById(aba.getAttribute("aria-controls")).classList.toggle("ativo", sel);
      });
      var aba = abas[atual];
      if (focar) aba.focus();
      // No celular as abas rolam de lado: centraliza a ativa sem mexer na rolagem da página
      faixaAbas.scrollTo({ left: aba.offsetLeft - (faixaAbas.clientWidth - aba.offsetWidth) / 2, behavior: reduzMov.matches ? "auto" : "smooth" });
    };
    // Quando a pessoa escolhe, a rotação para e o botão de WhatsApp passa a falar daquele público
    var fixar = function(){
      troca.classList.remove("girando");
      if (botaoWA) botaoWA.href = abas[atual].getAttribute("data-wa");
    };
    abas.forEach(function(aba, n){
      aba.addEventListener("click", function(){ mostrarAba(n); fixar(); });
    });
    faixaAbas.addEventListener("keydown", function(e){
      var destino = { ArrowRight: atual + 1, ArrowLeft: atual - 1, Home: 0, End: abas.length - 1 }[e.key];
      if (destino === undefined) return;
      e.preventDefault(); mostrarAba(destino, true); fixar();
    });
    troca.classList.add("pronto");

    if (!reduzMov.matches) {
      troca.classList.add("girando", "pausado");
      faixaAbas.addEventListener("animationend", function(e){
        if (e.animationName === "nl-progresso" && troca.classList.contains("girando")) mostrarAba(atual + 1);
      });
      // Só corre com a seção na tela, sem o mouse em cima e com a aba do navegador visível
      var naTela = !temIO, mouseEmCima = false;
      var atualizar = function(){ troca.classList.toggle("pausado", !naTela || mouseEmCima || document.hidden); };
      if (temIO) new IntersectionObserver(function(ent){ naTela = ent[0].isIntersecting; atualizar(); }, { threshold: 0.5 }).observe(troca);
      troca.addEventListener("mouseenter", function(){ mouseEmCima = true; atualizar(); });
      troca.addEventListener("mouseleave", function(){ mouseEmCima = false; atualizar(); });
      document.addEventListener("visibilitychange", atualizar);
      // Tocar para rolar as abas ou entrar com o teclado também entrega o controle à pessoa
      faixaAbas.addEventListener("pointerdown", function(){ troca.classList.remove("girando"); });
      troca.addEventListener("focusin", function(){ troca.classList.remove("girando"); });
      atualizar();
    }

    // Chegando por #sinais-infantil, #sinais-adolescentes etc. (links das páginas de atendimento):
    // abre a aba daquele público e para a troca automática
    var abrirPorEndereco = function(){
      var n = abas.indexOf(location.hash ? document.getElementById(location.hash.slice(1)) : null);
      if (n !== -1) { mostrarAba(n); fixar(); }
    };
    abrirPorEndereco();
    window.addEventListener("hashchange", abrirPorEndereco);
  }

  // Revelação suave ao rolar. O que já está na tela ao carregar fica parado,
  // para não piscar nem atrasar a abertura (e quem chega por um link #âncora já vê o conteúdo).
  if (temIO && !reduzMov.matches) {
    var alvos = Array.prototype.filter.call(document.querySelectorAll(".revela"), function(el){
      return el.getBoundingClientRect().top > window.innerHeight;
    });
    // Cartões de uma mesma grade entram em cascata
    cada(document.querySelectorAll("[data-cascata]"), function(grade){
      var n = 0;
      cada(grade.children, function(filho){
        if (alvos.indexOf(filho) !== -1) { filho.style.transitionDelay = Math.min(n, 5) * 60 + "ms"; n++; }
      });
    });
    alvos.forEach(function(el){ el.classList.add("anima"); });
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add("vis"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    alvos.forEach(function(el){ obs.observe(el); });
  }

  // Métricas: cada botão de WhatsApp informa a origem; cada caminho informa qual parte foi escolhida
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  document.addEventListener("click", function(e){
    var a = e.target.closest("a[data-origem], a[data-caminho]");
    if (!a) return;
    if (a.hasAttribute("data-origem")) gtag("event", "clique_whatsapp", { origem: a.getAttribute("data-origem") });
    else gtag("event", "clique_caminho", { caminho: a.getAttribute("data-caminho") });
  });

  // Consentimento de cookies (só com GA_ID preenchido)
  var aviso = document.getElementById("cookies");
  if (!GA_ID || !aviso) return;
  var CHAVE = "nl-cookies", escolha = null;
  try { escolha = localStorage.getItem(CHAVE); } catch (err) {}
  function carregarGA(){
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date()); gtag("config", GA_ID, { anonymize_ip: true });
  }
  if (escolha === "aceito") carregarGA();
  else if (escolha !== "recusado") aviso.hidden = false;
  function salvar(v){ try { localStorage.setItem(CHAVE, v); } catch (err) {} aviso.hidden = true; if (v === "aceito") carregarGA(); }
  document.getElementById("cookies-aceitar").addEventListener("click", function(){ salvar("aceito"); });
  document.getElementById("cookies-recusar").addEventListener("click", function(){ salvar("recusado"); });
})();
