/* ═══════════════════════════════════════════════════════════
   RAPICTRL LANDING — pixel.js  (pixel de Meta)

   APAGADO mientras PIXEL_ID esté vacío. Aun con ID, solo carga
   el pixel real en el dominio publicado: en local (127.0.0.1,
   localhost, file://, vista previa) los eventos se escriben en
   la consola y nunca llegan a Meta. Así se evitan los Purchase
   y Lead falsos de las pruebas locales.

   Eventos:
     PageView  → al cargar la página
     Lead      → clic en cualquier enlace a app.rapictrl.com/register
     Contact   → clic en cualquier enlace a WhatsApp (wa.me)
   `content_name` sale del data-cta del enlace (hero, header,
   plan-profesional, flotante…) para saber qué botón convierte.
═══════════════════════════════════════════════════════════ */
(function () {
  var PIXEL_ID = ''; // ← ID del pixel de Rapictrl. Vacío = apagado.
  var DOMINIOS = ['rapictrl.com', 'www.rapictrl.com'];

  var activo = Boolean(PIXEL_ID) && DOMINIOS.indexOf(location.hostname) !== -1;

  if (activo) {
    /* Snippet oficial de Meta (fbevents.js) */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
  }

  function track(evento, datos) {
    if (activo) window.fbq('track', evento, datos || {});
    else console.info('[pixel simulado]', evento, datos || {});
  }

  track('PageView');

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var nombre = a.getAttribute('data-cta') || undefined;
    if (href.indexOf('app.rapictrl.com/register') !== -1) track('Lead', { content_name: nombre || 'registro' });
    else if (href.indexOf('wa.me/') !== -1) track('Contact', { content_name: nombre || 'whatsapp' });
  }, true);

  window.rapiTrack = track;
})();
