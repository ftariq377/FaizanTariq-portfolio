/* ============================================================================
   Faizan Tariq — portfolio behaviour
   ----------------------------------------------------------------------------
   No frameworks, no animation library, no 3D library. Everything below is
   plain ES2019+ so it ships as one small file and starts instantly on mobile.

   Modules
   01 Helpers
   02 Boot sequence
   03 Navigation + instrument rail
   04 Hero systems graph (perspective-projected node network on <canvas>)
   05 Scroll reveals + hero entrance
   06 Number counters
   07 Skill sphere (CSS 3D)
   08 Timeline progress
   09 Pointer flourishes: cursor, magnetic buttons, card spotlight
   ========================================================================== */

(function () {
  'use strict';

  /* -- 01 Helpers --------------------------------------------------------- */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* -- 02 Boot sequence ---------------------------------------------------
     A ~900ms system check. It buys time for fonts to swap in and gives the
     page a deliberate opening beat. Skipped entirely for reduced motion.    */
  function boot(done) {
    const el = $('#boot');
    if (reduceMotion) { el.remove(); done(); return; }

    const bar = $('#bootBar');
    const pct = $('#bootPct');
    const start = performance.now();
    const DUR = 900;

    (function tick(now) {
      const t = clamp((now - start) / DUR, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      bar.style.width = (eased * 100).toFixed(1) + '%';
      pct.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      if (t < 1) { requestAnimationFrame(tick); return; }
      el.classList.add('is-done');
      setTimeout(() => el.remove(), 600);
      done();
    })(start);
  }

  /* -- 03 Navigation + instrument rail ------------------------------------ */
  function initNav() {
    const nav = $('#nav');
    const links = $('.nav__links');
    const toggle = $('#navToggle');

    // Sticky treatment once the hero starts leaving.
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    links.id = 'navLinks';
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') return;
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
    });

    // Build the left instrument rail from sections that declare data-rail.
    const sections = $$('[data-rail]');
    const railList = $('#railList');
    const rail = $('#rail');
    const meter = $('#railMeter');

    sections.forEach((section, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.target = section.id;
      btn.setAttribute('aria-label', 'Go to ' + section.dataset.rail);
      btn.innerHTML = '<i>' + String(i + 1).padStart(2, '0') + '</i>' +
                      '<span class="rail__name">' + section.dataset.rail + '</span>';
      btn.addEventListener('click', () => section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }));
      li.appendChild(btn);
      railList.appendChild(li);
    });

    const navLinks = $$('.nav__links a');
    const railBtns = $$('#railList button');

    // Highlight the section currently occupying the middle of the viewport.
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
        railBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.target === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));

    // Rail visibility + scroll meter
    const railToggle = () => {
      rail.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.7);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      meter.style.height = (max > 0 ? clamp(window.scrollY / max, 0, 1) * 100 : 0) + '%';
    };
    railToggle();
    window.addEventListener('scroll', railToggle, { passive: true });
  }

  /* -- 04 Hero systems graph ----------------------------------------------
     The signature element. Nodes are the systems Faizan actually works in;
     edges are drawn between near neighbours on a sphere and a few carry a
     travelling pulse. Everything is projected by hand — no 3D library — and
     the loop parks itself whenever the hero is off-screen or the tab is
     hidden, so it costs nothing while someone reads the rest of the page.   */
  function initGraph() {
    const canvas = $('#graph');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const LABELS = [
      'POS', 'Kiosk', 'Digital ordering', 'Menu', 'Payments', 'Payroll', 'Inventory',
      'Marketing', 'Jira', 'ERPNext', 'n8n', 'Python', 'Excel', 'Shopify', 'Asana',
      'GoHighLevel', 'Hubstaff', 'Google Sheets', 'Claude Code', 'Arena Simulation',
      'Excel Solver', 'UAT', 'Data migration', 'Forecasting', 'SOPs', 'KPI reporting'
    ];
    const DUST = 88;                       // unlabelled points for depth
    const TOTAL = LABELS.length + DUST;

    let w = 0, h = 0, dpr = 1, R = 260, cx = 0, cy = 0;
    const nodes = [];
    const edges = [];
    const pulses = [];

    // Fibonacci sphere: even distribution without clustering at the poles.
    // Labels are spread across the whole sphere (every Nth point) rather than
    // taken off the front of the list, which would bunch them at one pole.
    const STRIDE = Math.floor(TOTAL / LABELS.length);
    let labelled = 0;
    for (let i = 0; i < TOTAL; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / TOTAL);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const takesLabel = i % STRIDE === 0 && labelled < LABELS.length;
      nodes.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        label: takesLabel ? LABELS[labelled++] : null
      });
    }

    // Connect near neighbours once, then reuse the list every frame.
    const THRESHOLD = 0.62;
    for (let i = 0; i < nodes.length; i++) {
      let linked = 0;
      for (let j = i + 1; j < nodes.length && linked < 3; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (d < THRESHOLD) { edges.push([i, j]); linked++; }
      }
    }
    for (let k = 0; k < 9 && k < edges.length; k++) {
      pulses.push({ edge: Math.floor(Math.random() * edges.length), t: Math.random(), speed: 0.12 + Math.random() * 0.2 });
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);   // cap DPR: retina cost, no retina benefit here
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * (w < 760 ? 0.40 : 0.30);
      cx = w < 900 ? w * 0.5 : w * 0.72;                 // sit right of the headline on desktop
      cy = h * 0.5;
    }

    let ry = 0.4, rx = -0.18, targetRx = -0.18, targetRy = 0.4;
    const pointer = { x: 0, y: 0, px: null, py: null };

    let hover = -1;
    if (finePointer && !reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
        targetRx = -0.18 + pointer.y * 0.22;
        const rect = canvas.getBoundingClientRect();
        pointer.px = e.clientX - rect.left;
        pointer.py = e.clientY - rect.top;
      }, { passive: true });
    }

    const FOV = 620;
    const projected = new Array(nodes.length);

    function frame(dt) {
      if (!reduceMotion) targetRy += dt * 0.075;
      ry = lerp(ry, targetRy, 0.06);
      rx = lerp(rx, targetRx, 0.05);

      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // rotate Y then X
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        const scale = FOV / (FOV + z2 * R);
        projected[i] = {
          x: cx + x1 * R * scale,
          y: cy + y2 * R * scale,
          depth: clamp((1 - z2) / 2, 0, 1),   // 1 = closest to viewer
          scale
        };
      }

      // nearest labelled node to the pointer becomes the highlighted one
      hover = -1;
      if (pointer.px != null) {
        let best = 34 * 34;
        for (let i = 0; i < nodes.length; i++) {
          if (!nodes[i].label || projected[i].depth < 0.5) continue;
          const dx = projected[i].x - pointer.px, dy = projected[i].y - pointer.py;
          const d2 = dx * dx + dy * dy;
          if (d2 < best) { best = d2; hover = i; }
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Edges first, faded by the depth of their nearest endpoint.
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e++) {
        const ia = edges[e][0], ib = edges[e][1];
        const a = projected[ia], b = projected[ib];
        const depth = Math.max(a.depth, b.depth);
        if (depth < 0.18) continue;
        const touched = hover === ia || hover === ib;
        ctx.strokeStyle = touched
          ? 'rgba(255,158,44,' + (depth * 0.75).toFixed(3) + ')'
          : 'rgba(110,140,168,' + (depth * depth * 0.42).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Pulses: small amber packets travelling along a handful of edges.
      for (let p = 0; p < pulses.length; p++) {
        const pulse = pulses[p];
        if (!reduceMotion) pulse.t += dt * pulse.speed;
        if (pulse.t > 1) { pulse.t = 0; pulse.edge = Math.floor(Math.random() * edges.length); }
        const a = projected[edges[pulse.edge][0]], b = projected[edges[pulse.edge][1]];
        const depth = Math.max(a.depth, b.depth);
        if (depth < 0.3) continue;
        const px = lerp(a.x, b.x, pulse.t);
        const py = lerp(a.y, b.y, pulse.t);
        ctx.fillStyle = 'rgba(255,158,44,' + (depth * 0.85).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.9 * depth + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes, painted back to front so near points read as nearer.
      const order = projected.map((p, i) => i).sort((i, j) => projected[i].depth - projected[j].depth);
      ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';

      for (let o = 0; o < order.length; o++) {
        const i = order[o];
        const p = projected[i];
        const n = nodes[i];
        const isNode = !!n.label;
        const lit = i === hover;
        const r = (isNode ? (lit ? 5 : 2.6) : 1.3) * p.scale;

        ctx.fillStyle = isNode
          ? 'rgba(255,158,44,' + (0.3 + p.depth * 0.7).toFixed(3) + ')'
          : 'rgba(205,212,224,' + (p.depth * 0.45).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Only label the front face, and only when there's room for the text.
        if (isNode && (lit || (p.depth > 0.6 && w > 620))) {
          ctx.fillStyle = lit
            ? '#FF9E2C'
            : 'rgba(236,235,230,' + ((p.depth - 0.6) * 1.9).toFixed(3) + ')';
          ctx.fillText(n.label, p.x + (lit ? 12 : 9) * p.scale, p.y);
        }
      }
    }

    // --- loop control: only run while the hero is visible and the tab is on
    let running = false, last = 0, visible = true, inView = true;

    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frame(dt);
      if (reduceMotion) { running = false; return; }   // one static frame is enough
      requestAnimationFrame(loop);
    }
    function start() {
      if (running || !visible || !inView) return;
      running = true; last = performance.now();
      requestAnimationFrame(loop);
    }
    function stop() { running = false; }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      visible = !document.hidden;
      visible ? start() : stop();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (!running) frame(0); }, 150);
    });

    resize();
    start();
  }

  /* -- 05 Scroll reveals + hero entrance ---------------------------------- */
  function initReveals() {
    const targets = $$('.section__head, .tl, .card--work, .edu__main, .edu__certs, .about__body, .about__side, .skills__grid, .sphere, .principle, .subhead, .case, .stack, .reveal')
      .filter((el) => !el.closest('.hero'));   // the hero runs its own entrance
    if (reduceMotion) { targets.forEach((t) => t.classList.add('is-in')); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings that enter together, capped so nothing lags badly.
        entry.target.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    targets.forEach((t) => io.observe(t));
  }

  function heroEntrance() {
    const lines = $$('.hero__title .line > span');
    const rest = $$('.hero .reveal');
    if (reduceMotion) {
      lines.forEach((l) => (l.style.transform = 'none'));
      rest.forEach((r) => r.classList.add('is-in'));
      return;
    }
    lines.forEach((line, i) => {
      line.style.transition = 'transform 1.05s cubic-bezier(.22,.61,.36,1)';
      line.style.transitionDelay = 80 + i * 105 + 'ms';
      requestAnimationFrame(() => { line.style.transform = 'translateY(0)'; });
    });
    rest.forEach((el, i) => {
      el.style.transitionDelay = 380 + i * 110 + 'ms';
      requestAnimationFrame(() => el.classList.add('is-in'));
    });
  }

  /* -- 06 Counters --------------------------------------------------------- */
  function initCounters() {
    const nums = $$('[data-count]');
    if (reduceMotion) return;   // values are already in the HTML

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseFloat(el.dataset.count);
        const start = performance.now();
        const DUR = 1100;
        (function tick(now) {
          const t = clamp((now - start) / DUR, 0, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        })(start);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    nums.forEach((n) => { n.textContent = '0'; io.observe(n); });
  }

  /* -- 07 Skill sphere -----------------------------------------------------
     A CSS-3D tag cloud. The full skill list also exists as real text in the
     cards next to it, so this stays decorative and screen readers get the
     readable version.                                                       */
  function initSphere() {
    const stage = $('#sphereStage');
    if (!stage) return;

    // [label, weight] — weight 1 = a tool used daily, 0 = supporting.
    const TAGS = [
      ['ERPNext', 1], ['Jira', 1], ['POS systems', 1], ['Excel', 1], ['Python', 1],
      ['n8n', 1], ['Claude Code', 1], ['Sheets', 1], ['Dashboards', 1], ['Forecasting', 1],
      ['Shopify', 0], ['Asana', 0], ['GoHighLevel', 0], ['Hubstaff', 0], ['UAT', 0],
      ['XLOOKUP', 0], ['PivotTables', 0], ['SUMIF', 0], ['Arena', 0], ['Solver', 0],
      ['SOPs', 0], ['KPIs', 0]
    ];

    const items = TAGS.map(([text, key], i) => {
      const el = document.createElement('span');
      el.className = 'sphere__tag';
      el.dataset.key = key;
      el.textContent = text;
      el.style.fontSize = key ? '.8rem' : '.66rem';
      stage.appendChild(el);

      const phi = Math.acos(1 - 2 * (i + 0.5) / TAGS.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        el,
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
      };
    });

    const host = $('#sphere');
    let radius = host.clientWidth * 0.42;
    let ry = 0, rx = -0.1, vy = 0.28, vx = 0;
    let dragging = false, lastX = 0, lastY = 0;

    const sizeUp = () => { radius = host.clientWidth * 0.42; };
    window.addEventListener('resize', sizeUp, { passive: true });

    host.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      vy = (e.clientX - lastX) * 0.012;
      vx = -(e.clientY - lastY) * 0.012;
      ry += vy; rx += vx;
      lastX = e.clientX; lastY = e.clientY;
    });
    const release = () => { dragging = false; };
    host.addEventListener('pointerup', release);
    host.addEventListener('pointercancel', release);

    function render() {
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      for (const it of items) {
        const x1 = it.x * cosY - it.z * sinY;
        const z1 = it.x * sinY + it.z * cosY;
        const y2 = it.y * cosX - z1 * sinX;
        const z2 = it.y * sinX + z1 * cosX;
        const depth = (z2 + 1) / 2;                 // 0 back … 1 front
        it.el.style.transform =
          'translate(-50%,-50%) translate3d(' + (x1 * radius).toFixed(1) + 'px,' +
          (y2 * radius).toFixed(1) + 'px,' + (z2 * radius).toFixed(1) + 'px)';
        it.el.style.opacity = (0.18 + depth * 0.82).toFixed(2);
      }
    }

    if (reduceMotion) { render(); return; }

    let running = false;
    function loop() {
      if (!running) return;
      if (!dragging) { ry += 0.0022; vy *= 0.94; vx *= 0.94; ry += vy * 0.05; rx += vx * 0.05; }
      render();
      requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
      else if (!e.isIntersecting) { running = false; }
    }, { threshold: 0 });
    io.observe(host);
    render();
  }

  /* -- 08 Timeline progress ------------------------------------------------ */
  function initTimeline() {
    const timeline = $('#timeline');
    if (!timeline) return;
    const rows = $$('.tl', timeline);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
    }, { rootMargin: '-35% 0px -45% 0px' });
    rows.forEach((r) => io.observe(r));

    if (reduceMotion) { timeline.style.setProperty('--tl-progress', '100%'); return; }

    let ticking = false;
    const update = () => {
      const rect = timeline.getBoundingClientRect();
      const done = clamp((window.innerHeight * 0.55 - rect.top) / rect.height, 0, 1);
      timeline.style.setProperty('--tl-progress', (done * 100).toFixed(1) + '%');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* -- 09 Pointer flourishes ---------------------------------------------- */
  function initPointer() {
    if (!finePointer || reduceMotion) return;

    // Custom cursor
    const cursor = $('#cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    let mx = 0, my = 0, rxp = 0, ryp = 0;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-on');
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });

    (function ringLoop() {
      rxp = lerp(rxp, mx, 0.18);
      ryp = lerp(ryp, my, 0.18);
      ring.style.transform = 'translate(' + rxp.toFixed(1) + 'px,' + ryp.toFixed(1) + 'px)';
      requestAnimationFrame(ringLoop);
    })();

    $$('a, button, .tilt').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hot'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hot'));
    });

    // Magnetic buttons — a small pull toward the pointer, released on exit.
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // Card spotlight + a restrained tilt
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        card.style.transform =
          'perspective(900px) rotateX(' + ((0.5 - py) * 4).toFixed(2) + 'deg) rotateY(' +
          ((px - 0.5) * 5).toFixed(2) + 'deg) translateY(-3px)';
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }


  /* -- 10 Case studies -----------------------------------------------------
     One panel open at a time. Height animates via grid-template-rows 0fr→1fr,
     so nothing has to be measured and it still works if content reflows.     */
  function initCases() {
    const cases = $$('.case');
    if (!cases.length) return;

    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      $('.case__head', item).setAttribute('aria-expanded', String(open));
      if (open) paintFigures(item);
    }

    cases.forEach((item) => {
      $('.case__head', item).addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        cases.forEach((other) => setOpen(other, false));
        setOpen(item, willOpen);
      });
    });

    // First case ships open; paint its figures once it scrolls into view.
    const first = cases[0];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      paintFigures(first);
      io.disconnect();
    }, { threshold: 0.2 });
    io.observe(first);
  }

  /* Fill the before/after bars and the donut. Idempotent — safe to re-run. */
  function paintFigures(scope) {
    $$('.ba', scope).forEach((ba) => {
      const before = parseFloat(ba.dataset.before);
      const after = parseFloat(ba.dataset.after);
      const max = Math.max(before, after);
      const beforePct = (before / max) * 100;
      const afterPct = (after / max) * 100;
      // rAF so the transition has a frame to start from
      requestAnimationFrame(() => {
        $('.ba__fill--before', ba).style.width = beforePct + '%';
        $('.ba__fill--after', ba).style.width = afterPct + '%';
      });
    });

    $$('.donut', scope).forEach((donut) => {
      const value = parseFloat(donut.dataset.value);
      const ring = $('.donut__value', donut);
      const circumference = 2 * Math.PI * 52;
      ring.style.strokeDasharray = circumference;
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = circumference * (1 - value / 100);
      });
    });
  }

  /* -- 11 Command palette (⌘K / Ctrl+K) ------------------------------------ */
  function initPalette() {
    const palette = $('#palette');
    const input = $('#paletteInput');
    const list = $('#paletteList');
    const trigger = $('#paletteTrigger');
    if (!palette) return;

    const ITEMS = [
      { label: 'Profile', hint: 'Section', run: () => go('#profile') },
      { label: 'Systems — the stack I run', hint: 'Section', run: () => go('#systems') },
      { label: 'Approach — how I work', hint: 'Section', run: () => go('#approach') },
      { label: 'Capability — skills & stack', hint: 'Section', run: () => go('#skills') },
      { label: 'Experience — track record', hint: 'Section', run: () => go('#experience') },
      { label: 'Case studies', hint: 'Section', run: () => go('#work') },
      { label: 'Education & credentials', hint: 'Section', run: () => go('#education') },
      { label: 'Contact', hint: 'Section', run: () => go('#contact') },
      { label: 'Download resume (PDF)', hint: 'Action', run: () => open('assets/resume/Faizan-Tariq-Resume.pdf') },
      { label: 'Read the Fibabanka capstone report', hint: 'Action', run: () => open('assets/docs/fibabanka-capstone.pdf') },
      { label: 'Email ftariq377@gmail.com', hint: 'Action', run: () => open('mailto:ftariq377@gmail.com') },
      { label: 'Copy email address', hint: 'Action', run: () => copyText('ftariq377@gmail.com') },
      { label: 'Open LinkedIn profile', hint: 'Action', run: () => open('https://www.linkedin.com/in/faizan-tariq-59b028254') }
    ];

    let filtered = ITEMS.slice();
    let active = 0;

    const go = (hash) => { close(); $(hash).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); };
    const open = (url) => { close(); window.open(url, url.startsWith('http') ? '_blank' : '_self', 'noopener'); };

    function render() {
      list.innerHTML = '';
      if (!filtered.length) {
        list.innerHTML = '<li class="palette__empty" role="presentation">Nothing matches that.</li>';
        return;
      }
      filtered.forEach((item, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === active));
        li.innerHTML = item.label + '<span class="mono">' + item.hint + '</span>';
        li.addEventListener('click', item.run);
        li.addEventListener('pointermove', () => { active = i; sync(); });
        list.appendChild(li);
      });
    }
    function sync() {
      $$('li[role="option"]', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
      const current = list.children[active];
      if (current && current.scrollIntoView) current.scrollIntoView({ block: 'nearest' });
    }
    function openPalette() {
      palette.hidden = false;
      document.body.classList.add('is-locked');
      input.value = ''; filtered = ITEMS.slice(); active = 0; render();
      input.focus();
    }
    function close() {
      palette.hidden = true;
      document.body.classList.remove('is-locked');
    }

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      filtered = ITEMS.filter((item) => item.label.toLowerCase().includes(query));
      active = 0; render();
    });

    palette.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) close(); });
    trigger.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (combo) { e.preventDefault(); palette.hidden ? openPalette() : close(); return; }
      if (palette.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % filtered.length; sync(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % filtered.length; sync(); }
      if (e.key === 'Enter' && filtered[active]) { e.preventDefault(); filtered[active].run(); }
    });
  }

  /* -- 12 Copy to clipboard + toast ---------------------------------------- */
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  function copyText(text) {
    const done = () => toast('Copied ' + text);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => toast('Copy blocked — the address is ' + text));
      return;
    }
    // http:// fallback (GitHub Pages is https, but local previews may not be)
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); done(); } catch (err) { toast('Copy blocked — the address is ' + text); }
    document.body.removeChild(field);
  }

  function initCopy() {
    const button = $('#copyMail');
    if (button) button.addEventListener('click', () => copyText(button.dataset.copy));
  }


  /* -- 13 Portrait parallax ------------------------------------------------
     Four layers at different depths tracked against the pointer. The chips sit
     shallowest so they travel furthest, which is what sells the depth.        */
  function initPortrait() {
    const frame = $('#portrait');
    if (!frame || reduceMotion || !finePointer) return;

    const layers = [
      { el: $('.portrait__halo', frame), depth: 8 },
      { el: $('.portrait__ring', frame), depth: 14 },
      { el: $('.portrait__arc', frame), depth: 20 },
      { el: $('picture', frame), depth: 26 }
    ].filter((l) => l.el);

    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;

    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      ty = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    frame.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

    function loop() {
      cx = lerp(cx, tx, 0.09);
      cy = lerp(cy, ty, 0.09);
      layers.forEach(({ el, depth }) => {
        el.style.transform =
          'translate3d(' + (cx * depth).toFixed(1) + 'px,' + (cy * depth * 0.65).toFixed(1) + 'px,0)';
      });
      if (Math.abs(cx - tx) > 0.002 || Math.abs(cy - ty) > 0.002) { requestAnimationFrame(loop); }
      else { running = false; }
    }
  }

  /* -- 14 Systems stack -----------------------------------------------------
     Plates open out as the section scrolls through; legend hover/focus lifts
     and lights a single layer.                                               */
  function initStack() {
    const scene = $('#stackScene');
    const legend = $('#stackLegend');
    if (!scene || !legend) return;

    const plates = $$('.plate', scene);
    // index runs bottom (base) to top so translateZ stacks in the right order
    plates.slice().reverse().forEach((plate, i) => plate.style.setProperty('--i', i));

    function light(layer) {
      scene.classList.toggle('is-lit', !!layer);
      plates.forEach((p) => p.classList.toggle('is-active', p.dataset.layer === layer));
      $$('button', legend).forEach((b) => b.classList.toggle('is-active', b.dataset.layer === layer));
    }

    $$('button', legend).forEach((button) => {
      const layer = button.dataset.layer;
      ['pointerenter', 'focus'].forEach((evt) => button.addEventListener(evt, () => light(layer)));
      ['pointerleave', 'blur'].forEach((evt) => button.addEventListener(evt, () => light(null)));
      button.addEventListener('click', () => light(layer));
    });
    legend.addEventListener('pointerleave', () => light(null));

    if (reduceMotion) { scene.style.setProperty('--sep', 1); return; }

    let ticking = false;
    function update() {
      const rect = scene.getBoundingClientRect();
      // 0 while below the fold, 1 once centred
      const progress = clamp(1 - Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight * 0.8), 0, 1);
      scene.style.setProperty('--sep', progress.toFixed(3));
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* -- 15 Approval race ----------------------------------------------------
     Plays the 5h manual cycle against the 1–3h automated one in real time,
     compressed to a few seconds. Numbers come straight from the case study.  */
  function initRace() {
    const race = $('#race');
    if (!race) return;

    const button = $('.race__run', race);
    const manual = { fill: $('.race__fill--manual', race), time: $('[data-lane="manual"]', race), hours: 5 };
    const auto = { fill: $('.race__fill--auto', race), time: $('[data-lane="auto"]', race), hours: 2 };
    const DURATION = 2600;   // ms for the slower lane

    function run() {
      button.disabled = true;
      const start = performance.now();

      (function tick(now) {
        const elapsed = now - start;
        [manual, auto].forEach((lane) => {
          const laneDuration = DURATION * (lane.hours / manual.hours);
          const t = clamp(elapsed / laneDuration, 0, 1);
          lane.fill.style.width = (t * (lane.hours / manual.hours) * 100).toFixed(1) + '%';
          lane.time.textContent = (t * lane.hours).toFixed(1) + 'h';
        });
        if (elapsed < DURATION) { requestAnimationFrame(tick); return; }
        auto.time.textContent = '1–3h';
        button.disabled = false;
        button.lastChild.textContent = ' Run again';
      })(start);
    }

    button.addEventListener('click', run);

    // autoplay once when the panel it lives in is opened and visible
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || reduceMotion) return;
      run();
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(race);
  }

  /* -- Kick off ------------------------------------------------------------ */
  function main() {
    initNav();
    initReveals();
    initCounters();
    initSphere();
    initTimeline();
    initPointer();
    initCases();
    initPortrait();
    initStack();
    initRace();
    initPalette();
    initCopy();
    initGraph();
    boot(heroEntrance);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
