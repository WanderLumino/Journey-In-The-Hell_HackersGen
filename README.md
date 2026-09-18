# Inferno Quest — Journey in the Hell

Gioco di esplorazione e combattimento ispirato alla Divina Commedia, realizzato con HTML, CSS, JavaScript e Canvas.

## Struttura

- html/: pagine del sito e gioco.
- css/: fogli di stile.
- js/pages/: interazioni delle pagine.
- js/game/entities.js: animazioni, immagini, entità e collisioni.
- js/game/main.js: combattimento, stanze, comandi e ciclo di gioco.
- js/game/session.js: classe e arma esclusiva.
- js/game/rewards.js: mercanti, forzieri, monete, portale e passaggio di piano.
- js/game/state.js: inventario, prezzi, bonus, recuperi e orologio della simulazione.
- js/game/interface.js: HUD, minimappa, zaino, negozio, pausa e guida.
- js/game/language.js: testi di gioco in italiano e inglese.
- assets/img/: immagini e pacchetti originali.
- data/maps/: dati delle collisioni.
- docs/story/: storia e personaggi.
- archive/mappa_base/: prototipo precedente conservato come riferimento.
- scripts/: controlli delle risorse e prove nel browser.

I documenti di licenza originali dei fornitori restano conservati nei pacchetti delle risorse.

## Comandi

- WASD: movimento; Shift: corsa.
- Mouse: mira; clic sinistro: attacco; Q: abilità dell'arma.
- E: interagisce con il mercante o apre il forziere più vicino.
- B: apre o chiude lo zaino. ESC: pausa oppure chiusura della finestra aperta.
- I tasti 1–5 e la rotella non cambiano arma.
- Monete, salute e mana numerici, zaino, pausa e selezione IT/EN sono raccolti in alto a sinistra. La minimappa si trova in alto a destra.

## Classi

| Classe | Arma | Attacco e abilità |
| --- | --- | --- |
| Guerriero | Spada | Fendente e Blue Group Slashes |
| Mago | Bastone arcano | Vento e sfera di energia |
| Assassino | Lama da lancio | Lama a distanza e rotazione |
| Guaritore | Bastone della luce | Due varianti di fulmine |

Le armi riutilizzano gli effetti disponibili. La cura del guaritore e il bilanciamento definitivo sono ancora da realizzare. Tutte le classi usano temporaneamente Dante.

## Stanze e ricompense

La stanza iniziale è un rifugio senza nemici. Il primo gruppo appare dopo l'uscita, oltre la soglia verticale configurata nel codice. I nemici restano fuori dal rifugio. Dopo ogni gruppo sconfitto compare un solo forziere, anche dopo l'ultimo combattimento; il completamento sblocca il passaggio successivo.

La stanza più a sud non genera nemici e contiene quattro forzieri casuali. Ogni forziere usa una delle 48 celle di chests.png e produce 3–4 oggetti di categorie diverse, con varianti grafiche casuali. Il bottino entra subito nello zaino. Ogni forziere si apre una sola volta. Le rarità sono Comune, Raro, Epico e Leggendario; per ora cambiano l'identità visiva, non la potenza del bonus.

## Oggetti e negozio

| Oggetto | Effetto per 30 secondi | Prezzo |
| --- | --- | --- |
| Libro | Mana massimo +25% | 10 monete |
| Caffè | Velocità +25% | 8 monete |
| Pozione | Danno +25% | 12 monete |
| Cibo | Salute massima +35% | 5 monete |

Il recupero dura 60 secondi dall'uso ed è condiviso fra i colori della stessa categoria. Gli effetti di categorie diverse possono coesistere; lo stesso bonus non si accumula. Libro e cibo rendono subito disponibile l'aumento della risorsa. Alla scadenza il valore corrente viene limitato al massimo di base. La larghezza esterna delle barre resta invariata.

Si comincia con 10 monete. Ogni nemico normale lascia 4 monete, il boss 10; basta avvicinarsi per raccoglierle. Non si guadagna più esperienza. Il negozio vende quattro consumabili a prezzo fisso e mostra una delle due spade, scelta casualmente e non acquistabile. Gli acquisti possono essere ripetuti finché le monete bastano.

Pausa, zaino e negozio fermano movimento, attacchi ritardati, bonus e recuperi. La simulazione usa passi fissi a 60 Hz. Anche perdere il focus mette in pausa la partita.

## Boss e piani

Dopo il boss compaiono un mercante e un portale blu in posizioni libere della stanza finale, lontano dal giocatore. Toccare il portale apre una conferma: restare per commerciare oppure scendere. Dopo un rifiuto bisogna uscire dal portale e rientrare per riaprire la domanda.

Il piano successivo riusa la stessa mappa e conserva salute, mana, monete, inventario, bonus e recuperi. Nemici, forzieri e negozi vengono ricreati. Salute e danno dei nemici crescono del 20% del valore di base per piano. Il numero del piano compare nell'HUD.

La guida iniziale evidenzia l'interazione E vicino a mercanti e forzieri e indica i passaggi con una freccia. La minimappa mostra giocatore, nemici, mercanti, tesori e portale.

Per i ritagli delle risorse vedere assets/img/items/README.md.

Per il mercante si usa esclusivamente NPC_mercante_000: 6 colonne e 13 righe da 64 × 64 pixel. La riga con indice 5 contiene le sei pose complete usate dal gioco.

## Verifiche

Eseguire `node scripts/check-assets.cjs` per controllare risorse e dimensioni. Con server HTTP sulla porta 8000 e Chrome di prova con debug remoto sulla 9222, `node scripts/browser-smoke.cjs` controlla navigazione, animazioni, pausa, negozio, bonus, recuperi, tesori, monete e secondo piano. Le prove di progressione azzerano la salute dei nemici: non sostituiscono una partita manuale per valutare la difficoltà.
