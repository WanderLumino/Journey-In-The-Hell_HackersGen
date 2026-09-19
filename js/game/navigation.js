// Le stanze delimitano evocazione e inseguimento; il rifugio resta sempre sicuro.
const areeCombattimento = {
    1: { x: 0, y: 768, w: 960, h: 480 },
    2: { x: 1392, y: 480, w: 480, h: 768 },
    4: { x: 1440, y: 0, w: 576, h: 288 },
    5: areaBoss
};
function preparaEvocazioni() {
    const area = areeCombattimento[fase], quantita = { 1: 2, 2: 3, 4: 5, 5: 1 }[fase];
    const punti = [];
    for (let i = 0; i < quantita; i++) {
        const punto = cercaPosizione(area.x + area.w * (0.3 + (i % 3) * 0.2), area.y + area.h * (0.35 + Math.floor(i / 3) * 0.25), area, [player, ...punti], 40);
        if (punto) punti.push(punto);
    }
    return punti;
}
function disegnaEvocazioni() {
    if (statoStanza !== 'preavviso') return;
    ctx.save(); ctx.strokeStyle = '#ffb56a'; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55 + Math.sin(tempoGioco / 90) * 0.25;
    for (const punto of puntiEvocazione) {
        ctx.beginPath(); ctx.ellipse(punto.x + 20 - telecamera.x, punto.y + 12 - telecamera.y, 24, 13, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
}
function passaggioLibero(a, b) {
    const passi = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 12));
    for (let i = 0; i <= passi; i++) {
        if (!posizioneLibera(a.x + (b.x - a.x) * i / passi, a.y + (b.y - a.y) * i / passi, 40, 24)) return false;
    }
    return true;
}
function cercaPercorso(inizio, fine, area) {
    // Ricerca in ampiezza su celle di 24 px, con margine per il corpo del nemico.
    const passo = 24, chiave = p => `${p.x},${p.y}`;
    const vicino = { x: Math.round(inizio.x / passo) * passo, y: Math.round(inizio.y / passo) * passo };
    const partenze = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const punto = { x: vicino.x + dx * passo, y: vicino.y + dy * passo };
        if (dentroArea(punto, area) && passaggioLibero(inizio, punto)) partenze.push(punto);
    }
    partenze.sort((a, b) => Math.hypot(a.x - inizio.x, a.y - inizio.y) - Math.hypot(b.x - inizio.x, b.y - inizio.y));
    const primo = partenze[0];
    if (!primo) return [];
    const coda = [primo], precedenti = new Map([[chiave(primo), null]]);
    let migliore = primo, distanza = Infinity;
    for (let indice = 0; indice < coda.length && indice < 1800; indice++) {
        const punto = coda[indice], d = Math.hypot(punto.x - fine.x, punto.y - fine.y);
        if (d < distanza) { migliore = punto; distanza = d; }
        if (d < passo) break;
        for (const [dx, dy] of [[passo, 0], [-passo, 0], [0, passo], [0, -passo]]) {
            const prossimo = { x: punto.x + dx, y: punto.y + dy }, id = chiave(prossimo);
            if (precedenti.has(id) || !dentroArea(prossimo, area) || !dentroArea({ x: prossimo.x + 40, y: prossimo.y + 24 }, area) || !posizioneLibera(prossimo.x, prossimo.y, 40, 24)) continue;
            precedenti.set(id, punto); coda.push(prossimo);
        }
    }
    const percorso = [];
    for (let punto = migliore; punto; punto = precedenti.get(chiave(punto))) percorso.unshift(punto);
    return percorso;
}
function aggiornaNavigazioneNemico(e) {
    const corpo = e.nemico, area = e.area || areeCombattimento[fase];
    corpo.vx = 0; corpo.vy = 0;
    if (!area || !dentroArea(player, area) || e.HP <= 0) return;
    const origine = { x: corpo.x + corpo.d_sin, y: corpo.y + corpo.d_sop };
    const bersaglio = { x: player.x, y: player.y + 16 };
    const distanza = Math.hypot(bersaglio.x - origine.x, bersaglio.y - origine.y);
    const visibile = passaggioLibero(origine, bersaglio);
    if (visibile && distanza < e.vista && e.magie && e.delay < 0) { e.delay = e.max_delay; nemico_lancia_magia(e); }
    if (visibile && distanza < (e.magie ? 160 : 20)) return;
    let meta = bersaglio;
    if (!visibile) {
        if (!e.percorso || tempoGioco >= e.ricalcolo) {
            e.percorso = cercaPercorso(origine, bersaglio, area); e.ricalcolo = tempoGioco + 650;
        }
        while (e.percorso.length && Math.hypot(e.percorso[0].x - origine.x, e.percorso[0].y - origine.y) < 5) e.percorso.shift();
        meta = e.percorso[0];
        if (!meta) return;
    }
    const dx = meta.x - origine.x, dy = meta.y - origine.y, d = Math.hypot(dx, dy);
    if (d < 1) return;
    const velocita = Math.min(e.corsa, d);
    corpo.vx = dx / d * velocita; corpo.vy = dy / d * velocita;
    corpo.nome_animazione = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'des' : 'sin') : (dy > 0 ? 'stand' : 'alto');
}
