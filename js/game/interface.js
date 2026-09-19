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
    audioGioco.ferma();
    azzeraTasti();
    renderizzaFinestra();
    dialogo.showModal();
    (tipo === 'morte' ? contenutoDialogo.querySelector('button') : document.getElementById('close-dialog')).focus();
}
function chiudiFinestra() {
    if (finestraAttiva === 'morte') return;
    finestraAttiva = null;
    dialogo.close();
    azzeraTasti();
    document.getElementById('gameCanvas').focus({ preventScroll: true });
}
dialogo.addEventListener('cancel', evento => { evento.preventDefault(); chiudiFinestra(); });
document.getElementById('close-dialog').addEventListener('click', chiudiFinestra);
document.getElementById('bag-button').addEventListener('click', () => apriFinestra('zaino'));
document.getElementById('pause-button').addEventListener('click', () => apriFinestra('pausa'));
window.addEventListener('blur', () => { if (pronto && !finestraAttiva) apriFinestra('pausa'); });
document.addEventListener('visibilitychange', () => { if (document.hidden && pronto && !finestraAttiva) apriFinestra('pausa'); });
document.addEventListener('keydown', evento => {
    const tasto = evento.key.toLowerCase();
    if (/^[1-4]$/.test(tasto) && !evento.repeat && !giocoInPausa()) {
        evento.preventDefault();
        const tipo = Object.keys(tipiOggetto)[Number(tasto) - 1];
        const oggetto = inventario.find(o => o.tipo === tipo);
        if (oggetto) usaOggetto(oggetto.id);
        else avvisa('Nessun oggetto: visita il mercante o apri un forziere.');
        return;
    }
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
    if (nome.startsWith('W_')) {
        const immagine = immaginiAmbientali[nome];

        icona.getContext('2d').imageSmoothingEnabled = false;
        if (immagine) icona.getContext('2d').drawImage(immagine, 0, 0, dimensione, dimensione);
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
    const titoli = { comandi: 'Prima della discesa', zaino: 'Inventario', negozio: 'Bottega del mercante', pausa: 'Pausa', portale: 'Il prossimo piano', morte: 'Game over' };
    document.getElementById('dialog-title').textContent = testoGioco(titoli[finestraAttiva]);
    contenutoDialogo.replaceChildren();
    dialogo.classList.toggle('pause-dialog', finestraAttiva === 'pausa');
    dialogo.classList.toggle('controls-dialog', finestraAttiva === 'comandi');
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
        } else if (!oggetti.length) contenutoDialogo.append(paragrafo('L’inventario è vuoto. Apri un forziere o visita il mercante.'));
        contenutoDialogo.append(griglia, paragrafo('Bonus: 30 s. Recupero per categoria: 60 s. I timer sono fermi nei menu.'));
    } else if (finestraAttiva === 'comandi') {
        renderizzaComandi();
    } else if (finestraAttiva === 'portale') {
        contenutoDialogo.append(paragrafo('Vuoi scendere? Conserverai monete, oggetti e bonus. I nemici saranno più forti.'),
            pulsante('Entra nel prossimo piano', passaAlPianoSuccessivo), pulsante('Resta e commercia', chiudiFinestra));
    } else if (finestraAttiva === 'morte') {
        contenutoDialogo.append(paragrafo('Riprova: ogni discesa è un nuovo inizio.'), pulsante('Ricomincia', () => location.reload()));
    } else {
        contenutoDialogo.append(paragrafo('La partita e tutti i timer sono in pausa.'), pulsante('Riprendi', chiudiFinestra),
            pulsante('Inventario', () => { chiudiFinestra(); apriFinestra('zaino'); }),
            pulsante('Comandi', () => { chiudiFinestra(); apriFinestra('comandi'); }),
            pulsante(audioGioco.muto ? 'Attiva audio' : 'Disattiva audio', () => { audioGioco.alterna(); renderizzaFinestra(); }));
    }
    const collegamento = document.createElement('a'); collegamento.href = 'home.html'; collegamento.textContent = testoGioco('Torna al menu');
    if (!['negozio', 'comandi'].includes(finestraAttiva)) contenutoDialogo.append(collegamento);
    if (finestraAttiva === 'morte' && dialogo.open) contenutoDialogo.querySelector('button').focus();
}
function aggiornaInterfaccia() {
    const contenitoreDanni = document.getElementById('hud-damage');
    contenitoreDanni.replaceChildren();
    for (let i=danniHud.length-1;i>=0;i--) {
        const evento=danniHud[i], eta=tempoGioco-evento.inizio;
        if (eta>=1000) { danniHud.splice(i,1); continue; }
        const numero=document.createElement('span'); numero.textContent=`-${evento.danno}`;
        numero.style.transform=`translate(${(i%3)*46}px, ${-eta/35}px)`;
        numero.style.opacity=String(1-eta/1000); contenitoreDanni.append(numero);
    }
    document.querySelector('.hud').classList.toggle('is-hit', danniHud.some(e=>tempoGioco-e.inizio<230));
    for (const [nome, valore, massimo] of [['hp', player_HP, player_max_HP], ['mp', player_MP, player_max_MP]]) {
        document.getElementById(`${nome}-fill`).style.width = `${Math.max(0, Math.min(100, valore / massimo * 100))}%`;
        document.getElementById(`${nome}-value`).textContent = `${Math.ceil(Math.max(0, valore))} / ${massimo}`;
        document.getElementById(`${nome}-bar`).setAttribute('aria-valuenow', Math.ceil(Math.max(0, valore)));
        document.getElementById(`${nome}-bar`).setAttribute('aria-valuemax', massimo);
    }
    document.getElementById('coin-value').textContent = monete;
    document.getElementById('floor-value').textContent = `${testoGioco('Piano')} ${piano}`;
    aggiornaOggettiRapidi();
    aggiornaTutorial();
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

let firmaOggetti = '';
function iconaComando(tasto) {
    // Prima variante del foglio: celle da 16 px, otto colonne.
    const celle = { W: [6,4], A: [0,2], S: [2,4], D: [3,2], Q: [0,4], E: [4,2], B: [1,2] };
    if (!celle[tasto] && tasto !== 'mouse') {
        const kbd = document.createElement('kbd'); kbd.textContent = tasto; return kbd;
    }
    const icona = document.createElement('canvas'); icona.width = icona.height = 40;
    icona.setAttribute('role', 'img');
    icona.setAttribute('aria-label', tasto === 'mouse' ? testoApp('Clic sinistro', 'Left click') : tasto);
    const c = icona.getContext('2d'); c.imageSmoothingEnabled = false;
    if (tasto === 'mouse') c.drawImage(immaginiAmbientali.mouseSinistro, 0, 0, 40, 40);
    else { const [x,y] = celle[tasto]; c.drawImage(immaginiAmbientali.tastiera, x*16, y*16, 16, 16, 0, 0, 40, 40); }
    return icona;
}
function renderizzaComandi() {
    contenutoDialogo.append(paragrafo('Prenditi un momento: la partita resta ferma finché chiudi questa finestra.'));
    const griglia = document.createElement('div'); griglia.className = 'controls-grid';
    const voci = [
        [['W','A','S','D'], 'Movimento', 'Movement'],
        [['Shift'], 'Tieni premuto mentre ti muovi per correre', 'Hold while moving to run'],
        [['mouse'], 'Mira con il mouse e attacca con il clic sinistro', 'Aim with the mouse and attack with left click'],
        [['Q'], 'Abilità speciale della classe', 'Class special ability'],
        [['E'], 'Parla al mercante o apri un forziere vicino', 'Talk to a merchant or open a nearby chest'],
        [['B'], 'Apri o chiudi l’inventario', 'Open or close inventory'],
        [['1'], 'Libro: mana massimo +25%', 'Book: maximum mana +25%'],
        [['2'], 'Caffè: velocità +25%', 'Coffee: speed +25%'],
        [['3'], 'Pozione: danno +25%', 'Potion: damage +25%'],
        [['4'], 'Cibo: salute massima +35%', 'Food: maximum health +35%'],
        [['ESC'], 'Pausa o chiudi la finestra', 'Pause or close the window']
    ];
    for (const [tasti,it,en] of voci) {
        const riga = document.createElement('div'); riga.className = 'control-card';
        const icone = document.createElement('div'); icone.className = 'control-keys';
        tasti.forEach(tasto => icone.append(iconaComando(tasto)));
        const testo = document.createElement('span'); testo.textContent = testoApp(it,en);
        riga.append(icone,testo); griglia.append(riga);
    }
    contenutoDialogo.append(griglia);
    const costo = document.createElement('p');
    costo.textContent = `${testoApp('Costo attacco', 'Attack cost')}: ${statisticheClasse.attacchi[0].consumo} MP · Q: ${statisticheClasse.attacchi[1].consumo} MP. ${testoApp('Il mana recupera più velocemente fuori combattimento.', 'Mana recovers faster out of combat.')}`;
    contenutoDialogo.append(costo, pulsante('Ho capito, giochiamo', chiudiFinestra));
}
function aggiornaOggettiRapidi() {
    const firma = JSON.stringify([linguaGioco, inventario, effetti, recuperi, Math.floor(tempoGioco / 1000)]);
    if (firma === firmaOggetti) return;
    firmaOggetti = firma;
    const barra = document.getElementById('quick-items'), bonus = document.getElementById('active-buffs');
    barra.replaceChildren(); bonus.replaceChildren();
    const iconeEffetti = { books: 11, consumables: 7, potions: 0, food: 16 };
    Object.entries(tipiOggetto).forEach(([tipo, dati], indice) => {
        const oggetti = inventario.filter(o => o.tipo === tipo);
        const residuo = Math.max(0, Math.ceil(((recuperi[tipo] || 0) - tempoGioco) / 1000));
        const tasto = pulsante('', () => { if (!giocoInPausa() && oggetti[0]) usaOggetto(oggetti[0].id); });
        tasto.title = `${indice + 1} · ${testoGioco(dati.nome)} · ${testoGioco(dati.descrizione)}`;
        tasto.setAttribute('aria-label', tasto.title);
        tasto.disabled = !oggetti.length || residuo > 0;
        tasto.append(document.createTextNode(String(indice + 1)), iconaOggetto(tipo, oggetti[0]?.variante || 0, 26), document.createTextNode(residuo ? `${residuo}s` : `×${oggetti.length}`));
        barra.append(tasto);
        if (effetti[tipo]) {
            const indicatore = document.createElement('span'); indicatore.className = 'buff-badge';
            const icona = document.createElement('canvas'); icona.width = icona.height = 24;
            const contesto = icona.getContext('2d'), cella = iconeEffetti[tipo];
            contesto.imageSmoothingEnabled = false;
            if (immaginiAmbientali.effetti) contesto.drawImage(immaginiAmbientali.effetti, cella % 5 * 32, Math.floor(cella / 5) * 32, 32, 32, 0, 0, 24, 24);
            const descrizione = testoGioco(dati.descrizione).replace(/ (per|for) 30 s$/, '');
            indicatore.append(icona, document.createTextNode(`${descrizione} · ${Math.ceil((effetti[tipo] - tempoGioco) / 1000)}s`));
            bonus.append(indicatore);
        }
    });
}
function aggiornaTutorial() {
    let testo;
    if (finestraAttiva) testo = '';
    else if (statoStanza === 'preavviso') testo = 'Nemici in arrivo! Allontanati dai cerchi luminosi.';
    else if (portaleFinale) testo = 'Il portale apre il prossimo piano. Puoi prima commerciare con E.';
    else if (nemici.length) testo = 'Muoviti mentre attacchi. Q: abilità · Shift: corri · 1–4: bonus.';
    else if (inventario.length) testo = '1 libro · 2 caffè · 3 pozione · 4 cibo. B: dettagli e recuperi.';
    else if (nelRifugio(player)) testo = 'WASD: muoviti · Shift: corri. Avvicinati al mercante e premi E.';
    else testo = 'Segui la freccia dorata. E apre i forzieri; il bottino entra nell’inventario.';
    document.getElementById('tutorial-hint').textContent = testoGioco(testo);
}
