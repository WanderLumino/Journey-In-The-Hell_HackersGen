/* ── shared.js — particles, cursor, nav scroll ── */
(function () {
  /* Custom cursor */
  const cur = document.getElementById('cursor');
  if (cur) {
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px';
      cur.style.top  = e.clientY + 'px';
    }, { passive: true });
    document.querySelectorAll('a,button,.menu-btn,.s-tab,.s-seg-btn,.s-diff-btn,.s-btn,.s-toggle').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
    });
  }

  /* Ember particles */
  const cvs = document.getElementById('cvs');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = cvs.width  = window.innerWidth;
    H = cvs.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function spawn() {
    particles.push({
      x:  Math.random() * W,
      y:  H + 6,
      r:  .5 + Math.random() * 1.8,
      vx: (Math.random() - .5) * .6,
      vy: -(Math.random() * 1.2 + .4),
      life: 1,
      decay: .004 + Math.random() * .006
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    if (Math.random() < .25) spawn();
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const hue = 18 + Math.random() * 14;
      ctx.fillStyle = `hsla(${hue},90%,55%,${p.life * .85})`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();

  /* Scroll reveal */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const i  = parseInt(el.dataset.i || 0);
      setTimeout(() => el.classList.add('visible'), i * 70);
      io.unobserve(el);
    });
  }, { threshold: .1 });
  document.querySelectorAll('.stat-card, .circle-row').forEach(el => io.observe(el));
})();