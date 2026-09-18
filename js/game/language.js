// L'italiano è la lingua predefinita; la scelta resta salvata nel browser.
const traduzioniGioco = {
    'Zaino': 'Backpack', 'Piano': 'Floor', 'Pausa': 'Paused', 'Riprendi': 'Resume',
    'Tu · Mercanti · Tesori': 'You · Merchants · Treasure',
    'WASD: movimento · Click: attacco · Q: abilità · E: interagisci · B: zaino · ESC: pausa': 'WASD: move · Click: attack · Q: ability · E: interact · B: backpack · ESC: pause',
    'Libro': 'Book', 'Caffè': 'Coffee', 'Pozione': 'Potion', 'Cibo': 'Food',
    'Mana massimo +25% per 30 s': 'Maximum mana +25% for 30 s',
    'Velocità +25% per 30 s': 'Speed +25% for 30 s', 'Danno +25% per 30 s': 'Damage +25% for 30 s',
    'Salute massima +35% per 30 s': 'Maximum health +35% for 30 s',
    'Monete': 'Coins', 'Oggetti': 'Items', 'Usa': 'Use', 'Acquista': 'Buy', 'Recupero': 'Cooldown',
    'Monete insufficienti': 'Not enough coins', 'Arma in esposizione': 'Display weapon', 'Non disponibile': 'Unavailable',
    'Bottega del mercante': 'Merchant shop', 'Mercante': 'Merchant', 'Il prossimo piano': 'The next floor',
    'E · Parla con il mercante': 'E · Talk to the merchant', 'E · Apri il forziere': 'E · Open the chest',
    'La discesa termina qui': 'Your descent ends here', 'Riprova: ogni discesa è un nuovo inizio.': 'Try again: every descent is a new beginning.',
    'Lo zaino è vuoto. Apri un forziere o visita il mercante.': 'Your backpack is empty. Open a chest or visit the merchant.',
    'Bonus: 30 s. Recupero per categoria: 60 s. I timer sono fermi nei menu.': 'Buffs: 30 s. Cooldown per category: 60 s. Timers stop in menus.',
    'Vuoi scendere? Conserverai monete, oggetti e bonus. I nemici saranno più forti.': 'Descend? You keep your coins, items and buffs. Enemies will be stronger.',
    'Entra nel prossimo piano': 'Enter the next floor', 'Resta e commercia': 'Stay and trade',
    'La partita e tutti i timer sono in pausa.': 'The game and all timers are paused.',
    'Boss sconfitto! Mercante e portale disponibili': 'Boss defeated! Merchant and portal available',
    'Nuovo piano: la discesa continua': 'New floor: the descent continues', 'Bottino raccolto': 'Loot collected',
    'Comune': 'Common', 'Raro': 'Rare', 'Epico': 'Epic', 'Leggendario': 'Legendary',
    'Classe': 'Class', 'Ricomincia': 'Restart', 'Torna al menu': 'Back to menu',
    'Guerriero': 'Warrior', 'Mago': 'Mage', 'Assassino': 'Assassin', 'Guaritore': 'Healer',
    'Spada': 'Sword', 'Bastone arcano': 'Arcane staff', 'Lama da lancio': 'Throwing blade', 'Bastone della luce': 'Staff of light',
    'WASD: movimento · Shift: corsa · Mouse: mira · Click: attacco · Q: abilità · E: apri forziere': 'WASD: move · Shift: run · Mouse: aim · Click: attack · Q: ability · E: open chest',
    'Mercante · presto disponibile': 'Merchant · coming soon', 'E · Apri': 'E · Open',
    'Stanza completata! E: apri il forziere': 'Room cleared! E: open the chest',
    'Forziere aperto: +30 salute, +40 mana': 'Chest opened: +30 health, +40 mana',
    'Caricamento della selva oscura…': 'Loading the dark forest…',
    'Mana insufficiente': 'Not enough mana', 'Abilità già in corso': 'Ability already in progress'
};
let linguaGioco = 'it';
try { if (localStorage.getItem('lingua') === 'en') linguaGioco = 'en'; } catch {}
function testoGioco(testo) { return linguaGioco === 'en' ? (traduzioniGioco[testo] || testo) : testo; }
function aggiornaLinguaGioco() {
    document.documentElement.lang = linguaGioco;
    document.querySelectorAll('[data-testo]').forEach(elemento => {
        elemento.textContent = testoGioco(elemento.dataset.testo);
    });
    document.getElementById('chosen-class').textContent = `${testoGioco(sessione.nomeClasse)} · ${testoGioco(sessione.arma.nome)}`;
    document.getElementById('spunta').textContent = '';
    if (typeof renderizzaFinestra === 'function' && typeof pronto !== 'undefined' && pronto) renderizzaFinestra();
}
document.getElementById('language').value = linguaGioco;
document.getElementById('language').addEventListener('change', evento => {
    linguaGioco = evento.target.value;
    try { localStorage.setItem('lingua', linguaGioco); } catch {}
    aggiornaLinguaGioco();
});
