/*
 * story-empleos.js — coreografías del Deck 2 (Los empleos no desaparecen).
 * live-motion.js dibuja raíces, ramas y botones; aquí van los movimientos propios:
 *   tree       el saber viaja como partículas desde la raíz hacia cada rama nueva
 *   decompose  un cargo se abre en tareas: unas las absorbe la IA, otras crecen
 */
(function () {
  var S = (window.__stories = window.__stories || {});
  function qa(sc, sel) { return Array.prototype.slice.call(sc.querySelectorAll(sel)); }

  // ───────── árbol: partículas que suben por cada rama ─────────
  S.tree = function (sc) {
    var tl = gsap.timeline();
    qa(sc, "path.branch").forEach(function (path, i) {
      var dot = sc.querySelector('circle.pt[data-for="' + path.id + '"]');
      if (!dot) return;
      var len = path.getTotalLength();
      var o = { t: 0 };
      dot.setAttribute("opacity", "0");   // la opacidad va por atributo: un estilo la pisaría
      tl.add(gsap.to(o, {
        t: 1, duration: 2.6, ease: "power1.inOut", repeat: -1, repeatDelay: 0.8 + (i % 3) * 0.4,
        onUpdate: function () {
          var p = path.getPointAtLength(o.t * len);
          dot.setAttribute("cx", p.x); dot.setAttribute("cy", p.y); dot.style.opacity = "";
          dot.setAttribute("opacity", o.t < 0.08 ? o.t / 0.08 : (o.t > 0.92 ? (1 - o.t) / 0.08 : 1));
        }
      }), 3.0 + i * 0.35);
    });
    return tl;
  };

  // ───────── descomposición del cargo ─────────
  S.decompose = function (sc) {
    var tl = gsap.timeline();
    var card = sc.querySelector(".dc-card");
    var cb = card.getBoundingClientRect();
    var cx = cb.left + cb.width / 2, cy = cb.top + cb.height / 2;
    var old = qa(sc, ".dc-chip.old"), grow = qa(sc, ".dc-chip.grow"), fresh = qa(sc, ".dc-chip.new");
    var heads = qa(sc, ".dc-head");
    gsap.set(old.concat(grow, fresh, heads), { opacity: 0 });
    tl.fromTo(card, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0.2);
    // las tareas salen de dentro del cargo hacia su columna
    old.concat(grow).forEach(function (el, i) {
      var b = el.getBoundingClientRect();
      tl.fromTo(el, { x: cx - (b.left + b.width / 2), y: cy - (b.top + b.height / 2), scale: 0.5, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.1, ease: "expo.inOut" }, 1.0 + i * 0.09);
    });
    tl.to(heads, { opacity: 1, duration: 0.5, stagger: 0.15 }, 1.9);
    // lo que absorbe la IA se apaga; lo que crece se enciende y aparecen tareas nuevas
    tl.to(old, { opacity: 0.45, filter: "grayscale(1)", duration: 0.8, stagger: 0.08 }, 2.6);
    tl.fromTo(fresh, { opacity: 0, scale: 0.6, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.15 }, 3.0);
    tl.to(card, { opacity: 0.55, duration: 0.8 }, 3.2);
    return tl;
  };
})();
