// Valori di base del primo piano. Danni e costi sono per singolo attacco.
const bilanciamentoClassi = {
    warrior: { hp: 140, mp: 80, velocita: 3.8, cura: 4, mana: 10, attacchi: [
        { danno: 28, consumo: 0, recupero: 400, delay: 0 },
        { danno: 60, consumo: 35, recupero: 1400, delay: 120 }
    ] },
    mage: { hp: 90, mp: 140, velocita: 4, cura: 3, mana: 12, attacchi: [
        { danno: 24, consumo: 15, recupero: 350, delay: 100 },
        { danno: 64, consumo: 40, recupero: 1200, delay: 180 }
    ] },
    assassin: { hp: 100, mp: 100, velocita: 4.6, cura: 3, mana: 10, attacchi: [
        { danno: 18, consumo: 0, recupero: 230, delay: 0 },
        { danno: 42, consumo: 30, recupero: 1000, delay: 80 }
    ] },
    healer: { hp: 120, mp: 120, velocita: 4, cura: 5, mana: 11, attacchi: [
        { danno: 22, consumo: 15, recupero: 420, delay: 120 },
        { danno: 50, consumo: 35, recupero: 1300, delay: 220 }
    ] }
};
const statisticheClasse = bilanciamentoClassi[sessione.classe];
const bilanciamentoNemici = {
    normale: { hp: 90, contatto: 10, intervallo: 210, moltiplicatore: 1 },
    boss: { hp: 480, contatto: 16, intervallo: 120, moltiplicatore: 1.25 }
};
let ultimoScambio = -Infinity;
let prossimaRigenerazione = 1000;
let invulnerabileFino = 0;
const recuperoAttacchi = {};
const numeriDanno = [];
const danniHud = [];
function inCombattimento() {
    return tempoGioco - ultimoScambio < 5000 || nemici.some(n => n.HP > 0 && Math.hypot(n.nemico.x-player.x,n.nemico.y-player.y) < n.vista + 60);
}
function rigeneraRisorse() {
    if (player_HP <= 0 || tempoGioco < prossimaRigenerazione) return;
    prossimaRigenerazione = tempoGioco + 1000;
    const combattimento = inCombattimento();
    const cura = statisticheClasse.cura * (combattimento ? 0.5 : 1);
    player_HP = Math.min(player_max_HP, player_HP + cura);
    // Mana dimezzato rispetto alla taratura precedente; fuori combattimento recupera il 50% in più.
    const mana = statisticheClasse.mana * 0.5 * (combattimento ? 1 : 1.5);
    player_MP = Math.min(player_max_MP, player_MP + mana);
}
function danneggiaNemico(nemico, danno) {
    if (nemico.HP <= 0 || giocoInPausa()) return 0;
    const effettivo = Math.min(nemico.HP, Math.max(0, Math.round(danno)));
    if (!effettivo) return 0;
    nemico.HP -= effettivo;
    ultimoScambio = tempoGioco;
    nemico.colpitoFino = tempoGioco + 140;
    numeriDanno.push({ x: nemico.nemico.x + nemico.nemico.lx/2, y: nemico.nemico.y, danno: effettivo, inizio: tempoGioco });
    audioGioco.effetto('colpo');
    return effettivo;
}
function danneggiaGiocatore(danno) {
    if (player_HP <= 0 || giocoInPausa() || tempoGioco < invulnerabileFino) return 0;
    const effettivo = Math.min(player_HP, Math.max(0, Math.round(danno)));
    if (!effettivo) return 0;
    player_HP -= effettivo;
    ultimoScambio = tempoGioco;
    invulnerabileFino = tempoGioco + 650;
    danniHud.push({ danno: effettivo, inizio: tempoGioco });
    audioGioco.effetto('ferita');
    if (player_HP <= 0) { player_HP = 0; apriFinestra('morte'); }
    return effettivo;
}
// Portata del centro dei proiettili, indipendente dalla distanza del mouse.
const portateAttacco = { mage: 210, assassin: 70 };
const raggioGuaritore = 300;
function miraGuaritore(x, y) {
    const centroX = player.x + player.lx/2, centroY = player.y + player.ly/2;
    const dx = (x ?? centroX) - centroX, dy = (y ?? centroY) - centroY;
    const fattore = Math.min(1, raggioGuaritore / (Math.hypot(dx, dy) || 1));
    return { x: centroX + dx * fattore, y: centroY + dy * fattore };
}
function fineMiraClasse(x, y, classe = sessione.classe) {
    const origineX = player.x + player.lx/2, origineY = player.y + player.ly/2;
    const portata = portateAttacco[classe];
    if (!portata) return { x, y };
    const angolo = Math.atan2((y ?? origineY) - origineY, (x ?? origineX+1) - origineX);
    return { x: origineX + Math.cos(angolo)*portata, y: origineY + Math.sin(angolo)*portata };
}
function fineMiraMago(x, y) { return fineMiraClasse(x, y, 'mage'); }
function preparaPortata(proiettile, x, y, velocita) {
    const portata = portateAttacco[sessione.classe];
    if (!portata) return;
    const direzione = fineMiraClasse(x, y);
    const angolo = Math.atan2(direzione.y - player.y - player.ly/2, direzione.x - player.x - player.lx/2);
    proiettile.magia.vx = Math.cos(angolo) * velocita;
    proiettile.magia.vy = Math.sin(angolo) * velocita;
    proiettile.portataResidua = portata;
    proiettile.tempo = Math.ceil(portata / velocita) + 1;
}
function avanzaMagia(m) {
    if (m.portataResidua !== undefined && m.magia.nome_animazione !== 'impact') {
        const passo = Math.hypot(m.magia.vx, m.magia.vy);
        if (passo > m.portataResidua) {
            m.magia.vx *= m.portataResidua / passo;
            m.magia.vy *= m.portataResidua / passo;
        }
        m.portataResidua = Math.max(0, m.portataResidua - passo);
    }
    m.magia.aggiorna();
    if (m.portataResidua === 0) m.da_rimuovere = true;
}
function disegnaNumeriDanno() {
    ctx.save(); ctx.font = 'bold 18px Georgia'; ctx.textAlign = 'center'; ctx.lineWidth = 3;
    for (let i=numeriDanno.length-1;i>=0;i--) {
        const numero=numeriDanno[i], eta=tempoGioco-numero.inizio;
        if (eta>=850) { numeriDanno.splice(i,1); continue; }
        ctx.globalAlpha=1-eta/850; ctx.strokeStyle='#19110c'; ctx.fillStyle='#ffe3a3';
        const y=numero.y-telecamera.y-10-eta/28;
        ctx.strokeText(`-${numero.danno}`,numero.x-telecamera.x,y);
        ctx.fillText(`-${numero.danno}`,numero.x-telecamera.x,y);
    }
    ctx.restore();
}
