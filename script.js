/* Portfolio — Sedjame Vianney */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- barre de progression + nav ---------- */
  const progress = $('#progress');
  const nav = $('#nav');
  let ticking = false;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    nav.classList.toggle('is-scrolled', h.scrollTop > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- halo qui suit la souris ---------- */
  if (finePointer && !reduce) {
    const glow = $('#glow');
    let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      glow.style.setProperty('--mx', x + 'px');
      glow.style.setProperty('--my', y + 'px');
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- menu mobile ---------- */
  const burger = $('#burger');
  const links = $('#navLinks');
  const closeMenu = () => { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- lien actif selon la section ---------- */
  const navAnchors = $$('a', links);
  const sections = navAnchors.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- texte tapé dans le hero ---------- */
  const typed = $('#typed');
  const phrases = ['Développeur Web Junior', 'Full-Stack Laravel & React', 'Créateur d\'applications web', 'Passionné d\'IA et de code'];
  if (typed && !reduce) {
    let p = 0, i = phrases[0].length, del = true, wait = 0;
    const tick = () => {
      const full = phrases[p];
      if (wait > 0) { wait--; return setTimeout(tick, 60); }
      if (del) {
        i--; typed.textContent = full.slice(0, i);
        if (i === 0) { del = false; p = (p + 1) % phrases.length; }
        return setTimeout(tick, 35);
      }
      const target = phrases[p];
      i++; typed.textContent = target.slice(0, i);
      if (i === target.length) { del = true; wait = 30; }
      setTimeout(tick, 65);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- apparition au scroll + compteurs + barres ---------- */
  const countUp = el => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      $$('[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$('.reveal').forEach((el, idx) => {
    // léger décalage entre éléments voisins
    const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')) : [];
    el.style.setProperty('--i', String(Math.max(0, siblings.indexOf(el)) % 4));
    io.observe(el);
  });
  $$('.tile').forEach((t, i) => {
    t.style.setProperty('--w', (t.dataset.level || 60) + '%');
    t.style.transitionDelay = (i % 6) * 40 + 'ms';
    io.observe(t);
  });

  /* ---------- filtres de projets ---------- */
  const chips = $$('.chip');
  const cards = $$('.card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.cat.split(' ').includes(f);
      card.classList.toggle('is-hidden', !show);
      if (show) { card.classList.add('in'); }
    });
  }));

  /* ---------- effet 3D + projecteur sur les cartes ---------- */
  if (finePointer && !reduce) {
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--px', (px * 100) + '%');
        card.style.setProperty('--py', (py * 100) + '%');
        card.style.transform = `perspective(1000px) rotateY(${(px - .5) * 6}deg) rotateX(${(.5 - py) * 6}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();
