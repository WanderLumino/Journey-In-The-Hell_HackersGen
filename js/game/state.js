// Il tempo della simulazione si ferma insieme alla partita, incluse le azioni ritardate.
let tempoGioco = 0;
let finestraAttiva = null;
let pronto = false;
let piano = 1;
let monete = 10;
let prossimoOggetto = 1;
let azioniProgrammate = [];
const inventario = [];
const effetti = {};
const recuperi = {};
const tipiOggetto = {
    books: { nome: 'Libro', prezzo: 10, descrizione: 'Mana massimo +25% per 30 s', colonne: 14, varianti: 168 },
    consumables: { nome: 'Caffè', prezzo: 8, descrizione: 'Velocità +25% per 30 s', colonne: 44, varianti: 44 },
    potions: { nome: 'Pozione', prezzo: 12, descrizione: 'Danno +25% per 30 s', colonne: 21, varianti: 294 },
    food: { nome: 'Cibo', prezzo: 5, descrizione: 'Salute massima +35% per 30 s', colonne: 8, varianti: 64 }
};
function giocoInPausa() { return !pronto || finestraAttiva !== null; }
function programmaAzione(azione, ritardo) {
    azioniProgrammate.push({ azione, scadenza: tempoGioco + ritardo });
}
function aggiornaTempo(delta) {
    tempoGioco += delta;
    const scadute = azioniProgrammate.filter(a => a.scadenza <= tempoGioco);
    azioniProgrammate = azioniProgrammate.filter(a => a.scadenza > tempoGioco);
    for (const evento of scadute) {
        if (player_HP <= 0) break;
        evento.azione();
    }
    for (const [tipo, scadenza] of Object.entries(effetti)) {
        if (scadenza <= tempoGioco) delete effetti[tipo];
    }
    applicaStatistiche();
}
function applicaStatistiche() {
    player_max_HP = Math.round(statisticheClasse.hp * (effetti.food ? 1.35 : 1));
    player_max_MP = Math.round(statisticheClasse.mp * (effetti.books ? 1.25 : 1));
    player_speed = statisticheClasse.velocita * (effetti.consumables ? 1.25 : 1);
    player_molt_danno = effetti.potions ? 1.25 : 1;
    player_HP = Math.min(player_HP, player_max_HP);
    player_MP = Math.min(player_MP, player_max_MP);
}
function creaOggetto(tipo) {
    return { id: prossimoOggetto++, tipo, variante: Math.floor(Math.random() * tipiOggetto[tipo].varianti) };
}
function usaOggetto(id) {
    const indice = inventario.findIndex(oggetto => oggetto.id === id);
    if (indice < 0 || !pronto || (finestraAttiva !== null && finestraAttiva !== 'zaino')) return false;
    const oggetto = inventario[indice];
    if ((recuperi[oggetto.tipo] || 0) > tempoGioco) return false;
    effetti[oggetto.tipo] = tempoGioco + 30000;
    recuperi[oggetto.tipo] = tempoGioco + 60000;
    inventario.splice(indice, 1);
    audioGioco.effetto(oggetto.tipo);
    const salutePrima = player_max_HP, manaPrima = player_max_MP;
    applicaStatistiche();
    // Il nuovo spazio della risorsa è utilizzabile subito, senza superare il massimo.
    player_HP += Math.max(0, player_max_HP - salutePrima);
    player_MP += Math.max(0, player_max_MP - manaPrima);
    renderizzaFinestra();
    return true;
}
function acquistaOggetto(indice) {
    if (finestraAttiva !== 'negozio' || !mercanteAttivo) return false;
    const offerta = mercanteAttivo.offerte[indice];
    if (!offerta || !tipiOggetto[offerta.tipo]) return false;
    const prezzo = tipiOggetto[offerta.tipo].prezzo;
    if (monete < prezzo) return false;
    monete -= prezzo;
    audioGioco.effetto('monete');
    inventario.push({ ...offerta, id: prossimoOggetto++ });
    renderizzaFinestra();
    return true;
}
