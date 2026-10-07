/*
 * live-motion.js — capa de movimiento en vivo para decks HyperFrames.
 *
 * En modo `hyperframes present` la navegación es por seek: el player salta al
 * estado de reposo de cada slide sin reproducir la línea de tiempo. Este script
 * detecta qué escena está activa y dispara entradas imperativas con GSAP, así
 * el público ve el movimiento en vivo. Solo corre dentro del iframe del player;
 * en render/snapshot (página top-level) no hace nada y se ve el estado final.
 *
 * Marcado:
 *   data-anim="up|down|left|right|fade|zoom|pop|mask|mask-up|words|blur"
 *   data-delay="0.4"          retraso explícito (s); si no, stagger automático
 *   data-dur="1.2"            duración
 *   data-count="88"           cuenta numérica (con data-prefix / data-suffix / data-decimals)
 *   data-draw                 trazo SVG que se dibuja (path/line/circle)
 *   data-kb                   Ken Burns lento sobre imágenes
 *   .frag                     fragmento: la línea de tiempo controla su opacidad;
 *                             aquí se anima su primer hijo cuando aparece.
 */
(function () {
  var embedded = false;
  try { embedded = window.parent !== window; } catch (e) { embedded = true; }
  if (!embedded) return;

  var doc = document;
  doc.documentElement.classList.add("hf-live");

  // ---- clickers: PageDown / PageUp -> flechas del slideshow -----------------
  function bindClicker(win) {
    try {
      if (!win || win.__hfClickerBound) return;
      win.__hfClickerBound = true;
      win.addEventListener("keydown", function (e) {
        var map = { PageDown: "ArrowRight", PageUp: "ArrowLeft", ArrowDown: "ArrowRight", ArrowUp: "ArrowLeft" };
        var key = map[e.key];
        if (!key) return;
        var ss = window.parent.document.querySelector("hyperframes-slideshow");
        if (!ss) return;
        e.preventDefault();
        e.stopPropagation();
        ss.dispatchEvent(new KeyboardEvent("keydown", { key: key, bubbles: true, cancelable: true }));
      }, true);
    } catch (err) { /* cross-origin: ignorar */ }
  }
  bindClicker(window);
  try { bindClicker(window.parent); } catch (e) {}

  // ---- utilidades --------------------------------------------------------------
  function num(el, attr, def) {
    var v = parseFloat(el.getAttribute(attr));
    return isNaN(v) ? def : v;
  }

  function splitWords(el) {
    if (el.__split) return el.__split;
    var parts = [];
    (function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (k) {
        if (k.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          k.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(doc.createTextNode(tok)); return; }
            var w = doc.createElement("span");
            w.className = "lm-w";
            var wi = doc.createElement("span");
            wi.className = "lm-wi";
            wi.textContent = tok;
            w.appendChild(wi);
            frag.appendChild(w);
            parts.push(wi);
          });
          node.replaceChild(frag, k);
        } else if (k.nodeType === 1 && !k.classList.contains("lm-w")) {
          walk(k);
        }
      });
    })(el);
    el.__split = parts;
    return parts;
  }

  function effect(el, delay) {
    var kind = el.getAttribute("data-anim") || "up";
    var d = num(el, "data-dur", 1.05);
    var base = { delay: delay, duration: d, ease: "expo.out", overwrite: "auto" };
    function go(from, to) { return gsap.fromTo(el, from, Object.assign({}, base, to)); }
    switch (kind) {
      case "fade": return go({ opacity: 0 }, { opacity: 1, ease: "power2.out" });
      case "blur": return go({ opacity: 0, filter: "blur(24px)", scale: 1.04 }, { opacity: 1, filter: "blur(0px)", scale: 1 });
      case "down": return go({ opacity: 0, y: -70 }, { opacity: 1, y: 0 });
      case "left": return go({ opacity: 0, x: -110, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)" });
      case "right": return go({ opacity: 0, x: 110, filter: "blur(10px)" }, { opacity: 1, x: 0, filter: "blur(0px)" });
      case "zoom": return go({ opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1 });
      case "pop": return go({ opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: "back.out(1.8)", duration: Math.min(d, 0.8) });
      case "mask": return go({ opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "expo.inOut", duration: num(el, "data-dur", 1.3) });
      case "mask-up": return go({ opacity: 1, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "expo.inOut", duration: num(el, "data-dur", 1.3) });
      case "words": {
        var ws = splitWords(el);
        gsap.set(el, { opacity: 1 });
        return gsap.fromTo(ws, { yPercent: 115, rotate: 4, opacity: 0 }, {
          yPercent: 0, rotate: 0, opacity: 1, duration: d, ease: "expo.out",
          stagger: num(el, "data-stagger", 0.045), delay: delay, overwrite: "auto"
        });
      }
      // trazo a mano: se revela de izquierda a derecha a velocidad de escritura
      case "write": return go({ opacity: 1, clipPath: "inset(-25% 100% -25% -4%)" }, { clipPath: "inset(-25% -12% -25% -4%)", ease: "none", duration: num(el, "data-dur", 1.1) });
      // sello: cae sobre el papel con un pequeño rebote
      case "stamp": return go({ opacity: 0, scale: 1.9, rotate: -14 }, { opacity: 1, scale: 1, rotate: -6, ease: "back.out(2.2)", duration: num(el, "data-dur", 0.55) });
      // lámina: se descubre por barrido vertical, como al levantar el papel de seda
      case "plate": return go({ opacity: 1, clipPath: "inset(-4% -4% 104% -4%)" }, { clipPath: "inset(-4% -4% -4% -4%)", ease: "power3.inOut", duration: num(el, "data-dur", 1.4) });
      case "rise": return go({ opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: num(el, "data-dur", 1.2) });
      // por defecto: aparición discreta; el movimiento grande se reserva para un momento por slide
      default: return go({ opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: "power2.out", duration: num(el, "data-dur", 0.6) });
    }
  }

  function countUp(el, delay) {
    var to = num(el, "data-count", 0);
    var dec = num(el, "data-decimals", 0);
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    var sep = el.getAttribute("data-sep") || ",";
    var o = { v: num(el, "data-from", 0) };
    function fmt(v) {
      var s = v.toFixed(dec);
      var p = s.split(".");
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      return pre + p.join(".") + suf;
    }
    el.textContent = fmt(o.v);
    return gsap.to(o, {
      v: to, duration: num(el, "data-dur", 2.0), delay: delay, ease: "power3.out",
      onUpdate: function () { el.textContent = fmt(o.v); },
      onComplete: function () { el.textContent = fmt(to); }
    });
  }

  function draw(el, delay) {
    var len = 1000;
    try { len = el.getTotalLength ? el.getTotalLength() : 1000; } catch (e) {}
    gsap.set(el, { strokeDasharray: len, opacity: 1 });
    return gsap.fromTo(el, { strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: num(el, "data-dur", 1.6), delay: delay, ease: "power2.inOut", overwrite: "auto"
    });
  }

  function insideFrag(el, scene) {
    var p = el.parentElement;
    while (p && p !== scene) { if (p.classList && p.classList.contains("frag")) return p; p = p.parentElement; }
    return null;
  }

  // Anima un grupo de nodos (escena completa o un fragmento recién revelado).
  function play(root, scene, baseDelay, onlyInFrag) {
    var i = 0;
    var nodes = root.querySelectorAll("[data-anim],[data-count],[data-draw],[data-kb]");
    var step = nodes.length > 14 ? 0.05 : 0.09;
    Array.prototype.forEach.call(nodes, function (el) {
      var fr = insideFrag(el, scene);
      if (onlyInFrag ? fr !== onlyInFrag : (fr && !fr.__shown)) return;
      var explicit = el.getAttribute("data-delay");
      var delay = baseDelay + (explicit !== null ? parseFloat(explicit) : 0.12 + i * step);
      if (explicit === null) i++;
      if (el.hasAttribute("data-kb")) {
        gsap.fromTo(el, { scale: num(el, "data-kb-from", 1.14), xPercent: num(el, "data-kb-x", -1.5) },
          { scale: 1, xPercent: 0, duration: num(el, "data-kb-dur", 16), ease: "sine.out", overwrite: "auto" });
        return;
      }
      if (el.hasAttribute("data-anim")) effect(el, delay);
      if (el.hasAttribute("data-count")) countUp(el, delay);
      if (el.hasAttribute("data-draw")) draw(el, delay);
    });
  }

  function resetScene(scene) {
    if (scene.__storyTl) { scene.__storyTl.kill(); scene.__storyTl = null; }
    var nodes = scene.querySelectorAll("[data-anim],[data-count],[data-draw],[data-kb]");
    gsap.killTweensOf(nodes);
    Array.prototype.forEach.call(scene.querySelectorAll(".lm-wi"), function (w) { gsap.killTweensOf(w); });
    Array.prototype.forEach.call(scene.querySelectorAll(".frag"), function (f) { f.__shown = false; f.classList.remove("lm-shown"); });
    scene.classList.remove("is-in");
  }

  function sceneSweep(scene) {
    Array.prototype.forEach.call(scene.querySelectorAll("[data-scene-bg]"), function (el) {
      if (el.__baseOp === undefined) el.__baseOp = parseFloat(getComputedStyle(el).opacity) || 1;
      gsap.fromTo(el, { opacity: 0 }, { opacity: el.__baseOp, duration: 1.4, ease: "power2.out" });
    });
    var sw = scene.querySelector(".lm-sweep");
    if (sw) gsap.fromTo(sw, { xPercent: -110, opacity: 1 }, { xPercent: 110, duration: 1.1, ease: "expo.inOut", onComplete: function () { gsap.set(sw, { opacity: 0 }); } });
  }

  var scenes = [];
  var active = null;

  function collect() {
    scenes = Array.prototype.slice.call(doc.querySelectorAll(".scene"));
  }

  function visible(el) {
    var cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }

  function tick() {
    if (!scenes.length) collect();
    var now = null;
    for (var i = 0; i < scenes.length; i++) { if (visible(scenes[i])) { now = scenes[i]; break; } }
    if (now !== active) {
      if (active) resetScene(active);
      active = now;
      if (active) {
        // fragmentos ya visibles al entrar (p. ej. navegando hacia atrás)
        Array.prototype.forEach.call(active.querySelectorAll(".frag"), function (f) {
          f.__shown = parseFloat(getComputedStyle(f).opacity) > 0.5;
          f.classList.toggle("lm-shown", f.__shown);
        });
        // escenas narrativas: cada una registra su propia coreografía en window.__stories
        var sname = active.getAttribute("data-story");
        if (sname && window.__stories && window.__stories[sname]) {
          try { active.__storyTl = window.__stories[sname](active); } catch (err) { console.error(err); }
        }
        active.classList.add("is-in");
        sceneSweep(active);
        play(active, active, 0.05, null);
      }
    } else if (active) {
      var frags = active.querySelectorAll(".frag");
      for (var j = 0; j < frags.length; j++) {
        var f = frags[j];
        var on = parseFloat(getComputedStyle(f).opacity) > 0.5;
        if (on && !f.__shown) { f.__shown = true; f.classList.add("lm-shown"); play(f, active, 0, f); }
        else if (!on && f.__shown) { f.__shown = false; f.classList.remove("lm-shown"); }
      }
    }
    requestAnimationFrame(tick);
  }

  function start() {
    collect();
    requestAnimationFrame(tick);
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
  else start();
})();
