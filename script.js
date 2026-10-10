(function () {
  const C = { accent:'140,196,166', steel:'125,156,196', soft:'185,196,208', paper:'230,236,232' };
  function readColours() {
    const cs = getComputedStyle(document.documentElement);
    const get = (n, d) => (cs.getPropertyValue(n).trim() || d);
    C.accent = get('--accent-rgb', C.accent);
    C.steel  = get('--steel-rgb', C.steel);
    C.paper  = get('--paper-rgb', C.paper);
    C.soft   = document.documentElement.getAttribute('data-theme') === 'light' ? '60,74,96' : '185,196,208';
  }
  readColours();
  window.__readColours = readColours;
  'use strict';
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(pointer: fine)').matches;
  $('#year').textContent = new Date().getFullYear();
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
  function initNav() {
    const nav = $('#nav');
    const links = $('.nav__links');
    const toggle = $('#navToggle');
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
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
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
        railBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.target === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
    const railToggle = () => {
      rail.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.7);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      meter.style.height = (max > 0 ? clamp(window.scrollY / max, 0, 1) * 100 : 0) + '%';
    };
    railToggle();
    window.addEventListener('scroll', railToggle, { passive: true });
  }
  function initGraph() {
    const canvas = $('#graph');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const LABELS = [
      'POS', 'Kiosk', 'Online ordering', 'Menu', 'Payments', 'Payroll', 'Inventory',
      'Catering', 'KitchenHub', 'DoorDash', 'Uber Eats', 'Grubhub', 'Go-live QA',
      'Jira', 'ERPNext', 'n8n', 'Python', 'Excel', 'Shopify', 'GitHub',
      'Claude Code', 'Arena Simulation', 'UAT', 'Data migration', 'Forecasting', 'KPI reporting'
    ];
    const DUST = 88;
    const TOTAL = LABELS.length + DUST;
    let w = 0, h = 0, dpr = 1, R = 260, cx = 0, cy = 0;
    const nodes = [];
    const edges = [];
    const pulses = [];
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
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * (w < 760 ? 0.40 : 0.30);
      cx = w < 900 ? w * 0.5 : w * 0.72;
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
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;
        const scale = FOV / (FOV + z2 * R);
        projected[i] = {
          x: cx + x1 * R * scale,
          y: cy + y2 * R * scale,
          depth: clamp((1 - z2) / 2, 0, 1),
          scale
        };
      }
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
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e++) {
        const ia = edges[e][0], ib = edges[e][1];
        const a = projected[ia], b = projected[ib];
        const depth = Math.max(a.depth, b.depth);
        if (depth < 0.18) continue;
        const touched = hover === ia || hover === ib;
        ctx.strokeStyle = touched
          ? 'rgba(' + C.accent + ',' + (depth * 0.75).toFixed(3) + ')'
          : 'rgba(' + C.steel + ',' + (depth * depth * 0.42).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let p = 0; p < pulses.length; p++) {
        const pulse = pulses[p];
        if (!reduceMotion) pulse.t += dt * pulse.speed;
        if (pulse.t > 1) { pulse.t = 0; pulse.edge = Math.floor(Math.random() * edges.length); }
        const a = projected[edges[pulse.edge][0]], b = projected[edges[pulse.edge][1]];
        const depth = Math.max(a.depth, b.depth);
        if (depth < 0.3) continue;
        const px = lerp(a.x, b.x, pulse.t);
        const py = lerp(a.y, b.y, pulse.t);
        ctx.fillStyle = 'rgba(' + C.accent + ',' + (depth * 0.85).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 1.9 * depth + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
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
          ? 'rgba(' + C.accent + ',' + (0.3 + p.depth * 0.7).toFixed(3) + ')'
          : 'rgba(' + C.soft + ',' + (p.depth * 0.45).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (isNode && (lit || (p.depth > 0.6 && w > 620))) {
          ctx.fillStyle = lit
            ? 'rgb(' + C.accent + ')'
            : 'rgba(' + C.paper + ',' + ((p.depth - 0.6) * 1.9).toFixed(3) + ')';
          ctx.fillText(n.label, p.x + (lit ? 12 : 9) * p.scale, p.y);
        }
      }
    }
    let running = false, last = 0, visible = true, inView = true;
    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      frame(dt);
      if (reduceMotion) { running = false; return; }
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
  function initReveals() {
    const targets = $$('.section__head, .tl, .card--work, .edu__main, .edu__certs, .about__body, .about__side, .skills__grid, .sphere, .principle, .subhead, .case, .stack, .reveal')
      .filter((el) => !el.closest('.hero'));
    if (reduceMotion) { targets.forEach((t) => t.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
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
  function initCounters() {
    const nums = $$('[data-count]');
    if (reduceMotion) return;
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
  function initSphere() {
    const stage = $('#sphereStage');
    if (!stage) return;
    const TAGS = [
      ['Jira', 1], ['POS systems', 1], ['Excel', 1], ['Claude Code', 1], ['KitchenHub', 1],
      ['Go-live QA', 1], ['Dashboards', 1], ['ERPNext', 1], ['Python', 1], ['n8n', 1],
      ['DoorDash', 0], ['Uber Eats', 0], ['Grubhub', 0], ['GitHub', 0], ['Requirements', 0],
      ['UAT', 0], ['XLOOKUP', 0], ['PivotTables', 0], ['Forecasting', 0], ['Shopify', 0],
      ['Asana', 0], ['GoHighLevel', 0], ['Hubstaff', 0], ['Arena', 0], ['Solver', 0], ['SOPs', 0]
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
        const depth = (z2 + 1) / 2;
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
  function initPointer() {
    if (!finePointer || reduceMotion) return;
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
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
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
    const first = cases[0];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      paintFigures(first);
      io.disconnect();
    }, { threshold: 0.2 });
    io.observe(first);
  }
  function paintFigures(scope) {
    $$('.ba', scope).forEach((ba) => {
      const before = parseFloat(ba.dataset.before);
      const after = parseFloat(ba.dataset.after);
      const max = Math.max(before, after);
      const beforePct = (before / max) * 100;
      const afterPct = (after / max) * 100;
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
  function initPalette() {
    const palette = $('#palette');
    const input = $('#paletteInput');
    const list = $('#paletteList');
    const trigger = $('#paletteTrigger');
    if (!palette) return;
    const ITEMS = [
      { label: 'Quick view: everything on one screen', hint: 'Action', run: () => { close(); window.__openSheet && window.__openSheet('qv'); } },
      { label: 'View CV', hint: 'Action', run: () => { close(); window.__openSheet && window.__openSheet('cvm'); } },
      { label: 'Download CV (PDF, 2 pages)', hint: 'Action', run: () => open('Faizan-Tariq-CV.pdf') },
      { label: 'Play the 60-second tour', hint: 'Action', run: () => { close(); window.__startTour && window.__startTour(); } },
      { label: 'Experience', hint: 'Section', run: () => go('#experience') },
      { label: 'Selected work and case studies', hint: 'Section', run: () => go('#work') },
      { label: 'Go-live pipeline', hint: 'Section', run: () => go('#pipeline') },
      { label: 'For recruiters: pick the role you are hiring for', hint: 'Section', run: () => go('#fit') },
      { label: 'Skills and tools', hint: 'Section', run: () => go('#skills') },
      { label: 'About and approach', hint: 'Section', run: () => go('#profile') },
      { label: 'Education and credentials', hint: 'Section', run: () => go('#education') },
      { label: 'Contact', hint: 'Section', run: () => go('#contact') },
      { label: 'Read the Fibabanka capstone report', hint: 'Action', run: () => (window.__noCapstone ? go('#education') : open('fibabanka-capstone.pdf')) },
      { label: 'Email ftariq377@gmail.com', hint: 'Action', run: () => open('mailto:ftariq377@gmail.com') },
      { label: 'Copy email address', hint: 'Action', run: () => copyText('ftariq377@gmail.com') },
      { label: 'Switch light or dark theme', hint: 'Action', run: () => { close(); window.__toggleTheme && window.__toggleTheme(); } },
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
      navigator.clipboard.writeText(text).then(done).catch(() => toast('Copy blocked. The address is ' + text));
      return;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(field);
    field.select();
    try { document.execCommand('copy'); done(); } catch (err) { toast('Copy blocked. The address is ' + text); }
    document.body.removeChild(field);
  }
  function initCopy() {
    const button = $('#copyMail');
    if (button) button.addEventListener('click', () => copyText(button.dataset.copy));
  }
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
  function initStack() {
    const scene = $('#stackScene');
    const legend = $('#stackLegend');
    if (!scene || !legend) return;
    const plates = $$('.plate', scene);
    plates.slice().reverse().forEach((plate, i) => plate.style.setProperty('--i', i));
    const layers = $$('.layer', legend);
    function light(layer) {
      scene.classList.toggle('is-lit', !!layer);
      plates.forEach((p) => p.classList.toggle('is-active', p.dataset.layer === layer));
    }
    function openLayer(item) {
      layers.forEach((other) => {
        const open = other === item;
        other.classList.toggle('is-open', open);
        $('.layer__head', other).setAttribute('aria-expanded', String(open));
      });
      light(item ? item.dataset.layer : null);
    }
    layers.forEach((item) => {
      const head = $('.layer__head', item);
      head.addEventListener('click', () => openLayer(item.classList.contains('is-open') ? null : item));
      head.addEventListener('pointerenter', () => light(item.dataset.layer));
      head.addEventListener('focus', () => light(item.dataset.layer));
      const next = $('.layer__next', item);
      if (!next) return;
      next.addEventListener('click', () => {
        const target = layers.find((l) => l.dataset.layer === next.dataset.next);
        if (!target) return;
        openLayer(target);
        $('.layer__head', target).scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth', block: 'center'
        });
      });
    });
    legend.addEventListener('pointerleave', () => {
      const open = layers.find((l) => l.classList.contains('is-open'));
      light(open ? open.dataset.layer : null);
    });
    light('core');
    if (reduceMotion) { scene.style.setProperty('--sep', 1); return; }
    let ticking = false;
    function update() {
      const rect = scene.getBoundingClientRect();
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
  function initEvidence() {
    const banner = $('#evidence');
    const label = $('#evidenceLabel');
    const clear = $('#evidenceClear');
    if (!banner) return;
    const targets = $$('[data-role-id]');
    function show(name, roles) {
      document.body.classList.add('is-linked');
      targets.forEach((el) => el.classList.toggle('is-match', roles.includes(el.dataset.roleId)));
      label.textContent = name;
      banner.hidden = false;
      $$('[data-role-id].is-match').forEach((el) => el.classList.add('is-in'));
      const first = $('[data-role-id].is-match');
      (first || $('#experience')).scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }
    function reset() {
      document.body.classList.remove('is-linked');
      targets.forEach((el) => el.classList.remove('is-match'));
      banner.hidden = true;
    }
    window.__showEvidence = show;
    $$('.chips--evidence button[data-roles]').forEach((chip) => {
      chip.addEventListener('click', () => show(chip.textContent.trim(), chip.dataset.roles.split(',')));
    });
    clear.addEventListener('click', reset);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('is-linked')) reset();
    });
  }
  function initSheets() {
    let openEl = null, last = null;
    function openSheet(id) {
      const s = $('#' + id); if (!s) return;
      if (openEl) closeSheet(true);
      const nl = $('#navLinks'), nt = $('#navToggle'); if (nl && nl.classList.contains('is-open')) { nl.classList.remove('is-open'); if (nt) nt.setAttribute('aria-expanded', 'false'); }
      last = document.activeElement; s.hidden = false; openEl = s;
      document.body.classList.add('is-locked');
      const box = $('.sheet__box', s); if (box) box.scrollTop = 0;
      const f = $('[data-close]', s); if (f) f.focus();
    }
    function closeSheet(keep) {
      if (!openEl) return;
      openEl.hidden = true; openEl = null; document.body.classList.remove('is-locked');
      if (!keep && last) last.focus();
    }
    $$('[data-cv]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openSheet('cvm'); }));
    $$('#qvOpen,[data-qv]').forEach((b) => b.addEventListener('click', () => openSheet('qv')));
    $$('.sheet').forEach((s) => {
      s.addEventListener('click', (e) => { if (e.target === s) closeSheet(); });
      $$('[data-close]', s).forEach((b) => b.addEventListener('click', () => closeSheet()));
    });
    $$('.sheet [data-copy]').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.copy)));
    document.addEventListener('keydown', (e) => {
      if (!openEl) return;
      if (e.key === 'Escape') { e.stopPropagation(); closeSheet(); return; }
      if (e.key === 'Tab') {
        const f = $$('a[href],button', openEl).filter((x) => x.offsetParent !== null);
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    }, true);
    window.__openSheet = openSheet;
  }
  function initTheme() {
    const btn = $('#themeToggle'); const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    function apply(light) {
      if (light) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
      if (btn) { btn.setAttribute('aria-pressed', String(light)); btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode'); }
      if (meta) meta.setAttribute('content', light ? '#F3F6F2' : '#0B1322');
      readColours();
    }
    apply(root.getAttribute('data-theme') === 'light');
    function toggle() {
      const light = root.getAttribute('data-theme') !== 'light';
      apply(light);
      try { localStorage.setItem('ft-theme', light ? 'light' : 'dark'); } catch (e) {}
    }
    if (btn) btn.addEventListener('click', toggle);
    window.__toggleTheme = toggle;
  }
  function initPromo() {
    const steps = $$('.promo__step'); if (!steps.length) return;
    const panels = { 0: $('#promoAssoc'), 1: $('#promoSenior') };
    function pick(n, focus) {
      steps.forEach((s) => { const on = +s.dataset.step === n; s.setAttribute('aria-selected', String(on)); s.tabIndex = on ? 0 : -1; });
      Object.keys(panels).forEach((k) => { panels[k].hidden = +k !== n; });
      if (focus) steps.find((s) => +s.dataset.step === n).focus();
    }
    steps.forEach((s) => {
      s.addEventListener('click', () => pick(+s.dataset.step));
      s.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pick(+s.dataset.step === 1 ? 0 : 1, true); } });
    });
    pick(1);
    $$('.tl__more').forEach((b) => b.addEventListener('click', () => {
      const card = b.closest('.tl__card'); const open = card.classList.toggle('is-collapsed') === false;
      b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Show less' : 'Show all ' + $$('ul:not(.chips) li', card).length;
    }));
  }
  function initRace() {
    $$('.race').forEach((race) => {
      const button = $('.race__run', race);
      const aHours = parseFloat(race.dataset.a || 5);
      const bHours = parseFloat(race.dataset.b || 2);
      const manual = { fill: $('.race__fill--manual', race), time: $('[data-lane="manual"]', race), hours: aHours, final: race.dataset.aFinal };
      const auto = { fill: $('.race__fill--auto', race), time: $('[data-lane="auto"]', race), hours: bHours, final: race.dataset.bFinal };
      const DURATION = 2600;
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
          if (manual.final) manual.time.textContent = manual.final;
          if (auto.final) auto.time.textContent = auto.final;
          button.disabled = false;
          button.lastChild.textContent = ' Run again';
        })(start);
      }
      button.addEventListener('click', run);
      if (reduceMotion) {
        manual.fill.style.width = '100%';
        auto.fill.style.width = (bHours / aHours * 100) + '%';
        manual.time.textContent = manual.final || aHours + 'h';
        auto.time.textContent = auto.final || bHours + 'h';
        return;
      }
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        run();
        io.disconnect();
      }, { threshold: 0.5 });
      io.observe(race);
    });
  }
  const FIT = {
    ops: {
      title: 'Operations Analyst', roles: ['aio', 'skilledforce', 'coopable'],
      proof: [['50–60% → 95%', 'On-time payroll across 19 restaurants, via a web-based dashboard with automated alerts.'],
              ['320 → 208', 'Open support tickets after a Jira dashboard segmented the backlog by priority, module and assignee.'],
              ['+32%', 'Tasks completed per week after introducing workload allocation and KPI tracking for a 10-person team.']],
      tools: 'Excel (Advanced) · Jira (Advanced) · Dashboards · KPI reporting',
      pitch: 'Faizan Tariq is a Senior Operations Associate in U.S. restaurant tech who builds the tracking that keeps operations on time: on-time payroll from 50–60% to 95%, open tickets down 35%, and 32% more tasks completed per week in a team he managed.'
    },
    impl: {
      title: 'Implementation Specialist', roles: ['aio', 'onescreen'],
      proof: [['6–7 / week', 'New restaurants taken from post-onboarding to go-live, each in 2–3 weeks, leading a four-person team.'],
              ['12 live', 'Restaurants taken live so far — zero churned.'],
              ['End to end', 'Pre-launch QA across POS, kiosks, online ordering and KitchenHub; ERPNext rollout with data migration, UAT and user training.']],
      tools: 'POS & kiosks · KitchenHub · DoorDash · Uber Eats · Grubhub · ERPNext · UAT',
      pitch: 'Faizan Tariq owns restaurant go-lives at a U.S. restaurant-tech platform: 6–7 new accounts a week across menu, payroll, POS, kiosks and DoorDash, Uber Eats and Grubhub, live in 2–3 weeks, with 12 taken live and zero churn. He also supported an ERPNext rollout through migration, UAT and training.'
    },
    ba: {
      title: 'Business / Systems Analyst', roles: ['aio', 'onescreen'],
      proof: [['Lead', 'Requirements for a new Catering Module: U.S. market research, feature documentation and module structure with product managers.'],
              ['6–7h → 2–4h', 'Menu creation time after his use-case research and feature requests drove a full menu-tool revamp.'],
              ['UAT', 'Data migration, user acceptance testing and server-script configuration on a production ERPNext rollout.']],
      tools: 'Requirements gathering · Process mapping · UAT · Jira (Advanced) · ERPNext',
      pitch: 'Faizan Tariq turns operational problems into product requirements: he leads requirements for a new Catering Module, wrote the feature requests that cut menu creation from 6–7 to 2–4 hours, and ran migration and UAT on a production ERPNext rollout.'
    },
    menu: {
      title: 'Product & Menu Operations', roles: ['aio'],
      proof: [['6–7h → 2–4h', 'Average menu creation time after the menu-manager revamp he drove through feature requests.'],
              ['3 → 12', 'Pizza clients after the pizza-ordering interface he designed and coded went live across POS, kiosk and online ordering.'],
              ['0 churn', 'Across 12 go-lives — including fixing menu issues on accounts that showed churn risk.']],
      tools: 'Menu operations · POS & kiosks · Online ordering · Feature requests · Claude Code',
      pitch: 'Faizan Tariq works where menus meet the product: he drove a menu-tool revamp that cut setup from 6–7 to 2–4 hours, built a pizza-ordering interface after which pizza clients grew from 3 to 12, and has kept all 12 restaurants he took live.'
    },
    pi: {
      title: 'Process Improvement', roles: ['onescreen', 'aio', 'skilledforce'],
      proof: [['5h → 1–3h', 'Approval cycle time after an n8n and Python workflow automation.'],
              ['50–60% → 95%', 'On-time payroll once deadlines and alerts were centralised in one dashboard.'],
              ['−15%', 'Departmental operating expenses after removing redundant software and tightening budgets.']],
      tools: 'n8n · Python · Dashboards · Excel (Advanced) · SOPs',
      pitch: 'Faizan Tariq is an Industrial Engineering graduate who finds where time is lost and automates it out: approvals from five hours to one to three, on-time payroll from 50–60% to 95%, and department costs down 15%.'
    },
    sc: {
      title: 'Supply Chain Analyst', roles: ['onescreen', 'coopable', 'capstone'],
      proof: [['95%', 'On-time delivery across five regional vendors, alongside Shopify catalogue management for U.S. ordering.'],
              ['ERPNext', 'Production rollout for five supply chain users covering inventory, stock, shipping and tracking.'],
              ['Forecasts', 'Monthly and quarterly claims forecasts for 350 dealerships; Transportation & Logistics specialisation.']],
      tools: 'ERPNext · Inventory & stock · Vendor coordination · Forecasting · Excel (Advanced)',
      pitch: 'Faizan Tariq brings supply chain systems experience — an ERPNext rollout across inventory, stock and shipping and five regional vendors at 95% on-time delivery — plus daily reporting and forecasting for 350 U.S. dealerships and a Transportation & Logistics specialisation.'
    }
  };
  function initFit() {
    const tabs = $$('#fitRoles [data-fit]');
    if (!tabs.length) return;
    let current = 'ops';
    const card = $('#fitCard');
    function render(key) {
      const d = FIT[key]; if (!d) return;
      current = key;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.fit === key)));
      card.classList.remove('is-swap'); void card.offsetWidth; card.classList.add('is-swap');
      $('#fitTitle').textContent = d.title;
      const list = $('#fitProof'); list.innerHTML = '';
      d.proof.forEach(([big, text]) => {
        const li = document.createElement('li');
        const b = document.createElement('b'); b.textContent = big;
        const s = document.createElement('span'); s.textContent = text;
        li.append(b, s); list.appendChild(li);
      });
      $('#fitTools').textContent = d.tools;
      $('#fitPitch').textContent = d.pitch;
    }
    tabs.forEach((t) => {
      t.addEventListener('click', () => render(t.dataset.fit));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1);
        const next = tabs[(i + tabs.length) % tabs.length];
        next.focus(); render(next.dataset.fit);
      });
    });
    $('#fitCopy').addEventListener('click', () => {
      const d = FIT[current];
      copyText(d.pitch + ' Contact: ftariq377@gmail.com, linkedin.com/in/faizan-tariq-59b028254');
    });
    $('#fitShow').addEventListener('click', () => {
      const d = FIT[current];
      if (window.__showEvidence) window.__showEvidence(d.title, d.roles);
    });
  }
  function initPipeline() {
    const track = $('#pipeTrack');
    const board = $('#pipeBoard');
    const counter = $('#pipeLive');
    const replay = $('#pipeReplay');
    if (!track || !board) return;
    const TOTAL = 12;
    const stages = $$('#pipeStages li');
    const prog = $('#pipeProgress');
    const dNo = $('#pipeDetailNo'), dTitle = $('#pipeDetailTitle'), dText = $('#pipeDetailText');
    let pinned = -1, walker = 0;
    function setStage(i) {
      stages.forEach((s, k) => s.classList.toggle('is-active', k === i));
      if (dNo) {
        dNo.textContent = 'Stage ' + String(i + 1).padStart(2, '0') + ' of ' + String(stages.length).padStart(2, '0');
        dTitle.textContent = $('b', stages[i]).textContent;
        dText.textContent = $('p', stages[i]).textContent;
      }
      if (prog) prog.style.width = ((i + 1) / stages.length * 100).toFixed(1) + '%';
    }
    stages.forEach((s, i) => {
      const pick = () => { pinned = i; clearInterval(walker); setStage(i); };
      s.addEventListener('click', pick);
      s.addEventListener('mouseenter', pick);
      s.addEventListener('focus', pick);
      s.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + stages.length) % stages.length; stages[n].focus(); }
      });
    });
    setStage(0);
    board.innerHTML = '';
    const cells = Array.from({ length: TOTAL }, () => {
      const c = document.createElement('i'); board.appendChild(c); return c;
    });
    let timers = [], running = false;
    function finalState() {
      cells.forEach((c) => c.classList.add('is-on'));
      counter.textContent = TOTAL;
      setStage(stages.length - 1);
    }
    if (reduceMotion) { finalState(); replay.hidden = true; return; }
    function clear() {
      timers.forEach(clearTimeout); timers = [];
      $$('.pipe__token', track).forEach((t) => t.remove());
      cells.forEach((c) => c.classList.remove('is-on'));
      counter.textContent = '0';
    }
    function run() {
      if (running) return;
      running = true; clear(); pinned = -1;
      let s = 0; setStage(0); clearInterval(walker);
      walker = setInterval(() => { if (pinned >= 0) return; s += 1; if (s >= stages.length - 1) { clearInterval(walker); } setStage(Math.min(s, stages.length - 1)); }, 760);
      let landed = 0;
      for (let i = 0; i < TOTAL; i++) {
        timers.push(setTimeout(() => {
          const tok = document.createElement('span');
          tok.className = 'pipe__token';
          tok.style.setProperty('--lane', String(i % 4));
          tok.textContent = 'R' + String(i + 1).padStart(2, '0');
          track.appendChild(tok);
          tok.style.setProperty('--dist', Math.max(0, board.offsetLeft - tok.offsetWidth - 16) + 'px');
          requestAnimationFrame(() => requestAnimationFrame(() => tok.classList.add('is-going')));
          tok.addEventListener('transitionend', () => {
            tok.remove();
            cells[landed].classList.add('is-on');
            landed += 1;
            counter.textContent = landed;
            if (landed === TOTAL) running = false;
          }, { once: true });
        }, i * 420));
      }
    }
    replay.addEventListener('click', () => { running = false; run(); });
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      run(); io.disconnect();
    }, { threshold: 0.35 });
    io.observe(track);
  }
  function initTour() {
    const tour = $('#tour');
    const spot = $('#tourSpot');
    const text = $('#tourText');
    const step = $('#tourStep');
    const prog = $('#tourProg');
    const pauseBtn = $('#tourPause');
    if (!tour) return;
    const STEPS = [
      ['.hero__stats', 'Senior Operations Associate in U.S. restaurant tech. Twelve restaurants taken live with zero churn, and payroll now on time 95% of runs, up from 50–60%.'],
      ['#promo', 'Six employers across the U.S., Türkiye and Pakistan, and a promotion at AIO App within ten months.'],
      ['#pipe', 'This is the job: 6–7 new restaurants a week, each live in 2–3 weeks, from handoff through QA and hardware deployment to launch.'],
      ['#cases', 'Five problems with real before-and-after numbers: tickets 320 to 208, payroll 50–60% to 95%, menu setup 6–7h to 2–4h, approvals 5h to 1–3h.'],
      ['#fit .fit', 'Hiring for a specific role? Pick it here to see the three most relevant results, with a short summary you can copy.'],
      ['#contact', 'CV, email and LinkedIn are all here. Thanks for your time.']
    ];
    const STEP_MS = 10000;
    let i = 0, paused = false, startedAt = 0, elapsedBefore = 0, raf = 0;
    function target() { return $(STEPS[i][0]); }
    function place() {
      const el = target(); if (!el) return;
      const r = el.getBoundingClientRect();
      const pad = 12;
      spot.style.transform = 'translate(' + (r.left - pad) + 'px,' + (r.top - pad) + 'px)';
      spot.style.width = (r.width + pad * 2) + 'px';
      spot.style.height = Math.min(r.height + pad * 2, window.innerHeight * 0.8) + 'px';
    }
    function show(n) {
      i = clamp(n, 0, STEPS.length - 1);
      step.textContent = (i + 1) + ' / ' + STEPS.length;
      text.textContent = STEPS[i][1];
      $('#tourNext').textContent = i === STEPS.length - 1 ? 'Finish' : 'Next';
      const el = target();
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      elapsedBefore = 0; startedAt = performance.now();
      setTimeout(place, reduceMotion ? 0 : 450);
    }
    function loop(now) {
      if (tour.hidden) return;
      place();
      if (!paused) {
        const t = elapsedBefore + (now - startedAt);
        prog.style.width = clamp(t / STEP_MS, 0, 1) * 100 + '%';
        if (t >= STEP_MS) { if (i < STEPS.length - 1) show(i + 1); else { end(); return; } }
      }
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (document.body.classList.contains('is-recruiter') && window.__setRecruiterMode) window.__setRecruiterMode(false);
      tour.hidden = false; document.body.classList.add('is-touring');
      paused = false; pauseBtn.textContent = 'Pause';
      show(0); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      $('#tourNext').focus({ preventScroll: true });
    }
    function end() {
      tour.hidden = true; document.body.classList.remove('is-touring');
      cancelAnimationFrame(raf);
    }
    function togglePause() {
      paused = !paused;
      if (paused) { elapsedBefore += performance.now() - startedAt; pauseBtn.textContent = 'Play'; }
      else { startedAt = performance.now(); pauseBtn.textContent = 'Pause'; }
    }
    $('#tourStart').addEventListener('click', start);
    $('#tourNext').addEventListener('click', () => (i < STEPS.length - 1 ? show(i + 1) : end()));
    $('#tourPrev').addEventListener('click', () => show(i - 1));
    pauseBtn.addEventListener('click', togglePause);
    $('#tourClose').addEventListener('click', end);
    document.addEventListener('keydown', (e) => {
      if (tour.hidden) return;
      if (e.key === 'Escape') end();
      if (e.key === 'ArrowRight') { i < STEPS.length - 1 ? show(i + 1) : end(); }
      if (e.key === 'ArrowLeft') show(i - 1);
    });
    window.addEventListener('resize', () => { if (!tour.hidden) place(); }, { passive: true });
    window.__startTour = start;
  }
  function initCapstoneGuard() {
    const links = $$('[data-capstone]');
    if (!links.length || location.protocol === 'file:') return;
    fetch(links[0].getAttribute('href'), { method: 'HEAD' })
      .then((r) => { if (!r.ok) { links.forEach((a) => { a.hidden = true; }); window.__noCapstone = true; } })
      .catch(() => {});
  }
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
    initEvidence();
    initSheets(); initTheme(); initPromo();
    initRace();
    initFit();
    initPipeline();
    initTour();
    initCapstoneGuard();
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
