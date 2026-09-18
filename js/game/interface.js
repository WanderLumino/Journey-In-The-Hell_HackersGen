const dialogo = document.getElementById('game-dialog');
const contenutoDialogo = document.getElementById('dialog-content');
let elementoPrecedente = null;
let messaggioScadenza = 0;
let ultimaInterfaccia = '';
function avvisa(testo) {
    document.getElementById('spunta').textContent = testoGioco(testo);
    messaggioScadenza = tempoGioco + 5000;
}
function azzeraTasti() {
    for (const tasto in keys) keys[tasto] = false;
}
function apriFinestra(tipo) {
    if (!pronto || finestraAttiva) return;
    elementoPrecedente = document.activeElement;
    finestraAttiva = tipo;
    azzeraTasti();
    renderizzaFinestra();
    dialogo.showModal();
    document.getElementById('close-dialog').focus();
}
function chiudiFinestra() {
    if (finestraAttiva === 'morte') return;
    finestraAttiva = null;
    dialogo.close();
    azzeraTasti();
    elementoPrecedente?.focus();
}
dialogo.addEventListener('cancel', evento => { evento.preventDefault(); chiudiFinestra(); });
document.getElementById('close-dialog').addEventListener('click', chiudiFinestra);
document.getElementById('bag-button').addEventListener('click', () => apriFinestra('zaino'));
document.getElementById('pause-button').addEventListener('click', () => apriFinestra('pausa'));
window.addEventListener('blur', () => { if (pronto && !finestraAttiva) apriFinestra('pausa'); });
document.addEventListener('visibilitychange', () => { if (document.hidden && pronto && !finestraAttiva) apriFinestra('pausa'); });
document.addEventListener('keydown', evento => {
    const tasto = evento.key.toLowerCase();
    if (!['escape', 'b', 'e'].includes(tasto)) return;
    if (evento.target instanceof HTMLSelectElement) return;
    evento.preventDefault();
    if (evento.repeat) return;
    if (tasto === 'escape') {
        if (finestraAttiva) chiudiFinestra(); else apriFinestra('pausa');
    } else if (tasto === 'b') {
        if (finestraAttiva === 'zaino') chiudiFinestra(); else if (!finestraAttiva) apriFinestra('zaino');
    } else interagisci();
});
function iconaOggetto(nome, variante, dimensione = 48) {
    const icona = document.createElement('canvas');
    icona.width = dimensione; icona.height = dimensione;
    icona.className = 'item-icon';
    icona.setAttribute('aria-hidden', 'true');
    if (nome.startsWith('spada')) {
        const immagine = immaginiAmbientali[nome];
        const colonna = nome === 'spada1' ? 5 : 1;
        icona.getContext('2d').imageSmoothingEnabled = false;
        icona.getContext('2d').drawImage(immagine, colonna * 32, 3 * 32, 32, 32, 0, 0, dimensione, dimensione);
    } else disegnaCella(icona.getContext('2d'), nome, variante, 0, 0, dimensione);
    return icona;
}
function pulsante(testo, azione, disabilitato = false) {
    const elemento = document.createElement('button');
    elemento.type = 'button'; elemento.textContent = testoGioco(testo); elemento.disabled = disabilitato;
    elemento.addEventListener('click', azione);
    return elemento;
}
function paragrafo(testo) {
    const elemento = document.createElement('p'); elemento.textContent = testoGioco(testo); return elemento;
}
function schedaOggetto(oggetto, negozio, indice) {
    const dati = tipiOggetto[oggetto.tipo];
    const scheda = document.createElement('article'); scheda.className = 'item-slot';
    scheda.append(iconaOggetto(oggetto.tipo, oggetto.variante));
    const titolo = document.createElement('h3');
    titolo.textContent = `${testoGioco(dati.nome)} · ${oggetto.variante + 1}`;
    scheda.append(titolo, paragrafo(dati.descrizione));
    if (negozio) {
        const prezzo = document.createElement('div'); prezzo.className = 'item-price';
        prezzo.append(iconaOggetto('rpg_icons', 2, 22), document.createTextNode(String(dati.prezzo)));
        scheda.append(prezzo, pulsante(monete < dati.prezzo ? 'Monete insufficienti' : 'Acquista', () => acquistaOggetto(indice), monete < dati.prezzo));
    } else {
        const residuo = Math.max(0, Math.ceil(((recuperi[oggetto.tipo] || 0) - tempoGioco) / 1000));
        scheda.append(pulsante(residuo ? `${testoGioco('Recupero')}: ${residuo}s` : 'Usa', () => usaOggetto(oggetto.id), residuo > 0));
    }
    return scheda;
}
function renderizzaFinestra() {
    if (!finestraAttiva) return;
    const titoli = { zaino: 'Zaino', negozio: 'Bottega del mercante', pausa: 'Pausa', portale: 'Il prossimo piano', morte: 'La discesa termina qui' };
    document.getElementById('dialog-title').textContent = testoGioco(titoli[finestraAttiva]);
    contenutoDialogo.replaceChildren();
    document.getElementById('close-dialog').hidden = finestraAttiva === 'morte';
    if (finestraAttiva === 'zaino' || finestraAttiva === 'negozio') {
        contenutoDialogo.append(paragrafo(`${testoGioco('Monete')}: ${monete} · ${testoGioco('Oggetti')}: ${inventario.length}`));
        const griglia = document.createElement('div'); griglia.className = 'item-grid';
        const negozio = finestraAttiva === 'negozio';
        if (negozio) griglia.classList.add('shop-grid');
        const oggetti = negozio ? mercanteAttivo.offerte : inventario;
        oggetti.forEach((oggetto, indice) => griglia.append(schedaOggetto(oggetto, negozio, indice)));
        if (negozio) {
            const arma = document.createElement('article'); arma.className = 'item-slot unavailable';
            arma.append(iconaOggetto(mercanteAttivo.arma, 0), paragrafo('Arma in esposizione'), pulsante('Non disponibile', () => {}, true));
            griglia.append(arma);
        } else if (!oggetti.length) contenutoDialogo.append(paragrafo('Lo zaino è vuoto. Apri un forziere o visita il mercante.'));
        contenutoDialogo.append(griglia, paragrafo('Bonus: 30 s. Recupero per categoria: 60 s. I timer sono fermi nei menu.'));
    } else if (finestraAttiva === 'portale') {
        contenutoDialogo.append(paragrafo('Vuoi scendere? Conserverai monete, oggetti e bonus. I nemici saranno più forti.'),
            pulsante('Entra nel prossimo piano', passaAlPianoSuccessivo), pulsante('Resta e commercia', chiudiFinestra));
    } else if (finestraAttiva === 'morte') {
        contenutoDialogo.append(paragrafo('Riprova: ogni discesa è un nuovo inizio.'), pulsante('Ricomincia', () => location.reload()));
    } else {
        contenutoDialogo.append(paragrafo('La partita e tutti i timer sono in pausa.'), pulsante('Riprendi', chiudiFinestra));
    }
    const collegamento = document.createElement('a'); collegamento.href = 'home.html'; collegamento.textContent = testoGioco('Torna al menu');
    contenutoDialogo.append(collegamento);
}
function aggiornaInterfaccia() {
    for (const [nome, valore, massimo] of [['hp', player_HP, player_max_HP], ['mp', player_MP, player_max_MP]]) {
        document.getElementById(`${nome}-fill`).style.width = `${Math.max(0, Math.min(100, valore / massimo * 100))}%`;
        document.getElementById(`${nome}-value`).textContent = `${Math.ceil(Math.max(0, valore))} / ${massimo}`;
        document.getElementById(`${nome}-bar`).setAttribute('aria-valuenow', Math.ceil(Math.max(0, valore)));
        document.getElementById(`${nome}-bar`).setAttribute('aria-valuemax', massimo);
    }
    document.getElementById('coin-value').textContent = monete;
    document.getElementById('floor-value').textContent = `${testoGioco('Piano')} ${piano}`;
    const bonus = Object.keys(effetti).map(tipo => `${testoGioco(tipiOggetto[tipo].nome)} ${Math.ceil((effetti[tipo] - tempoGioco) / 1000)}s`).join(' · ');
    document.getElementById('active-buffs').textContent = bonus;
    if (tempoGioco > messaggioScadenza) document.getElementById('spunta').textContent = '';
    const vicino = interazioneVicina();
    const guida = document.getElementById('interaction-hint');
    guida.hidden = !vicino || giocoInPausa();
    if (vicino) guida.textContent = vicino.tipo === 'mercante' ? testoGioco('E · Parla con il mercante') : `${testoGioco('E · Apri il forziere')} · ${testoGioco(raritaForzieri[vicino.oggetto.rarita].nome)}`;
    const firma = `${linguaGioco}:${monete}:${inventario.length}:${finestraAttiva}`;
    if (firma !== ultimaInterfaccia) { ultimaInterfaccia = firma; renderizzaFinestra(); }
    disegnaMinimappa();
}
function disegnaMinimappa() {
    const mini = document.getElementById('minimap'); const contesto = mini.getContext('2d');
    contesto.clearRect(0, 0, mini.width, mini.height);
    contesto.drawImage(src_blocci_img.mappa1.stand[0], 0, 0, 3000, 1800, 0, 0, mini.width, mini.height);
    const punto = (x, y, colore, raggio) => {
        contesto.fillStyle = colore; contesto.beginPath();
        contesto.arc(x / 3000 * mini.width, y / 1800 * mini.height, raggio, 0, Math.PI * 2); contesto.fill();
    };
    for (const mercante of mercanti) punto(mercante.x, mercante.y, '#73e3ac', 2.5);
    for (const forziere of forzieri.filter(f => !f.aperto)) punto(forziere.x, forziere.y, '#ffd077', 2);
    for (const nemico of nemici) punto(nemico.nemico.x, nemico.nemico.y, '#ed716a', 2);
    if (portaleFinale) punto(portaleFinale.x, portaleFinale.y, '#68baff', 3);
    punto(player.x + 25, player.y + 25, '#fff', 3.5);
}
function disegnaGuida() {
    if (!obiettivoGuida) return;
    const dx = obiettivoGuida.x - player.x, dy = obiettivoGuida.y - player.y;
    if (Math.hypot(dx, dy) < 80 && !portaleFinale) {
        obiettivoGuida = dentroArea(player, areaTesoro) ? { x: 1740, y: 350 } : null;
        return;
    }
    const angolo = Math.atan2(dy, dx);
    const x = Math.max(28, Math.min(772, player.x - telecamera.x + 25 + Math.cos(angolo) * 90));
    const y = Math.max(120, Math.min(450, player.y - telecamera.y + 25 + Math.sin(angolo) * 90));
    ctx.save(); ctx.translate(x, y); ctx.rotate(angolo);
    ctx.globalAlpha = 0.7 + Math.sin(tempoGioco / 200) * 0.3;
    ctx.fillStyle = '#ffd077'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-9, -9); ctx.lineTo(-5, 0); ctx.lineTo(-9, 9); ctx.closePath(); ctx.fill(); ctx.restore();
}
