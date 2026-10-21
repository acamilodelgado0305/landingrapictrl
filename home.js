/* ═══════════════════════════════════════════════════════════
   RAPICTRL LANDING — home.js  (solo index.html)
   Menús, demo interactiva, animación del registro rápido,
   acordeón de ventas, apariciones al hacer scroll y la barra
   fija del celular. El pixel vive aparte, en pixel.js.
═══════════════════════════════════════════════════════════ */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conHover = matchMedia('(hover: hover)').matches;

  /* ── Año ─────────────────────────────────────────────────── */
  $('#year').textContent = new Date().getFullYear();

  /* ── Encabezado ──────────────────────────────────────────── */
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Menú "Funcionalidades" (computador) ─────────────────── */
  const megaBtn = $('#mega-btn');
  const mega = $('#mega');
  function setMega(abierto) {
    mega.hidden = !abierto;
    megaBtn.setAttribute('aria-expanded', String(abierto));
  }
  // Con mouse se abre al pasar por encima; el clic solo lo deja abierto
  // (si alternara, el mismo gesto que lo abrió lo cerraría).
  megaBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMega(conHover ? true : mega.hidden);
  });
  if (conHover) {
    let cierre;
    const dd = megaBtn.parentElement;
    dd.addEventListener('mouseenter', () => { clearTimeout(cierre); setMega(true); });
    dd.addEventListener('mouseleave', () => { cierre = setTimeout(() => setMega(false), 160); });
  }
  document.addEventListener('click', (e) => {
    if (!mega.hidden && !mega.contains(e.target)) setMega(false);
  });

  /* ── Menú del celular ────────────────────────────────────── */
  const burger = $('#burger');
  const sheet = $('#sheet');
  function setSheet(abierto) {
    if (abierto) sheet.style.height = `${window.innerHeight - hdr.getBoundingClientRect().bottom}px`;
    sheet.hidden = !abierto;
    burger.setAttribute('aria-expanded', String(abierto));
    burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('sheet-open', abierto);
  }
  burger.addEventListener('click', () => setSheet(sheet.hidden));
  $$('a', sheet).forEach((a) => a.addEventListener('click', () => setSheet(false)));
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setSheet(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setMega(false);
    if (!sheet.hidden) { setSheet(false); burger.focus(); }
  });

  /* ── Demo interactiva ────────────────────────────────────── */
  const demo = $('#demo-app');
  const appMain = $('#app-main');
  const chips = $('.demo-chips', demo);

  function mostrarPantalla(nombre) {
    if (!$(`.scr[data-screen="${nombre}"]`, demo)) return;
    $$('.scr', demo).forEach((s) => s.classList.toggle('is-on', s.dataset.screen === nombre));
    $$('button[data-screen]', demo).forEach((b) => {
      const activo = b.dataset.screen === nombre;
      b.classList.toggle('is-on', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
    $('#demo-url').textContent = nombre;
    appMain.scrollTop = 0;
    // Deja visible la ficha activa sin mover la página en vertical.
    const chip = $(`.chip[data-screen="${nombre}"]`, chips);
    if (chip && chips.scrollWidth > chips.clientWidth) {
      chips.scrollTo({
        left: chip.offsetLeft - (chips.clientWidth - chip.offsetWidth) / 2,
        behavior: sinMovimiento ? 'auto' : 'smooth',
      });
    }
  }

  demo.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-screen], button[data-goto]');
    if (b) mostrarPantalla(b.dataset.screen || b.dataset.goto);
  });

  // Enlaces de fuera de la demo (menús, tarjetas de módulos, pie): el
  // href="#demo" hace el scroll y aquí se elige la pantalla.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-goto]');
    if (!a) return;
    mostrarPantalla(a.dataset.goto);
    setMega(false);
  });

  // Computador / Celular. En pantallas angostas siempre se ve como celular.
  const angosta = matchMedia('(max-width: 719px)');
  let vistaElegida = 'desk';
  function setVista(vista) {
    demo.dataset.view = vista;
    $$('.seg-btn', demo).forEach((b) => {
      const activo = b.dataset.view === vista;
      b.classList.toggle('is-on', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
  }
  $$('.seg-btn', demo).forEach((b) => b.addEventListener('click', () => {
    vistaElegida = b.dataset.view;
    setVista(vistaElegida);
  }));
  const syncVista = () => setVista(angosta.matches ? 'phone' : vistaElegida);
  angosta.addEventListener('change', syncVista);
  syncVista();

  /* ── Registro rápido: el celular que se escribe solo ─────── */
  const EJEMPLOS = [
    { texto: 'almuerzo 25000', tipo: 'Gasto', valor: '$25.000', desc: 'Almuerzo', etiqueta: 'Comida', color: '#f59e0b', fila: '−25.000' },
    { texto: 'taxi 20 lucas', tipo: 'Gasto', valor: '$20.000', desc: 'Taxi', etiqueta: 'Transporte', color: '#16a34a', fila: '−20.000' },
    { texto: '+ venta curso 80k', tipo: 'Ingreso', valor: '$80.000', desc: 'Venta curso', etiqueta: 'Ventas', color: '#2563eb', fila: '+80.000', ingreso: true },
  ];
  const telefono = $('#sp-phone');
  const escrito = $('#sp-typed');
  const campo = escrito.parentElement;
  const hoja = $('#sp-sheet');
  const lista = $('#sp-list');
  let enPantalla = false;
  let corriendo = false;

  async function escribir(texto) {
    campo.classList.add('has-text');
    for (const letra of texto) {
      if (!enPantalla) return;
      escrito.textContent += letra;
      await sleep(55 + Math.random() * 60);
    }
  }
  function llenarHoja(ej) {
    $('#sp-tipo').textContent = ej.tipo;
    $('#sp-amt').textContent = ej.valor;
    $('#sp-desc').textContent = ej.desc;
    const tag = $('#sp-tag');
    tag.textContent = `● ${ej.etiqueta}`;
    tag.style.background = `color-mix(in srgb, ${ej.color} 14%, #fff)`;
    tag.style.color = ej.color;
  }
  function agregarFila(ej) {
    const fila = document.createElement('div');
    fila.className = 'ph-row is-new';
    fila.innerHTML = `<span class="et" style="--c:${ej.color}">${ej.desc[0]}</span><span><b></b><small></small></span><i class="${ej.ingreso ? 'in' : ''}">${ej.fila}</i>`;
    $('b', fila).textContent = ej.desc;
    $('small', fila).textContent = ej.etiqueta;
    $('.ph-day', lista).after(fila);
    const filas = $$('.ph-row', lista);
    if (filas.length > 3) filas[filas.length - 1].remove();
  }
  async function ciclo() {
    if (corriendo) return;
    corriendo = true;
    let n = 0;
    while (enPantalla) {
      const ej = EJEMPLOS[n++ % EJEMPLOS.length];
      await sleep(700);
      await escribir(ej.texto);
      if (!enPantalla) break;
      await sleep(350);
      llenarHoja(ej);
      hoja.classList.add('is-on');
      await sleep(1700);
      hoja.classList.remove('is-on');
      escrito.textContent = '';
      campo.classList.remove('has-text');
      agregarFila(ej);
      await sleep(1600);
    }
    escrito.textContent = '';
    campo.classList.remove('has-text');
    hoja.classList.remove('is-on');
    corriendo = false;
  }
  if (!sinMovimiento && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      enPantalla = e.isIntersecting;
      if (enPantalla) ciclo();
    }, { threshold: 0.35 }).observe(telefono);
  }

  /* ── Acordeón de ventas ──────────────────────────────────── */
  const items = $$('#acc .acc-item');
  items.forEach((item) => {
    $('.acc-btn', item).addEventListener('click', () => {
      items.forEach((otro) => {
        const abierto = otro === item;
        otro.classList.toggle('is-open', abierto);
        $('.acc-btn', otro).setAttribute('aria-expanded', String(abierto));
      });
      $$('.acc-visual .vis').forEach((v) => v.classList.toggle('is-on', v.id === item.dataset.vis));
    });
  });

  /* ── Apariciones al hacer scroll ─────────────────────────── */
  const aparecen = $$('.rv');
  if ('IntersectionObserver' in window && !sinMovimiento) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        // Escalonado dentro de una misma rejilla (tarjetas, planes…).
        const hermanos = Array.from(el.parentElement.children).filter((c) => c.classList.contains('rv'));
        const k = hermanos.indexOf(el);
        if (k > 0) {
          el.style.transitionDelay = `${Math.min(k, 5) * 70}ms`;
          setTimeout(() => { el.style.transitionDelay = ''; }, 1000);
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    aparecen.forEach((el) => io.observe(el));
  } else {
    aparecen.forEach((el) => el.classList.add('in'));
  }

  /* ── Barra fija del celular ──────────────────────────────── */
  // Aparece cuando el hero ya quedó arriba y se esconde en el cierre y el pie,
  // que ya tienen sus propios botones.
  if ('IntersectionObserver' in window) {
    let pasoElHero = false;
    const alFinal = new Set();
    const actualizar = () => document.body.classList.toggle('has-mbar', pasoElHero && alFinal.size === 0);
    new IntersectionObserver(([e]) => {
      pasoElHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      actualizar();
    }).observe($('#inicio'));
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => (e.isIntersecting ? alFinal.add(e.target) : alFinal.delete(e.target)));
      actualizar();
    });
    [$('#empezar'), $('.foot')].forEach((el) => io.observe(el));
  }
})();
