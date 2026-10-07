/*
 * story-uber.js — coreografía de la secuencia narrativa (Deck 1, slides st1–st5).
 * Cada función recibe la escena activa y devuelve una línea de tiempo GSAP que
 * live-motion.js destruye al salir. Los bucles (repeat: -1) solo corren en vivo;
 * el render estático muestra el fotograma clave definido en el SVG.
 */
(function () {
  var S = (window.__stories = window.__stories || {});
  function q(sc, sel) { return sc.querySelector(sel); }
  function qa(sc, sel) { return Array.prototype.slice.call(sc.querySelectorAll(sel)); }

  // apertura en iris sobre el mundo SVG
  function iris(tl, sc, at, x, y) {
    var w = q(sc, "svg.world");
    tl.fromTo(w, { clipPath: "circle(0% at " + x + " " + y + ")" },
      { clipPath: "circle(150% at " + x + " " + y + ")", duration: 1.8, ease: "power3.inOut" }, at || 0);
  }

  // ───────────── 1 · Le matin ─────────────
  S.matin = function (sc) {
    var tl = gsap.timeline();
    iris(tl, sc, 0, "44%", "86%");
    var nearW = q(sc, "#stA-near-a").getBBox().width + 4;
    var speed = 360;
    tl.add(gsap.fromTo(q(sc, "#stA-nearwrap"), { x: 0 }, { x: -nearW, duration: nearW / speed, ease: "none", repeat: -1 }), 0);
    tl.add(gsap.fromTo(q(sc, "#stA-dashes"), { x: 0 }, { x: -200, duration: 200 / speed, ease: "none", repeat: -1 }), 0);
    tl.add(gsap.fromTo(q(sc, "#stA-farwrap"), { x: 0 }, { x: -520, duration: 30, ease: "sine.inOut", repeat: -1, yoyo: true }), 0);
    tl.add(gsap.fromTo(q(sc, "#stA-clouds"), { x: 0 }, { x: -260, duration: 40, ease: "none", repeat: -1, yoyo: true }), 0);
    tl.fromTo(q(sc, "#stA-sun"), { attr: { cy: 700 } }, { attr: { cy: 430 }, duration: 9, ease: "sine.out" }, 0);
    tl.add(gsap.to(qa(sc, "#stA-car .wheel"), { rotation: 360, transformOrigin: "50% 50%", duration: 0.5, ease: "none", repeat: -1 }), 0);
    tl.add(gsap.fromTo(q(sc, "#stA-car .cb"), { y: 0 }, { y: -4, duration: 0.22, ease: "sine.inOut", repeat: -1, yoyo: true }), 0);
    // un viaje tras otro: pines de pedido y cinco estrellas
    var pins = qa(sc, "#stA-pins > g"), stars = qa(sc, "#stA-stars .st");
    gsap.set(pins.concat(stars), { opacity: 0, transformOrigin: "50% 100%" });
    var cycle = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 1.6 });
    cycle.fromTo(pins[0], { opacity: 0, scale: 0, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2.4)" })
      .to(pins[0], { opacity: 0, y: -30, duration: 0.4 }, "+=0.7")
      .fromTo(stars, { opacity: 0, scale: 0, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(3)", stagger: 0.08 }, "-=0.1")
      .to(stars, { opacity: 0, y: -40, duration: 0.5, stagger: 0.04 }, "+=0.6")
      .fromTo(pins[1], { opacity: 0, scale: 0, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2.4)" })
      .to(pins[1], { opacity: 0, y: -30, duration: 0.4 }, "+=0.7");
    tl.add(cycle, 0);
    return tl;
  };

  // ───────────── 2 · La maison ─────────────
  S.maison = function (sc) {
    var tl = gsap.timeline();
    // la cámara arranca dentro de la ventana y se aleja
    tl.fromTo(q(sc, "#stB-cam"), { scale: 3.1, svgOrigin: "1070 604" }, { scale: 1, svgOrigin: "1070 604", duration: 2.8, ease: "power3.inOut" }, 0);
    tl.fromTo(q(sc, ".jul"), { x: -150, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power2.out" }, 1.0);
    tl.fromTo(qa(sc, ".kid"), { y: 0 }, { y: -26, duration: 0.28, ease: "power2.out", yoyo: true, repeat: 5, stagger: 0.12 }, 2.0);
    qa(sc, ".twinkle").forEach(function (t, i) {
      tl.add(gsap.fromTo(t, { opacity: 0.2 }, { opacity: 1, duration: 0.6 + (i % 3) * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" }), i * 0.2);
    });
    tl.add(gsap.fromTo(qa(sc, "#stB-sparkle circle"), { opacity: 0 }, { opacity: 1, duration: 0.18, repeat: -1, yoyo: true, stagger: { each: 0.09, from: "random" } }), 0.5);
    // el ingreso: monedas que suben del auto a la casa
    var coins = qa(sc, ".coin");
    coins.forEach(function (c, i) {
      tl.add(gsap.fromTo(c, { x: 0, y: 0, opacity: 0, scale: 0.6 },
        { keyframes: [{ x: -220, y: -260, opacity: 1, scale: 1, duration: 0.9, ease: "sine.out" },
                      { x: -500, y: -330, opacity: 0, duration: 0.8, ease: "sine.in" }],
          repeat: -1, repeatDelay: 0.6 }), 2.4 + i * 0.27);
    });
    // los años pasan: el árbol cambia de estación
    var canopy = qa(sc, "#stB-tree .canopy circle");
    var seasons = gsap.timeline({ repeat: -1, delay: 2.6 });
    seasons.to(canopy, { attr: { fill: "#D9822B" }, duration: 1.0 })
      .fromTo(qa(sc, ".leaf"), { x: 0, y: 0, opacity: 1 }, { x: function (i) { return (i % 2 ? 1 : -1) * (30 + i * 9); }, y: 240, rotation: 260, opacity: 0, duration: 1.6, stagger: 0.08, ease: "sine.in" }, "<0.3")
      .to(canopy, { scale: 0.25, transformOrigin: "50% 100%", duration: 0.8 }, "<0.4")
      .to(canopy, { attr: { fill: "#7AA85E" }, scale: 1, duration: 1.0 }, "+=0.4");
    tl.add(seasons, 0);
    return tl;
  };

  // ───────────── 3 · L'algorithme ─────────────
  S.algo = function (sc) {
    var tl = gsap.timeline();
    iris(tl, sc, 0, "49%", "50%");
    qa(sc, ".mc.h").forEach(function (c) {
      var dx = +c.getAttribute("data-dx");
      tl.add(gsap.to(c, { x: "+=" + dx, duration: Math.abs(dx) / 120, ease: "none", repeat: -1, yoyo: true }), 0);
    });
    qa(sc, ".mc.v").forEach(function (c) {
      var dy = +c.getAttribute("data-dy");
      tl.add(gsap.to(c, { y: "+=" + dy, duration: Math.abs(dy) / 110, ease: "none", repeat: -1, yoyo: true }), 0);
    });
    tl.add(gsap.fromTo(q(sc, "#stC-sweep"), { rotation: 0 }, { rotation: 360, svgOrigin: "960 540", duration: 3.6, ease: "none", repeat: -1 }), 0.4);
    tl.add(gsap.fromTo(q(sc, "#stC-ring"), { attr: { r: 50 }, opacity: 1 }, { attr: { r: 110 }, opacity: 0, duration: 1.4, repeat: -1, ease: "power1.out" }), 0.6);
    var stars = qa(sc, "#stC-stars polygon");
    tl.fromTo(stars, { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)", stagger: 0.14 }, 1.2);
    tl.fromTo(q(sc, "#stC-low"), { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "bounce.out" }, 2.4);
    tl.fromTo(q(sc, "#stC-fill"), { scaleY: 0.18, transformOrigin: "50% 100%" }, { scaleY: 0.55, duration: 1.2, ease: "power2.out" }, 1.0);
    tl.fromTo(q(sc, "#stC-detour"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "none" }, 3.0);
    tl.to(q(sc, "#stC-fill"), { scaleY: 0.86, duration: 0.9, ease: "power3.in" }, 4.0);
    tl.fromTo(q(sc, "#stC-alert"), { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" }, 4.7);
    tl.to(q(sc, "#stC-alert"), { rotation: 8, transformOrigin: "50% 100%", duration: 0.06, repeat: 9, yoyo: true }, 5.2);
    tl.to(q(sc, "#stC-tint"), { opacity: 0.22, duration: 0.18, repeat: 3, yoyo: true }, 4.9);
    tl.to(stars, { attr: { fill: "#5B636E" }, duration: 0.4, stagger: 0.06 }, 5.0);
    return tl;
  };

  // ───────────── 4 · La coupure ─────────────
  S.coupure = function (sc) {
    var tl = gsap.timeline();
    tl.fromTo(q(sc, ".flash"), { opacity: 0.9 }, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0);
    tl.fromTo(q(sc, "svg.world"), { scale: 1.08 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0);
    qa(sc, ".bk").forEach(function (b, i) {
      tl.add(gsap.fromTo(b, { x: 0 }, { x: (i % 2 ? 1 : -1) * (20 + (i % 5) * 12), duration: 3 + (i % 4), repeat: -1, yoyo: true, ease: "sine.inOut" }), 0);
    });
    // el teléfono se queda en la mano: se enciende, muestra la app y luego le quitan el acceso
    tl.fromTo(q(sc, "#stD-off"), { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.5);
    tl.fromTo(q(sc, "#stD-route"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power1.inOut" }, 0.8);
    tl.fromTo(q(sc, "#stD-me"), { scale: 0.6, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0.9);
    // el corte: breve parpadeo dentro de la pantalla, pantalla negra, candado
    tl.to(q(sc, "#stD-ghost"), { opacity: 1, duration: 0.06, repeat: 5, yoyo: true }, 2.8);
    tl.set(q(sc, "#stD-dead"), { opacity: 1 }, 3.3);
    tl.fromTo(q(sc, "#stD-dead circle"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 3.4);
    tl.to(q(sc, "#stD-desat"), { opacity: 1, duration: 2.4, ease: "power1.inOut" }, 3.6);
    tl.to(qa(sc, ".bk"), { opacity: 0.12, duration: 2.4 }, 3.6);
    // lluvia: primero se ve afuera, luego las gotas golpean el vidrio y algunas escurren
    var streaks = q(sc, "#stD-streaks");
    tl.to(streaks, { opacity: 1, duration: 1.2 }, 3.5);
    tl.add(gsap.fromTo(streaks, { y: -760, x: 0 }, { y: 0, x: 137, duration: 0.55, ease: "none", repeat: -1 }), 3.5);
    var beads = qa(sc, ".bead .bi");
    gsap.set(beads, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    beads.forEach(function (b, i) {
      var t = 3.9 + ((i * 0.6180339) % 1) * 4.5;          // impactos repartidos de forma pseudoaleatoria
      tl.fromTo(b, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: "power2.out" }, t);
    });
    qa(sc, ".runner").forEach(function (r, i) {
      var bead = q(r, ".rb"), trail = q(r, ".trail");
      var dist = 140 + (i * 53) % 200;
      var t = 4.6 + i * 0.55;
      gsap.set(bead, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(trail, { scaleY: 0, transformOrigin: "50% 0%" });
      tl.to(bead, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }, t);
      tl.to(bead, { y: dist, duration: 1.8 + (i % 3) * 0.6, ease: "power2.in" }, t + 0.6);
      tl.to(trail, { scaleY: dist / 260, duration: 1.8 + (i % 3) * 0.6, ease: "power2.in" }, t + 0.6);
    });
    return tl;
  };

  // ───────────── 5 · Le silence ─────────────
  S.silence = function (sc) {
    var tl = gsap.timeline();
    tl.fromTo(q(sc, "svg.world"), { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0);
    tl.add(gsap.fromTo(q(sc, "#stE-rain"), { y: -1080 }, { y: 0, duration: 1.1, ease: "none", repeat: -1 }), 0);
    tl.add(gsap.fromTo(qa(sc, ".pd"), { scaleX: 0.7, opacity: 0.5, transformOrigin: "50% 50%" }, { scaleX: 1.15, opacity: 1, duration: 1.2, repeat: -1, yoyo: true, stagger: 0.3 }), 0);
    tl.set(q(sc, "#stE-light"), { opacity: 1 }, 0);
    tl.to(q(sc, "#stE-light"), { keyframes: [{ opacity: 0.2, duration: 0.08 }, { opacity: 1, duration: 0.1 }, { opacity: 0.1, duration: 0.08 }, { opacity: 0.85, duration: 0.25 }, { opacity: 0, duration: 0.6 }] }, 2.0);
    tl.fromTo(q(sc, "#stE-julien circle"), { y: 0 }, { y: 6, duration: 1.2, ease: "sine.inOut" }, 3.0);
    // la cámara se aleja: su ventana es una de 171
    var c = (q(sc, ".story").getAttribute("data-center") || "960,540").split(",").map(Number);
    var tw = +q(sc, ".story").getAttribute("data-tile") || 80;
    var s = tw / 1920;
    tl.to(q(sc, "#stE-cam"), { x: c[0] - 960 * s, y: c[1] - 540 * s, scale: s, svgOrigin: "0 0", duration: 2.6, ease: "power3.inOut" }, 4.4);
    var tiles = qa(sc, ".tile");
    tl.fromTo(q(sc, "#stE-grid"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 5.6);
    tl.fromTo(tiles, { opacity: 1 }, { opacity: 0.08, duration: 0.25, stagger: { each: 0.022, from: "random" } }, 7.4);
    return tl;
  };
})();
