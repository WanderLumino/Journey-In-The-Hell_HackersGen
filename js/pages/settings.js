/* Schede */
  document.querySelectorAll('.s-tab:not(.s-tab-reset)').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.s-tab:not(.s-tab-reset)').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.s-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const p = document.getElementById('tab-' + btn.dataset.tab);
      if (p) p.classList.add('active');
    });
  });

  /* Cursorei */
  document.querySelectorAll('.s-sl').forEach(sl => {
    const vEl = document.getElementById(sl.id + 'v');
    function upd() {
      if (vEl) vEl.textContent = sl.value;
      sl.style.setProperty('--p', ((sl.value - sl.min) / (sl.max - sl.min) * 100) + '%');
    }
    upd(); sl.addEventListener('input', upd);
  });

  /* Pulsanti di scelta */
  document.querySelectorAll('.s-seg').forEach(seg => {
    seg.querySelectorAll('.s-seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        seg.querySelectorAll('.s-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  /* Pulsanti della difficolt? */
  document.querySelectorAll('.s-diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.s-diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Salvataggio */
  function showMsg(t) {
    const m = document.getElementById('smsg');
    m.textContent = t; m.classList.add('show');
    setTimeout(() => m.classList.remove('show'), 3000);
  }
  document.getElementById('saveBtn').addEventListener('click', () => showMsg('Impostazioni salvate'));
  document.getElementById('saveAccBtn') && document.getElementById('saveAccBtn').addEventListener('click', () => showMsg('Account aggiornato'));

  /* Finestra di dialogo */
  const modal = document.getElementById('modal');
  document.getElementById('resetBtn').addEventListener('click', () => modal.classList.add('open'));
  document.getElementById('cancelReset').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
  document.getElementById('confirmReset').addEventListener('click', () => {
    document.querySelectorAll('.s-sl').forEach(sl => { sl.value = sl.defaultValue; sl.dispatchEvent(new Event('input')); });
    document.querySelectorAll('.s-toggle input').forEach(t => { t.checked = t.defaultChecked; });
    modal.classList.remove('open');
    showMsg('Impostazioni ripristinate');
  });
