/* The hero: three torn-paper collage panels over a planet's horizon.
 * Load: panels fade up from black, "Introducing" rises from behind the horizon.
 * Scroll: "Introducing" sinks back, the side scraps rotate about the planet's centre (so they slide
 * outward while staying locked to the curve), then the name rises and wipes on in letterpress ink. */
(function () {
  "use strict";
  var hero = document.getElementById("hero"), cvs = document.getElementById("stage"), ctx = cvs.getContext("2d");
  var ui = document.getElementById("hero-ui"), nav = document.getElementById("nav"), hint = document.getElementById("scroll-hint");
  var META = null, IM = {}, dpr = 1, vw = 0, vh = 0, G = null, built = null;
  var t0 = performance.now(), last = t0, pS = 0, pT = 0, thetaPrev = 0;
  var flags = { introUp: false, sunk: false, tore: false, landed: false, opened: false };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SERIF = '"Fraunces", Georgia, serif';
  var paperEl = document.querySelector(".paper");

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.decoding = "async"; i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }

  /* ------------------------------------------------------------ geometry */
  function geometry() {
    var k = Math.max(vw / META.w, vh / META.h), ox = (vw - META.w * k) / 2, oy = (vh - META.h * k) / 2;
    oy = Math.min(0, Math.max(vh - META.h * k, oy + vh * 0.02));
    var cx = ox + META.cx * k, crest = oy + META.crestY * k, R = META.R * k;
    var mobile = vw < 720;
    var L = vw * (mobile ? 0.17 : 0.265), Rx = vw * (mobile ? 0.83 : 0.685);
    // rotation that carries each torn edge most of the way off screen, measured at the horizon
    var thL = Math.asin(clamp((L - vw * (mobile ? 0.035 : 0.055)) / R, 0, 0.5));
    var thR = Math.asin(clamp((vw * (mobile ? 0.965 : 0.94) - Rx) / R, 0, 0.5));
    return { k: k, ox: ox, oy: oy, cx: cx, crest: crest, R: R, cy: crest + R, L: L, Rx: Rx, thL: thL, thR: thR, mobile: mobile };
  }
  function drawLayer(c, img) {
    // image in cover position, with its edges stretched so rotated panels never expose a void
    var x = G.ox, y = G.oy, w = META.w * G.k, h = META.h * G.k, P = 900;
    c.drawImage(img, 0, 0, img.width, 2, x - P, y - P, w + 2 * P, P + 1);
    c.drawImage(img, 0, img.height - 2, img.width, 2, x - P, y + h - 1, w + 2 * P, P);
    c.drawImage(img, 0, 0, 2, img.height, x - P, y, P + 1, h);
    c.drawImage(img, img.width - 2, 0, 2, img.height, x + w - 1, y, P, h);
    c.drawImage(img, x, y, w, h);
  }
  function offscreen(w, h) { var c = document.createElement("canvas"); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr); var x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { c: c, x: x }; }

  /* ------------------------------------------------------------ build the scraps (once per resize) */
  function build() {
    var B = {}, E = 40;
    // how far above the screen a panel's content can come into view once it has rotated
    var PL = G.thL * 1.2 * (G.cx + E) + 90, PR = G.thR * 1.05 * (vw - G.cx + E) + 90;
    // LEFT panel: the morpho wing scrap, torn down its right edge
    var L = G.L, tl = L + vw * 0.006, bl = L - vw * 0.008;
    var edgeL = Torn.line(tl, -PL, bl, vh + E, { amp: 5, seed: 11, flip: true, jitter: 1.4 });
    var outL = [{ x: -E, y: -PL }].concat(edgeL, [{ x: -E, y: vh + E }]);
    var left = offscreen(L + 2 * E + 20, vh + PL + E);
    left.x.translate(E, PL);
    Torn.scrap(left.x, outL, [edgeL], function (c) { drawLayer(c, IM.leftBottom); }, { dpr: dpr, seam: 1.4, fibres: 0.35, shadow: { blur: 16, dx: 7, dy: 2, alpha: 0.62 }, seed: 5 });
    B.left = { can: left.c, x: -E, y: -PL, w: L + 2 * E + 20, h: vh + PL + E };
    // LEFT upper scrap: mustard ledger paper, torn along the horizon so its torn edge becomes the limb
    var Ra = G.R - 10, xr = L - vw * 0.004, xl = -E;
    var aR = -Math.PI / 2 - Math.asin(clamp((G.cx - xr) / Ra, -1, 1)), aL = -Math.PI / 2 - Math.asin(clamp((G.cx - xl) / Ra, -1, 1));
    var arcPts = Torn.arc(G.cx, G.cy, Ra, aR, aL, { amp: 5, seed: 23, outward: false, jitter: 1.3 });
    var topEdge = Torn.line(xr, -PL, arcPts[0].x, arcPts[0].y, { amp: 4, seed: 29, flip: true });
    var outU = [{ x: -E, y: -PL }].concat(topEdge, arcPts, [{ x: -E, y: arcPts[arcPts.length - 1].y }]);
    var up = offscreen(L + 2 * E + 20, vh + PL + E);
    up.x.translate(E, PL);
    Torn.scrap(up.x, outU, [arcPts, topEdge], function (c) { drawLayer(c, IM.leftTop); }, { dpr: dpr, seam: 3.2, fibres: 0.6, shadow: { blur: 12, dx: 2, dy: 7, alpha: 0.55 }, seed: 8 });
    B.upper = { can: up.c, x: -E, y: -PL, w: L + 2 * E + 20, h: vh + PL + E };
    // RIGHT panel: honeycomb scrap, torn down its left edge, the seam catching the light
    var Rx = G.Rx, tr = Rx - vw * 0.004, br = Rx + vw * 0.007;
    var edgeR = Torn.line(br, vh + E, tr, -PR, { amp: 5, seed: 41, flip: true, jitter: 1.4 });
    var outR = [{ x: vw + E, y: vh + E }].concat(edgeR, [{ x: vw + E, y: -PR }]);
    var x0 = Rx - 2 * E, right = offscreen(vw + E - x0, vh + PR + E);
    right.x.translate(-x0, PR);
    Torn.scrap(right.x, outR, [edgeR], function (c) { drawLayer(c, IM.right); }, { dpr: dpr, seam: 3.6, fibres: 0.7, shadow: { blur: 16, dx: -7, dy: 2, alpha: 0.6 }, seed: 13 });
    B.right = { can: right.c, x: x0, y: -PR, w: vw + E - x0, h: vh + PR + E };
    // the name, inked: letterpress voids, starved patches and a bitten edge
    B.title = inkTitle();
    built = B;
  }
  function titleSize() { return clamp(vw * 0.078, 46, 148); }
  function inkTitle() {
    var fs = titleSize(), txt = "Terra Minima";
    ctx.font = "560 " + fs + "px " + SERIF;
    var w = Math.ceil(ctx.measureText(txt).width + fs * 0.4), h = Math.ceil(fs * 1.35);
    var o = offscreen(w, h), c = o.x, r = Torn.rng(77);
    c.font = "560 " + fs + "px " + SERIF; c.textBaseline = "alphabetic"; c.fillStyle = "#f2ece1";
    c.fillText(txt, fs * 0.2, fs * 1.02);
    c.globalCompositeOperation = "destination-out";
    var n = Math.floor(w * h / 38);
    for (var i = 0; i < n; i++) { // pin-prick voids where the ink didn't take
      var rr = (0.25 + r() * r() * 1.3), a = 0.35 + r() * 0.65;
      c.fillStyle = "rgba(0,0,0," + a.toFixed(2) + ")"; c.beginPath(); c.arc(r() * w, r() * h, rr, 0, 6.283); c.fill();
    }
    for (i = 0; i < 26; i++) { // starved patches
      var x = r() * w, y = r() * h, s = fs * (0.1 + r() * 0.35), g = c.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(0, "rgba(0,0,0," + (0.12 + r() * 0.2).toFixed(2) + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.fillRect(x - s, y - s, 2 * s, 2 * s);
    }
    c.globalCompositeOperation = "source-over";
    return { can: o.c, w: w, h: h, fs: fs, pad: fs * 0.2 };
  }

  /* ------------------------------------------------------------ per frame */
  function clipAbove() {
    ctx.beginPath(); ctx.rect(-10, -10, vw + 20, vh + 20); ctx.arc(G.cx, G.cy, G.R + 1, 0, Math.PI * 2, true); ctx.clip("evenodd");
  }
  function rotAbout(th) { ctx.translate(G.cx, G.cy); ctx.rotate(th); ctx.translate(-G.cx, -G.cy); }
  function arcY(x) { return G.cy - Math.sqrt(Math.max(0, G.R * G.R - (x - G.cx) * (x - G.cx))); }
  /* slide a panel along the planet's curve: the horizon point at its torn edge travels exactly along the
     circle (dropping as it goes out), and the paper tilts with the curve by `tilt` of the full tangent turn */
  function alongArc(xEdge, dx, tilt) {
    var x0 = xEdge, x1 = xEdge + dx, y0 = arcY(x0), y1 = arcY(x1);
    var a0 = Math.asin(clamp((x0 - G.cx) / G.R, -1, 1)), a1 = Math.asin(clamp((x1 - G.cx) / G.R, -1, 1));
    ctx.translate(x1, y1); ctx.rotate((a1 - a0) * tilt); ctx.translate(-x0, -y0);
  }
  var tmp = null;
  function drawTitle(rise, wipe) {
    var T = built.title, fs = T.fs, x = G.cx - T.w / 2 + 0, base = G.crest - fs * 0.07;
    var y = base - fs * 1.02 + (1 - rise) * fs * 1.15;
    if (!tmp || tmp.c.width !== T.can.width) tmp = offscreen(T.w, T.h);
    var c = tmp.x; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, tmp.c.width, tmp.c.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over"; c.drawImage(T.can, 0, 0, T.w, T.h);
    // wipe on, left to right, with a soft ink edge
    var soft = T.w * 0.22, edge = -soft + wipe * (T.w + soft * 2);
    var g = c.createLinearGradient(edge - soft, 0, edge, 0); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
    c.globalCompositeOperation = "destination-in"; c.fillStyle = g; c.fillRect(0, 0, T.w, T.h); c.globalCompositeOperation = "source-over";
    ctx.save(); clipAbove(); ctx.shadowColor = "rgba(10,6,2,0.35)"; ctx.shadowBlur = fs * 0.18; ctx.drawImage(tmp.c, x, y, T.w, T.h); ctx.restore();
  }
  function drawIntro(lift, alpha) {
    var fs = clamp(vw * 0.036, 26, 56);
    ctx.save(); clipAbove();
    ctx.font = "520 " + fs + "px " + SERIF; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(242,236,225," + alpha.toFixed(3) + ")";
    ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 12;
    ctx.fillText("Introducing", G.cx, G.crest - fs * 0.32 + (1 - lift) * fs * 1.4);
    ctx.restore();
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var t = (now - t0) / 1000;
    var max = hero.offsetHeight - vh; pT = clamp(-hero.getBoundingClientRect().top / Math.max(1, max), 0, 1);
    pS += (pT - pS) * (1 - Math.exp(-dt * (reduce ? 60 : 8.5)));
    var p = pS;
    // load choreography
    var fC = sstep(0.25, 1.45, t), fL = sstep(0.5, 1.75, t), fR = sstep(0.7, 1.95, t);
    var introUp = reduce ? 1 : easeOut((t - 1.55) / 1.25);
    // scroll choreography
    var sink = sstep(0.0, 0.13, p);
    var slide = easeInOut((p - 0.08) / 0.44);
    var rise = easeOut((p - 0.44) / 0.24), wipe = sstep(0.47, 0.72, p);
    var uiIn = sstep(0.64, 0.8, p);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, vw, vh);
    if (built) {
      ctx.globalAlpha = fC; drawLayer(ctx, IM.center); ctx.globalAlpha = 1;
      var ia = Math.min(1, introUp * 1.4) * (1 - sink) * fC;
      if (ia > 0.001) drawIntro(introUp * (1 - sink), ia);
      if (rise > 0 || wipe > 0) drawTitle(rise, wipe);
      var dL = -(G.L - vw * (G.mobile ? 0.035 : 0.055)) * slide, dR = (vw * (G.mobile ? 0.965 : 0.94) - G.Rx) * slide;
      ctx.save(); ctx.globalAlpha = fL; alongArc(G.L, dL, 0.4); ctx.drawImage(built.left.can, built.left.x, built.left.y, built.left.w, built.left.h); ctx.restore();
      ctx.save(); ctx.globalAlpha = fL; alongArc(G.L, dL * 1.1, 0.4); ctx.drawImage(built.upper.can, built.upper.x, built.upper.y, built.upper.w, built.upper.h); ctx.restore();
      ctx.save(); ctx.globalAlpha = fR; alongArc(G.Rx, dR, 0.4); ctx.drawImage(built.right.can, built.right.x, built.right.y, built.right.w, built.right.h); ctx.restore();
      // sound follows the paper
      var th = slide, v = Math.abs(th - thetaPrev) / Math.max(dt, 1e-3); thetaPrev = th;
      window.Foley && Foley.scrub(clamp(v / 1.6, 0, 1));
      sounds(p, t, introUp, sink, slide, rise, wipe);
    }
    ui.style.setProperty("--ui", uiIn.toFixed(3));
    var nv = Math.max(uiIn, sstep(0.95, 1, pT));
    nav.style.setProperty("--ui", nv.toFixed(3)); nav.classList.toggle("live", nv > 0.5); nav.classList.toggle("solid", hero.getBoundingClientRect().bottom < 80); nav.classList.toggle("on-paper", !!paperEl && paperEl.getBoundingClientRect().top < 40);
    hint.style.opacity = (sstep(2.8, 3.4, t) * (1 - sstep(0.0, 0.05, p))).toFixed(3);
    requestAnimationFrame(frame);
  }
  function sounds(p, t, introUp, sink, slide, rise, wipe) {
    if (!window.Foley) return;
    if (!flags.introUp && introUp > 0.05 && t < 4) { flags.introUp = true; Foley.play("slide", { dur: 0.9, bright: 0.7, gain: 0.35 }); }
    if (!flags.sunk && sink > 0.3) { flags.sunk = true; Foley.play("slide", { dur: 0.45, bright: 0.8, gain: 0.3, pan: 0 }); }
    if (flags.sunk && sink < 0.05) flags.sunk = false;
    if (!flags.tore && slide > 0.04) { flags.tore = true; Foley.play("tear", { dur: 0.75, gain: 0.34, pan: -0.4 }); Foley.play("tear", { dur: 0.6, gain: 0.28, pan: 0.45, delay: 0.09 }); }
    if (flags.tore && slide < 0.01) flags.tore = false;
    if (!flags.opened && slide > 0.985) { flags.opened = true; Foley.play("land", { gain: 0.45, pan: -0.7 }); Foley.play("land", { gain: 0.4, pan: 0.7, delay: 0.06 }); }
    if (flags.opened && slide < 0.9) flags.opened = false;
    if (!flags.landed && rise > 0.985 && wipe > 0.9) { flags.landed = true; Foley.play("press", { gain: 0.75, pan: 0 }); Foley.play("chime", { gain: 0.32, notes: [146.83, 220, 369.99, 659.25] }); }
    if (flags.landed && rise < 0.5) flags.landed = false;
  }
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1); vw = cvs.clientWidth; vh = cvs.clientHeight;
    cvs.width = Math.round(vw * dpr); cvs.height = Math.round(vh * dpr);
    if (!META) return;
    G = geometry();
    ui.style.setProperty("--crest", G.crest.toFixed(1) + "px");
    ui.style.setProperty("--title", titleSize().toFixed(1) + "px");
    build();
  }
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 120); });
  window.addEventListener("orientationchange", function () { setTimeout(resize, 300); });
  // replay the opening word when sound first comes on, so the first click is rewarded
  window.addEventListener("foley:unlocked", function () { if (pS < 0.05) { flags.introUp = false; } });

  Promise.all([fetch("assets/hero.json").then(function (r) { return r.json(); }), document.fonts ? document.fonts.load('560 100px "Fraunces"') : null])
    .then(function (res) {
      META = res[0];
      var L = META.layers;
      return Promise.all([loadImg("assets/img/hero-" + L.center + ".jpg"), loadImg("assets/img/hero-" + L.leftTop + ".jpg"),
        loadImg("assets/img/hero-" + L.leftBottom + ".jpg"), loadImg("assets/img/hero-" + L.right + ".jpg")]);
    }).then(function (ims) {
      IM.center = ims[0]; IM.leftTop = ims[1]; IM.leftBottom = ims[2]; IM.right = ims[3];
      resize(); t0 = performance.now(); document.documentElement.classList.add("hero-ready");
    });
  resize();
  requestAnimationFrame(frame);
})();
