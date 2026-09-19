// Tutti i ritagli degli oggetti usano celle da 16 pixel; il mercante usa celle da 64.
const percorsiAmbientali = {
    tastiera: '../assets/img/items/Keyboard_Letters_Symbols.png',
    mouseSinistro: '../assets/img/items/left_mouse.png',
    mercante: '../assets/img/Basic_Character/NPC/NPC_mercante_000/mercante_sprite.png',
    chests: '../assets/img/items/chests.png', books: '../assets/img/items/books.png',
    consumables: '../assets/img/items/consumables.png', potions: '../assets/img/items/potions.png',
    food: '../assets/img/items/food.png', rpg_icons: '../assets/img/items/rpg_icons.png',
    effetti: '../assets/img/effects_icons/effects._icons.png'
};
const immaginiAmbientali = {};
const ambientazioneReady = Promise.all(Object.entries(percorsiAmbientali).map(async ([nome, percorso]) => {
    immaginiAmbientali[nome] = await loadImage(percorso);
}));
const raritaForzieri = [
    { nome: 'Comune', colore: '#c9c5b9' }, { nome: 'Raro', colore: '#65b7f7' },
    { nome: 'Epico', colore: '#c787fa' }, { nome: 'Leggendario', colore: '#ffc65a' }
];
const mercanti = [];
const forzieri = [];
const moneteATerra = [];
const bottiniATerra = [];
const stanzePremiate = new Set();
let mercanteAttivo = null;
let portaleFinale = null;
let portaleIgnorato = false;
let obiettivoGuida = { x: 210, y: 560 };
const areaTesoro = { x: 1440, y: 1440, w: 288, h: 288 };
const areaBoss = { x: 2140, y: 480, w: 650, h: 700 };
function dentroArea(oggetto, area) {
    return oggetto.x >= area.x && oggetto.x < area.x + area.w && oggetto.y >= area.y && oggetto.y < area.y + area.h;
}
function posizioneLibera(x, y, larghezza = 44, altezza = 44) {
    const prova = new blocco('traspa', x, y, larghezza, altezza);
    return !blocci_con_collisioni.some(blocco => prova.if_collide(blocco));
}
function cercaPosizione(x, y, area, esclusioni = [], dimensione = 44) {
    // Ricerca locale: nessun premio può finire dentro un muro o su un altro oggetto.
    for (let raggio = 0; raggio <= 600; raggio += 24) {
        for (let angolo = 0; angolo < Math.PI * 2; angolo += Math.PI / 8) {
            const candidato = { x: x + Math.cos(angolo) * raggio, y: y + Math.sin(angolo) * raggio };
            if (area && (!dentroArea(candidato, area) || !dentroArea({ x: candidato.x + dimensione, y: candidato.y + dimensione }, area))) continue;
            if (esclusioni.some(p => Math.hypot(p.x - candidato.x, p.y - candidato.y) < 96)) continue;
            if (posizioneLibera(candidato.x, candidato.y, dimensione, dimensione)) return candidato;
        }
    }
    return null;
}
function creaMercante(x, y) {
    const mercante = { x, y, offerte: Object.keys(tipiOggetto).map(creaOggetto), arma: armiRpg[Math.floor(Math.random() * armiRpg.length)] };
    mercanti.push(mercante);
    loadImage('../assets/img/RPG_weapons/' + mercante.arma).then(immagine => { immaginiAmbientali[mercante.arma] = immagine; if (mercanteAttivo === mercante && finestraAttiva === 'negozio') renderizzaFinestra(); }).catch(() => {});
    return mercante;
}
function creaForziere(x, y, stanza = null) {
    const variante = Math.floor(Math.random() * 48);
    const forziere = { x, y, stanza, variante, rarita: Math.floor(variante / 12), aperto: false };
    forzieri.push(forziere);
    return forziere;
}
function preparaAmbiente() {
    creaMercante(290, 210);
    for (const [x, y] of [[1560, 1560]]) {
        const punto = cercaPosizione(x, y, areaTesoro, forzieri);
        if (punto) creaForziere(punto.x, punto.y, 'tesoro');
    }
}
function premiaStanza(numero) {
    if (numero < 1 || numero === 3 || stanzePremiate.has(numero)) return;
    stanzePremiate.add(numero);
    const punto = cercaPosizione(player.x, player.y, null, forzieri.filter(f => !f.aperto));
    if (punto) creaForziere(punto.x, punto.y, numero);
    avvisa('Stanza completata! E: apri il forziere');
    const destinazioni = { 1: { x: 970, y: 960 }, 2: { x: 1580, y: 1330 }, 4: { x: 1970, y: 850 } };
    obiettivoGuida = destinazioni[numero] || null;
    if (numero === 5) completaPiano();
}
function apriForziere(forziere = forzieri.find(f => !f.aperto && distanzaInterazione(f) < 88)) {
    if (giocoInPausa() || !forziere || forziere.aperto || distanzaInterazione(forziere) >= 88) return false;
    forziere.aperto = true;
    audioGioco.effetto('porta');
    const categorie = Object.keys(tipiOggetto);
    for (let i = categorie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categorie[i], categorie[j]] = [categorie[j], categorie[i]];
    }
    const bottino = categorie.slice(0, Math.random() < 0.5 ? 1 : 2).map(creaOggetto);
    inventario.push(...bottino);
    bottino.forEach((oggetto, i) => bottiniATerra.push({ ...oggetto, x: forziere.x + (i ? 42 : -26), y: forziere.y + 28, inizio: tempoGioco, durata: 1500 + Math.random() * 1000 }));
    avvisa(`${testoGioco('Bottino raccolto')}: ${bottino.length} · B ${testoGioco('Inventario')}`);
    return bottino;
}
function ricompensaNemico(nemico) {
    if (nemico.premiato) return;
    nemico.premiato = true;
    audioGioco.effetto('morteNemico');
    moneteATerra.push({ x: nemico.nemico.x + nemico.nemico.lx / 2, y: nemico.nemico.y + nemico.nemico.ly / 2, valore: nemico.boss ? 10 : 4 });
}
function completaPiano() {
    if (portaleFinale) return;
    const esclusioni = [player, ...forzieri, ...mercanti];
    const puntoMercante = cercaPosizione(2360, 760, areaBoss, esclusioni, 50);
    if (puntoMercante) esclusioni.push(creaMercante(puntoMercante.x, puntoMercante.y));
    const puntoPortale = cercaPosizione(2650, 1000, areaBoss, esclusioni, 64);
    if (!puntoPortale) throw new Error('Nessuna posizione libera per il portale');
    portaleFinale = new blocco('portale_blu', puntoPortale.x, puntoPortale.y, 64, 64);
    obiettivoGuida = puntoPortale;
    avvisa('Boss sconfitto! Mercante e portale disponibili');
}
function distanzaInterazione(oggetto) { return Math.hypot(oggetto.x - player.x, oggetto.y - player.y); }
function interazioneVicina() {
    const candidati = [
        ...mercanti.map(oggetto => ({ tipo: 'mercante', oggetto })),
        ...forzieri.filter(f => !f.aperto).map(oggetto => ({ tipo: 'forziere', oggetto }))
    ].filter(voce => distanzaInterazione(voce.oggetto) < 88);
    candidati.sort((a, b) => distanzaInterazione(a.oggetto) - distanzaInterazione(b.oggetto));
    return candidati[0];
}
function interagisci() {
    if (giocoInPausa()) return;
    const vicino = interazioneVicina();
    if (!vicino) return;
    if (vicino.tipo === 'mercante') {
        mercanteAttivo = vicino.oggetto;
        apriFinestra('negozio');
    } else apriForziere(vicino.oggetto);
}
function aggiornaAmbiente() {
    for (let i = bottiniATerra.length - 1; i >= 0; i--) if (tempoGioco - bottiniATerra[i].inizio >= bottiniATerra[i].durata) bottiniATerra.splice(i, 1);
    for (let i = moneteATerra.length - 1; i >= 0; i--) {
        if (Math.hypot(moneteATerra[i].x - (player.x + 25), moneteATerra[i].y - (player.y + 25)) < 65) {
            monete += moneteATerra[i].valore;
            audioGioco.effetto('monete');
            moneteATerra.splice(i, 1);
        }
    }
    if (!portaleFinale) return;
    portaleFinale.aggiorna();
    const contatto = player.if_collide(portaleFinale);
    if (!contatto) portaleIgnorato = false;
    if (contatto && !portaleIgnorato) {
        portaleIgnorato = true;
        apriFinestra('portale');
    }
}
function disegnaCella(contesto, nome, variante, x, y, dimensione = 40) {
    const immagine = immaginiAmbientali[nome];
    if (!immagine) return;
    const colonne = immagine.naturalWidth / 16;
    contesto.imageSmoothingEnabled = false;
    contesto.drawImage(immagine, (variante % colonne) * 16, Math.floor(variante / colonne) * 16, 16, 16, x, y, dimensione, dimensione);
}
function disegnaAmbientazione() {
    ctx.save();
    ctx.font = '12px Georgia'; ctx.textAlign = 'center';
    for (const mercante of mercanti) {
        const x = mercante.x - telecamera.x, y = mercante.y - telecamera.y;
        const fotogramma = Math.floor(tempoGioco / 150) % 6;
        ctx.drawImage(immaginiAmbientali.mercante, fotogramma * 64, 5 * 64, 64, 64, x, y, 50, 50);
        ctx.fillStyle = '#ffe1a0'; ctx.fillText(testoGioco('Mercante'), x + 25, y - 8);
    }
    for (const forziere of forzieri) {
        const x = forziere.x - telecamera.x, y = forziere.y - telecamera.y;
        ctx.globalAlpha = forziere.aperto ? 0.4 : 1;
        disegnaCella(ctx, 'chests', forziere.variante, x, y);
        ctx.fillStyle = raritaForzieri[forziere.rarita].colore;
        ctx.fillRect(x + 5, y + 41, 30, 2);
        if (forziere.aperto) ctx.fillText('✓', x + 20, y + 25);
        ctx.globalAlpha = 1;
    }
    for (const moneta of moneteATerra) {
        disegnaCella(ctx, 'rpg_icons', 1, moneta.x - telecamera.x - 12, moneta.y - telecamera.y - 12, 24);
    }
    for (const oggetto of bottiniATerra) {
        const eta = tempoGioco - oggetto.inizio;
        ctx.globalAlpha = Math.min(1, (oggetto.durata - eta) / 400);
        const salto = Math.sin(Math.min(1, eta / 450) * Math.PI) * 22;
        disegnaCella(ctx, oggetto.tipo, oggetto.variante, oggetto.x - telecamera.x, oggetto.y - telecamera.y - salto, 32);
    }
    ctx.globalAlpha = 1;
    disegnaEvocazioni();
    if (portaleFinale) portaleFinale.disegna();
    ctx.restore();
}
function passaAlPianoSuccessivo() {
    if (finestraAttiva !== 'portale') return;
    piano++;
    ultimoScambio = -Infinity;
    prossimaRigenerazione = tempoGioco + 1000;
    invulnerabileFino = 0;
    numeriDanno.length = 0; danniHud.length = 0;
    for (const attacco in recuperoAttacchi) delete recuperoAttacchi[attacco];
    azioniProgrammate = [];
    in_magia = false;
    magie = []; magie_nemiche = []; disegno_magie.length = 0; nemici = [];
    moneteATerra.length = 0; mercanti.length = 0; forzieri.length = 0; stanzePremiate.clear();
    portaleFinale = null; portaleIgnorato = false; mercanteAttivo = null;
    blocci_bac_grand.splice(1);
    for (let i = blocci_con_collisioni.length - 1; i >= 0; i--) {
        if (['porta_C', 'muro_separatore'].includes(blocci_con_collisioni[i].nome)) blocci_con_collisioni.splice(i, 1);
    }
    blocci_con_collisioni.unshift(...creaBarriere());
    griglia_collisioni.clear(); costruisci_griglia();
    fase = 0; statoStanza = 'attesa'; puntiEvocazione = []; bottiniATerra.length = 0;
    player.x = 200; player.y = 200; player.vx = 0; player.vy = 0;
    player.set_nome_animazione('indietro_stand');
    telecamera.x = 0; telecamera.y = 0;
    preparaAmbiente();
    obiettivoGuida = { x: 210, y: 560 };
    chiudiFinestra();
    avvisa('Nuovo piano: la discesa continua');
}
