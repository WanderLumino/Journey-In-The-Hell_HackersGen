/* Transizione di avvio */
  document.getElementById('startBtn').addEventListener('click', function(e) {
    e.preventDefault();
    document.body.style.transition = 'opacity .8s';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = this.getAttribute('href'); }, 820);
  });
