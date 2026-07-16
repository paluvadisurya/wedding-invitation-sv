/* ═══════════════════════════════════════════════════════════════════
   fx.js — the living layer.
   Gold-dust ambience, petal showers, tap sparkles, custom cursor,
   magnetic buttons, device tilt, scroll thread.
   Everything here is decorative: it self-disables under
   prefers-reduced-motion and pauses when the tab is hidden.
   ═══════════════════════════════════════════════════════════════════ */

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const DPR_CAP = 1.75;

/* shared tilt/pointer state, read by main.js for parallax too */
export const motionState = { tiltX: 0, tiltY: 0, pointerX: -999, pointerY: -999 };

function sizeCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ── ambient gold dust ──────────────────────────────────────────── */
export function initDust(canvas) {
  if (reduced) return;
  let ctx = sizeCanvas(canvas);
  let W = window.innerWidth, H = window.innerHeight;
  let motes = [];
  let running = true;
  let last = performance.now();

  const COLORS = [
    [246, 220, 150], [246, 220, 150], [246, 220, 150], [217, 178, 95],
    [242, 184, 198], [207, 195, 238], [191, 232, 212],
  ];

  function spawn(randomY = true) {
    const c = COLORS[(Math.random() * COLORS.length) | 0];
    return {
      x: Math.random() * W,
      y: randomY ? Math.random() * H : H + 8,
      r: 0.6 + Math.random() * 1.5,
      a: 0.25 + Math.random() * 0.5,
      vy: -(4 + Math.random() * 9),
      vx: (Math.random() - 0.5) * 5,
      ph: Math.random() * Math.PI * 2,
      tw: 0.4 + Math.random() * 1.4,
      c,
    };
  }

  function build() {
    W = window.innerWidth; H = window.innerHeight;
    const n = Math.max(24, Math.min(80, Math.round((W * H) / 12500)));
    motes = Array.from({ length: n }, () => spawn(true));
  }
  build();

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    const t = now / 1000;
    for (const m of motes) {
      m.y += (m.vy + motionState.tiltY * 6) * dt;
      m.x += (m.vx + Math.sin(t * 0.6 + m.ph) * 4 + motionState.tiltX * 10) * dt;
      // gentle repulsion around the pointer — light follows movement
      const dx = m.x - motionState.pointerX, dy = m.y - motionState.pointerY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 8100 && d2 > 1) {
        const d = Math.sqrt(d2), f = (90 - d) / 90;
        m.x += (dx / d) * f * 26 * dt * 8;
        m.y += (dy / d) * f * 26 * dt * 8;
      }
      if (m.y < -10) { Object.assign(m, spawn(false)); }
      if (m.x < -10) m.x = W + 8; else if (m.x > W + 10) m.x = -8;
      const tw = 0.55 + 0.45 * Math.sin(t * m.tw * 2 + m.ph);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, 6.2832);
      ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${(m.a * tw).toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => { ctx = sizeCanvas(canvas); build(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });
}

/* ── petals & sparkles (event-driven, sleeps when idle) ─────────── */
export function initPetals(canvas) {
  if (reduced) return { shower() {}, burst() {}, spark() {} };
  let ctx = sizeCanvas(canvas);
  let W = window.innerWidth, H = window.innerHeight;
  window.addEventListener('resize', () => { ctx = sizeCanvas(canvas); W = innerWidth; H = innerHeight; }, { passive: true });

  const PETAL_COLORS = ['#f2b8c6', '#f7d6d0', '#f0a835', '#f7f1e3', '#cfc3ee', '#f7cfa9'];
  let parts = [];
  let raf = 0;
  let last = 0;

  function wake() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => p.life > 0 && p.y < H + 30);
    for (const p of parts) {
      p.t += dt;
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.life -= dt;
      p.vy += p.grav * dt;
      p.x += (p.vx + Math.sin(p.t * p.swayF + p.ph) * p.swayA) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const alpha = Math.min(1, p.life / 0.9) * p.a;
      if (alpha <= 0) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      if (p.kind === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        const s = p.size * (1 + (1 - p.life / p.life0) * 1.6);
        ctx.beginPath();
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.stroke();
      } else {
        // petal: two mirrored beziers + a paler heart
        const s = p.size;
        ctx.scale(1, Math.max(0.35, Math.abs(Math.cos(p.t * p.flipF + p.ph)))); // 3D flutter
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.65, s * 0.7, 0, s);
        ctx.bezierCurveTo(-s * 0.65, s * 0.7, -s * 0.9, -s * 0.4, 0, -s);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.4, -s * 0.2, s * 0.3, s * 0.4, 0, s * 0.5);
        ctx.bezierCurveTo(-s * 0.3, s * 0.4, -s * 0.4, -s * 0.2, 0, -s * 0.5);
        ctx.fill();
      }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(frame);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }

  function petal(x, y, opts = {}) {
    const life = 3.5 + Math.random() * 2.5;
    return {
      kind: 'petal',
      x, y,
      size: 5 + Math.random() * 8,
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      vx: opts.vx ?? (Math.random() - 0.5) * 40,
      vy: opts.vy ?? 30 + Math.random() * 50,
      grav: opts.grav ?? 26,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 3,
      swayA: 18 + Math.random() * 26,
      swayF: 1 + Math.random() * 2,
      flipF: 2 + Math.random() * 3,
      ph: Math.random() * 6.28,
      a: 0.85,
      t: 0,
      life, life0: life,
      delay: opts.delay ?? 0,
    };
  }

  return {
    /* soft shower across the top of the viewport */
    shower(n = 30) {
      for (let i = 0; i < n; i++) {
        parts.push(petal(Math.random() * W, -20 - Math.random() * 40, { delay: Math.random() * 1.6 }));
      }
      wake();
    },
    /* celebratory burst from a point */
    burst(x, y, n = 18) {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * 6.28, sp = 60 + Math.random() * 130;
        parts.push(petal(x, y, { vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 60, grav: 150 }));
      }
      wake();
    },
    /* tiny gold sparkles at a tap/click point */
    spark(x, y, n = 7) {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * 6.28, sp = 24 + Math.random() * 70;
        const life = 0.5 + Math.random() * 0.4;
        parts.push({
          kind: 'spark', x, y,
          size: 2 + Math.random() * 3,
          color: Math.random() < 0.75 ? '#f6dc96' : '#f2b8c6',
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          grav: 40, rot: Math.random() * 6.28, vr: 3,
          swayA: 0, swayF: 0, flipF: 0, ph: 0,
          a: 0.95, t: 0, life, life0: life, delay: 0,
        });
      }
      wake();
    },
  };
}

/* ── pointer + tap sparkles + tilt ──────────────────────────────── */
export function initPointerFX(petals) {
  window.addEventListener('pointermove', (e) => {
    motionState.pointerX = e.clientX;
    motionState.pointerY = e.clientY;
  }, { passive: true });

  if (!reduced) {
    window.addEventListener('pointerdown', (e) => {
      petals.spark(e.clientX, e.clientY, 8);
    }, { passive: true });
  }

  // device tilt — subtle, no permission prompts (used only if events flow)
  if (!reduced && !finePointer) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      motionState.tiltX = Math.max(-1, Math.min(1, e.gamma / 28));
      motionState.tiltY = Math.max(-1, Math.min(1, (e.beta - 42) / 32));
    }, { passive: true });
  }
}

/* ── custom cursor (desktop) ────────────────────────────────────── */
export function initCursor() {
  if (!finePointer || reduced) return;
  const root = document.getElementById('cursor');
  if (!root) return;
  const dot = root.querySelector('.cursor-dot');
  const ring = root.querySelector('.cursor-ring');
  let x = -100, y = -100, rx = -100, ry = -100, seen = false;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; rx = x; ry = y; document.body.classList.add('has-cursor'); }
  }, { passive: true });

  (function loop() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  const HOT = 'a, button, input, textarea, label, [data-magnetic]';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(HOT)) root.classList.add('on-link');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(HOT)) root.classList.remove('on-link');
  });
}

/* ── magnetic buttons (desktop) ─────────────────────────────────── */
export function initMagnetic() {
  if (!finePointer || reduced) return;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    for (const el of document.querySelectorAll('[data-magnetic]')) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      const range = Math.max(r.width, 90);
      if (d < range) {
        const f = (1 - d / range) * 8;
        el.style.transform = `translate(${(dx / d) * f || 0}px, ${(dy / d) * f || 0}px)`;
      } else if (el.style.transform) {
        el.style.transform = '';
      }
    }
  }, { passive: true });
}

/* ── golden scroll thread ───────────────────────────────────────── */
export function initThread() {
  const bar = document.querySelector('.thread i');
  if (!bar) return;
  let ticking = false;
  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}
