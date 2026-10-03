/* Torn paper, drawn in code. A torn edge is a noise-driven line (several octaves of value noise plus
 * per-sample jitter); along it we draw a thin exposed white paper seam with loose fibres on one side,
 * and a soft cast shadow on the layer beneath. No PNG masks anywhere. */
(function () {
  "use strict";
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
  // 1D value noise with smooth interpolation, returns f(t) in -1..1
  function valueNoise(r, n) {
    var v = []; for (var i = 0; i < n + 2; i++) v.push(r() * 2 - 1);
    return function (t) { t = Math.abs(t) % n; var i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return v[i] * (1 - u) + v[i + 1] * u; };
  }
  function fbm(seed) {
    var r = rng(seed), o = [valueNoise(r, 512), valueNoise(r, 512), valueNoise(r, 512), valueNoise(r, 512)];
    return function (s) { return 0.55 * o[0](s / 70) + 0.27 * o[1](s / 22) + 0.12 * o[2](s / 7) + 0.06 * o[3](s / 2.3); };
  }
  /* points along a straight tear from A to B. Normal (nx,ny) points to the side the scrap is NOT on
     (the side the seam and shadow fall). */
  function line(ax, ay, bx, by, o) {
    o = o || {}; var amp = o.amp == null ? 6 : o.amp, step = o.step || 2, r = rng(o.seed || 7), f = fbm((o.seed || 7) * 31 + 5);
    var dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = o.flip ? uy : -uy, ny = o.flip ? -ux : ux;
    var pts = [], N = Math.ceil(L / step);
    for (var i = 0; i <= N; i++) {
      var s = i * step, d = amp * f(s + (o.seed || 7) * 13) + (r() - 0.5) * (o.jitter == null ? 1.2 : o.jitter);
      pts.push({ x: ax + ux * s + nx * d, y: ay + uy * s + ny * d, nx: nx, ny: ny, s: s });
    }
    return pts;
  }
  /* points along a circular tear (centre cx,cy radius R) from angle a0 to a1. outward=true puts the
     normal pointing away from the centre (above the horizon). */
  function arc(cx, cy, R, a0, a1, o) {
    o = o || {}; var amp = o.amp == null ? 6 : o.amp, step = o.step || 2, r = rng(o.seed || 9), f = fbm((o.seed || 9) * 17 + 3);
    var L = Math.abs(a1 - a0) * R, N = Math.ceil(L / step), pts = [], sgn = o.outward === false ? -1 : 1;
    for (var i = 0; i <= N; i++) {
      var a = a0 + (a1 - a0) * i / N, s = i * step, d = amp * f(s + 91) + (r() - 0.5) * (o.jitter == null ? 1.2 : o.jitter);
      var ex = Math.cos(a), ey = Math.sin(a), rr = R + d * sgn;
      pts.push({ x: cx + ex * rr, y: cy + ey * rr, nx: ex * sgn, ny: ey * sgn, s: s });
    }
    return pts;
  }
  function pathFrom(ctx, pts, close) { ctx.moveTo(pts[0].x, pts[0].y); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); if (close) ctx.closePath(); }

  /* Draw a scrap: `outline` is the closed polygon of the scrap (array of {x,y}), `edges` the torn edges
     (arrays from line()/arc(), normals pointing out of the scrap), `paint(ctx)` paints its imagery.
     opts: seam (px), shadow {blur, dx, dy, alpha}, fibres (density), dpr */
  function scrap(ctx, outline, edges, paint, opts) {
    opts = opts || {}; var dpr = opts.dpr || 1, r = rng(opts.seed || 3), f = fbm((opts.seed || 3) * 7 + 1);
    var seam = opts.seam == null ? 3 : opts.seam, sh = opts.shadow || { blur: 18, dx: 6, dy: 4, alpha: 0.5 };
    // 1. cast shadow on whatever lies beneath
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0," + sh.alpha + ")"; ctx.shadowBlur = sh.blur * dpr; ctx.shadowOffsetX = sh.dx * dpr; ctx.shadowOffsetY = sh.dy * dpr;
    ctx.fillStyle = "#1a1714"; ctx.beginPath(); pathFrom(ctx, outline, true); ctx.fill();
    ctx.restore();
    // 2. the exposed paper seam along each torn edge: width wanders, sometimes vanishes
    edges.forEach(function (e, ei) {
      if (!seam) return;
      var outer = e.map(function (p) { var w = seam * Math.max(0, 0.75 + 0.9 * f(p.s * 0.9 + ei * 300)) + (r() - 0.5) * 0.6; return { x: p.x + p.nx * w, y: p.y + p.ny * w, w: w }; });
      ctx.beginPath(); pathFrom(ctx, e, false);
      for (var i = outer.length - 1; i >= 0; i--) ctx.lineTo(outer[i].x, outer[i].y);
      ctx.closePath();
      ctx.fillStyle = opts.seamColor || "#f2ede2"; ctx.fill();
      // soft grey where the seam dips back under the surface layer
      ctx.strokeStyle = "rgba(90,80,70,0.18)"; ctx.lineWidth = 0.8; ctx.beginPath(); pathFrom(ctx, e, false); ctx.stroke();
      // loose fibres standing out from the seam, a few bridging back over the torn surface
      var dens = opts.fibres == null ? 0.55 : opts.fibres;
      for (i = 0; i < outer.length; i++) {
        if (r() > dens) continue;
        var p = e[i], o = outer[i], ang = Math.atan2(p.ny, p.nx) + (r() - 0.5) * 1.6, len = (1.2 + r() * r() * 7) * (opts.fibreLen || 1);
        var back = r() < 0.18, sx = back ? p.x : o.x - p.nx * o.w * r() * 0.6, sy = back ? p.y : o.y - p.ny * o.w * r() * 0.6;
        if (back) { ang += Math.PI; len *= 0.7; }
        var ex = sx + Math.cos(ang) * len, ey = sy + Math.sin(ang) * len, bend = (r() - 0.5) * len * 0.8;
        ctx.strokeStyle = "rgba(246,242,234," + (0.35 + r() * 0.55).toFixed(2) + ")";
        ctx.lineWidth = 0.35 + r() * 0.6;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + ex) / 2 - Math.sin(ang) * bend, (sy + ey) / 2 + Math.cos(ang) * bend, ex, ey); ctx.stroke();
      }
    });
    // 3. the imagery, clipped to the torn outline, with a hint of paper thickness at the tear
    ctx.save(); ctx.beginPath(); pathFrom(ctx, outline, true); ctx.clip();
    paint(ctx);
    edges.forEach(function (e) {
      ctx.strokeStyle = "rgba(20,14,8,0.28)"; ctx.lineWidth = 2.2; ctx.beginPath(); pathFrom(ctx, e, false); ctx.stroke();
      ctx.strokeStyle = "rgba(255,250,240,0.10)"; ctx.lineWidth = 0.8; ctx.beginPath();
      ctx.moveTo(e[0].x - e[0].nx * 2.5, e[0].y - e[0].ny * 2.5);
      for (var i = 1; i < e.length; i++) ctx.lineTo(e[i].x - e[i].nx * 2.5, e[i].y - e[i].ny * 2.5);
      ctx.stroke();
    });
    ctx.restore();
  }
  // a rectangle torn on all four sides (for photo and media plates)
  function rectScrap(x, y, w, h, seed, amp) {
    var a = amp == null ? 4 : amp;
    var top = line(x, y, x + w, y, { amp: a, seed: seed + 1, flip: true }),
      right = line(x + w, y, x + w, y + h, { amp: a, seed: seed + 2, flip: true }),
      bottom = line(x + w, y + h, x, y + h, { amp: a, seed: seed + 3, flip: true }),
      left = line(x, y + h, x, y, { amp: a, seed: seed + 4, flip: true });
    return { outline: top.concat(right, bottom, left), edges: [top, right, bottom, left] };
  }
  window.Torn = { rng: rng, fbm: fbm, line: line, arc: arc, scrap: scrap, rectScrap: rectScrap, pathFrom: pathFrom };
})();
