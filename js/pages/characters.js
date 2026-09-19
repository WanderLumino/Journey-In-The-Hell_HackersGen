/* ── Cursore ── */
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cur.style.left = e.clientX + 'px';
  cur.style.top  = e.clientY + 'px';
}, { passive: true });
document.querySelectorAll('button, a, .class-card').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('hover'));
  el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
});

/* ── Braci ── */
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
let W, H, embers = [];
function resize() { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize, { passive: true });
function spawn() {
  embers.push({ x: Math.random()*W, y: H+4, r: .4+Math.random()*1.6, vx: (Math.random()-.5)*.5, vy: -(Math.random()*1+.3), life: 1, decay: .004+Math.random()*.005 });
}
(function loop() {
  ctx.clearRect(0,0,W,H);
  if (Math.random() < .22) spawn();
  embers = embers.filter(p => p.life > 0);
  embers.forEach(p => {
    p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = `hsla(${18+Math.random()*14},88%,55%,${p.life*.8})`; ctx.fill();
  });
  requestAnimationFrame(loop);
})();

/* ── Selezione della classe ── */
function datiClasse() {
  const scheda = document.querySelector(`[data-class="${selected}"]`);
  return { name: scheda.querySelector('.card-title').textContent, desc: scheda.querySelector('.card-desc').textContent };
}
window.addEventListener('lingua-cambiata', () => {
  if (!selected) return;
  const dati = datiClasse(); confirmName.textContent = modalClass.textContent = dati.name; modalDesc.textContent = dati.desc;
});

let selected = null;

const confirmBar  = document.getElementById('confirmBar');
const confirmName = document.getElementById('confirmName');
const modal       = document.getElementById('modal');
const modalClass  = document.getElementById('modalClassName');
const modalDesc   = document.getElementById('modalDesc');

document.querySelectorAll('.class-card').forEach(card => {
  const activate = () => {
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    selected = card.dataset.class;
    const d = datiClasse();
    confirmName.textContent = d.name;
    confirmBar.classList.add('visible');
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
});

document.querySelectorAll('.card-select-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const card = btn.closest('.class-card');
    card.click();
    openModal();
  });
});

document.getElementById('confirmBtn').addEventListener('click', openModal);

function openModal() {
  if (!selected) return;
  const d = datiClasse();
  modalClass.textContent = d.name;
  modalDesc.textContent  = d.desc;
  modal.classList.add('open');
}

document.getElementById('modalCancel').addEventListener('click', () => modal.classList.remove('open'));
document.getElementById('modalConfirm').addEventListener('click', () => {
  document.body.style.transition = 'opacity .9s';
  document.body.style.opacity = '0';
  try { localStorage.setItem("selectedClass", selected); } catch {}
  setTimeout(() => { document.body.style.opacity = '1'; document.body.style.transition = ''; modal.classList.remove('open'); }, 1000);
  window.location.href = "./game.html?class=" + encodeURIComponent(selected);
});
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

/* ── Animazione di ingresso delle schede ── */
const cards = document.querySelectorAll('.class-card');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const i = [...cards].indexOf(e.target);
    setTimeout(() => e.target.classList.add('entered'), i * 120);
    io.unobserve(e.target);
  });
}, { threshold: .08 });
cards.forEach(c => io.observe(c));
