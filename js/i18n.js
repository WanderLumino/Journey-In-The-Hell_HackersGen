// Una sola preferenza linguistica per menu, impostazioni e partita.
let linguaApp = 'it';
try { if (localStorage.getItem('lingua') === 'en') linguaApp = 'en'; } catch {}
function testoApp(italiano, inglese) { return linguaApp === 'en' ? inglese : italiano; }
function aggiornaTestiApp() {
    document.documentElement.lang = linguaApp;
    document.querySelectorAll('[data-it][data-en]').forEach(elemento => {
        elemento.textContent = elemento.dataset[linguaApp];
    });
    document.querySelectorAll('[data-language-toggle]').forEach(pulsante => {
        pulsante.replaceChildren();
        const bandiera = document.createElement('img');
        bandiera.src = `../assets/img/lang/${linguaApp}.svg`; bandiera.alt = ''; bandiera.width = 26; bandiera.height = 18;
        pulsante.append(bandiera, document.createTextNode(linguaApp.toUpperCase()));
        pulsante.title = testoApp('Passa a English', 'Switch to Italiano');
        pulsante.setAttribute('aria-label', pulsante.title);
    });
}
function impostaLingua(lingua) {
    if (!['it','en'].includes(lingua)) return;
    linguaApp = lingua;
    try { localStorage.setItem('lingua', lingua); } catch {}
    aggiornaTestiApp();
    window.dispatchEvent(new CustomEvent('lingua-cambiata', { detail: lingua }));
}
document.querySelectorAll('[data-language-toggle]').forEach(pulsante => {
    pulsante.addEventListener('click', () => impostaLingua(linguaApp === 'it' ? 'en' : 'it'));
});
window.addEventListener('storage', evento => { if (evento.key === 'lingua') impostaLingua(evento.newValue); });
aggiornaTestiApp();
