/*
 * Wind-Blätter für den Hero (portiert aus dem Hauptprojekt, WindCanvas.tsx, ohne React/Lenis).
 * Blätter treiben in drei Tiefenebenen, drehen sich um drei Achsen (Pseudo-3D), weichen der Maus aus.
 * Scroll-Geschwindigkeit wird zur Windstärke. Läuft nur, wenn das Canvas sichtbar ist; bei Reduced Motion gar nicht.
 *
 * Einbau: <canvas class="wind" data-count="16" aria-hidden="true"></canvas> in einer position:relative-Sektion.
 */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Blattformen (Einheitsgröße 40 × 40, Zentrum 20/20): Umriss und Adern
  const SHAPES = [
    { outline: "M20 1 C27 7 33 15 32 24 C31 32 26 37 20 39 C14 37 9 32 8 24 C7 15 13 7 20 1 Z",
      veins: "M20 3 C20.5 15 20.5 27 20 37 M20 12 L27 17 M20 12 L13 17 M20 20 L28 25 M20 20 L12 25 M20 28 L26 32 M20 28 L14 32" },
    { outline: "M20 5 C25 -1 36 3 35 13 C34 22 27 31 20 39 C13 31 6 22 5 13 C4 3 15 -1 20 5 Z",
      veins: "M20 6 C20.4 16 20.4 27 20 37 M20 13 L29 10 M20 13 L11 10 M20 20 L29 20 M20 20 L11 20 M20 27 L26 29 M20 27 L14 29" },
    { outline: "M20 2 C25 3 27 8 25 11 C30 10 33 14 30 17 C35 18 35 24 30 25 C34 29 31 34 26 32 C25 37 21 39 20 39 C19 39 15 37 14 32 C9 34 6 29 10 25 C5 24 5 18 10 17 C7 14 10 10 15 11 C13 8 15 3 20 2 Z",
      veins: "M20 38 C19.5 26 20.5 14 20 4 M20 14 L27 11 M20 14 L13 11 M20 21 L30 18 M20 21 L10 18 M20 28 L28 27 M20 28 L12 27" },
    { outline: "M21 1 C26 8 28 20 25 30 C23 36 21 39 19 39 C17 39 14 34 13 27 C12 17 15 7 21 1 Z",
      veins: "M20 3 C19.5 15 19 27 19 37 M19.5 12 L23 15 M19.5 12 L16 15 M19.5 20 L23 23 M19.5 20 L16 23 M19.5 28 L22 31 M19.5 28 L17 31" },
  ];
  // Ober- und Unterseite je Farbe (helle Palette für Papier-Hintergrund)
  const TONES_LIGHT = [["#3D7A52", "#5E9A6E"], ["#6B8F5E", "#8FB08A"], ["#8B6F47", "#A88A5F"], ["#C4A882", "#D8C39F"]];
  const TONES_DARK = [["#5F9A6F", "#7FB98D"], ["#8FB08A", "#AACBA3"], ["#B9925F", "#D0AC7A"], ["#D8C39F", "#E8D8BB"]];

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function init(canvas) {
    const ctx = canvas.getContext("2d");
    const count = parseInt(canvas.dataset.count || "16", 10);
    const strength = parseFloat(canvas.dataset.opacity || "0.75"); // Gesamtdeckkraft (dezent)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const dark = canvas.dataset.dark === "1";
    const TONES = dark ? TONES_DARK : TONES_LIGHT;

    // Sprites einmal vorrendern: pro Frame nur drawImage
    const SPR = 112, SCALE = SPR / 40;
    const makeSprite = (draw) => {
      const oc = document.createElement("canvas");
      oc.width = SPR; oc.height = SPR;
      const c = oc.getContext("2d");
      c.scale(SCALE, SCALE);
      c.lineJoin = "round";
      draw(c);
      return oc;
    };
    const sprites = SHAPES.map((shape) => {
      const outline = new Path2D(shape.outline);
      const vein = new Path2D(shape.veins);
      const faces = TONES.map(([top, bottom]) => [top, bottom].map((fill) => makeSprite((c) => {
        c.fillStyle = fill; c.fill(outline);
        c.strokeStyle = dark ? "rgba(245,242,236,0.22)" : "rgba(28,58,42,0.24)"; c.lineWidth = 1.1; c.stroke(outline);
        c.strokeStyle = dark ? "rgba(245,242,236,0.42)" : "rgba(28,58,42,0.38)"; c.lineWidth = 0.8; c.stroke(vein);
      })));
      const shade = makeSprite((c) => { c.fillStyle = dark ? "#0E1A13" : "#1C3A2A"; c.fill(outline); });
      return { faces, shade };
    });
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let w = 0, h = 0, raf = 0, visible = true, running = false;
    let wind = 0, lastY = window.scrollY, velocity = 0;
    let leaves = [];
    const pointer = { tx: -1e4, ty: -1e4, x: -1e4, y: -1e4, active: false };
    const n = () => (window.innerWidth < 768 ? Math.round(count / 2) : count);

    const spawn = (leaf, fromEdge) => {
      leaf = leaf || {};
      const depth = 0.25 + Math.pow(Math.random(), 0.85) * 0.75;
      leaf.depth = depth;
      leaf.size = (0.4 + Math.random() * 0.55) * (0.35 + depth * 1.15);
      leaf.shape = (Math.random() * SHAPES.length) | 0;
      leaf.tone = (Math.random() * TONES.length) | 0;
      leaf.ax = Math.random() * Math.PI * 2; leaf.ay = Math.random() * Math.PI * 2; leaf.az = Math.random() * Math.PI * 2;
      const spin = () => (Math.random() < 0.5 ? -1 : 1) * (0.003 + Math.random() * 0.007);
      leaf.vax = spin(); leaf.vay = spin(); leaf.vaz = (Math.random() - 0.5) * 0.008;
      leaf.bay = leaf.vay; leaf.baz = leaf.vaz;
      leaf.tumble = Math.random() < 0.5 ? 0 : 1;
      leaf.flutter = Math.random() * Math.PI * 2;
      leaf.vx = (0.12 + Math.random() * 0.22) * (0.3 + depth * 1.1);
      leaf.vy = (0.07 + Math.random() * 0.16) * (0.3 + depth * 1.1);
      leaf.px = 0; leaf.py = 0;
      if (fromEdge) {
        if (Math.random() < 0.5) { leaf.x = -50; leaf.y = Math.random() * h; }
        else { leaf.x = Math.random() * w; leaf.y = -50; }
      } else { leaf.x = Math.random() * w; leaf.y = Math.random() * h; }
      return leaf;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = n();
      if (leaves.length !== target) leaves = Array.from({ length: target }, () => spawn());
      leaves.sort((a, b) => a.depth - b.depth);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const inside = x >= -100 && y >= -100 && x <= r.width + 100 && y <= r.height + 100;
      pointer.active = inside;
      if (inside) { pointer.tx = x; pointer.ty = y; }
    };
    const onLeave = () => { pointer.active = false; };

    const draw = () => {
      // Scroll-Geschwindigkeit (px je Frame, geglättet) → Wind
      const y = window.scrollY;
      velocity += ((y - lastY) - velocity) * 0.3; lastY = y;
      const v = clamp(velocity, -60, 60);
      wind += (v * 0.16 - wind) * 0.08;
      const gust = Math.abs(wind);

      if (pointer.active) {
        if (pointer.x < -1e3) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
        pointer.x += (pointer.tx - pointer.x) * 0.18;
        pointer.y += (pointer.ty - pointer.y) * 0.18;
      }
      const hasPointer = pointer.active && pointer.x > -1e3;
      const parX = hasPointer ? (pointer.x - w / 2) / Math.max(w, 1) : 0;
      const parY = hasPointer ? (pointer.y - h / 2) / Math.max(h, 1) : 0;

      ctx.clearRect(0, 0, w, h);
      for (const l of leaves) {
        l.flutter += 0.02 + gust * 0.004;
        const wx = wind * 0.9 * l.depth, wy = -wind * 0.55 * l.depth;

        if (hasPointer) {
          const dx = l.x - pointer.x, dy = l.y - pointer.y;
          const d = Math.hypot(dx, dy) || 1;
          const radius = 110 + 150 * l.depth;
          if (d < radius) {
            const f = Math.pow(1 - d / radius, 2) * (0.7 + 2.2 * l.depth);
            l.px += (dx / d) * f; l.py += (dy / d) * f;
            l.vaz += (dx > 0 ? 1 : -1) * f * 0.012;
            l.vay += f * 0.01;
          }
        }
        l.px *= 0.9; l.py *= 0.9;
        l.vaz += (l.baz - l.vaz) * 0.02;
        l.vay += (l.bay - l.vay) * 0.02;

        l.x += l.vx + wx + l.px + Math.sin(l.flutter) * 0.35 * l.depth;
        l.y += l.vy + wy + l.py + Math.cos(l.flutter * 0.7) * 0.25 * l.depth;
        l.ax += l.vax + Math.sin(l.flutter * 0.5) * 0.002;
        l.ay += l.vay + gust * 0.002 * l.depth;
        l.az += l.vaz + wind * 0.006 * l.depth;

        if (l.x > w + 70 || l.x < -90 || l.y > h + 70 || l.y < -90) spawn(l, true);

        // Orthografische Projektion einer flachen Fläche; eine Achse taumelt voll, die andere schwankt ±40°
        const axE = l.tumble === 0 ? l.ax : Math.sin(l.ax) * 0.7;
        const ayE = l.tumble === 1 ? l.ay : Math.sin(l.ay) * 0.7;
        const cx = Math.cos(axE), sxn = Math.sin(axE), cy = Math.cos(ayE), syn = Math.sin(ayE);
        const nz = cx * cy, facing = Math.abs(nz), underside = nz < 0;
        const persp = 1 + 0.08 * (1 - facing);

        ctx.save();
        ctx.translate(l.x + parX * 90 * (l.depth - 0.35), l.y + parY * 60 * (l.depth - 0.35));
        ctx.rotate(l.az);
        ctx.scale(l.size * persp, l.size * persp);
        ctx.transform(cy, 0, sxn * syn, cx, 0, 0);
        const alpha = (0.22 + l.depth * 0.6) * (0.75 + 0.25 * facing) * strength;
        ctx.globalAlpha = alpha;
        const spr = sprites[l.shape];
        ctx.drawImage(spr.faces[l.tone][underside ? 1 : 0], -20, -20, 40, 40);
        if (facing < 0.75) {
          ctx.globalAlpha = alpha * (0.75 - facing) * 0.6;
          ctx.drawImage(spr.shade, -20, -20, 40, 40);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; lastY = window.scrollY; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }, { rootMargin: "80px" });
    io.observe(canvas);
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : visible && start()));
    if (finePointer) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      document.addEventListener("mouseleave", onLeave);
    }
  }

  const boot = () => document.querySelectorAll("canvas.wind").forEach(init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
