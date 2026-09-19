# Journey In The Hell — Journey in the Hell

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
- js/game/balance.js: valori delle classi, danni, rigenerazione e indicatori dei colpi.
- js/game/audio.js: musica, passi, effetti sonori e silenziamento.
- js/game/interface.js: HUD, minimappa, inventario, negozio, pausa e guida.
- js/game/language.js: testi di gioco in italiano e inglese.
- assets/img/: immagini e pacchetti originali.
- data/maps/: dati delle collisioni.
- docs/story/: storia e personaggi.
- archive/mappa_base/: prototipo precedente conservato come riferimento.
- scripts/: controlli delle risorse e prove nel browser.

I documenti di licenza originali dei fornitori restano conservati nei pacchetti delle risorse.

## Comandi

A ogni avvio o riavvio della partita compare una finestra con i comandi illustrati. La simulazione rimane ferma fino alla chiusura. Il pulsante Comandi nel menu di pausa riapre la guida. Le icone usano Keyboard_Letters_Symbols.png e left_mouse.png; i consumabili occupano i tasti 1–4.

- WASD: movimento; Shift: corsa.
- Mouse: mira; clic sinistro: attacco; Q: abilità dell'arma.
- E: interagisce con il mercante o apre il forziere più vicino.
- B: apre o chiude l’inventario. Tab: apre o chiude la mappa ingrandita, mettendo in pausa la partita. ESC: pausa oppure chiusura della finestra aperta. Negli altri menu Tab mantiene la navigazione da tastiera.
- 1: libro; 2: caffè; 3: pozione; 4: cibo. Usano il primo oggetto disponibile della categoria, rispettando il recupero. La rotella non cambia arma.
- Monete, salute e mana numerici, inventario e pausa sono in alto a sinistra. Il pulsante con bandiera IT/EN è in alto a destra, sopra la minimappa. La preferenza è condivisa con homepage, classi, Guida e comandi e selettore nelle Impostazioni. Il manuale bilingue conserva storia e ambientazione, con comandi allineati alla demo e senza il capitolo sulla cattura.

## Classi

| Classe | Arma | Attacco e abilità |
| --- | --- | --- |
| Guerriero | Spada | Fendente e Blue Group Slashes |
| Mago | Bastone arcano | Vento e sfera di energia |
| Assassino | Lama da lancio | Lama a distanza e rotazione |
| Guaritore | Bastone della luce | Due varianti di fulmine |

Le armi riutilizzano gli effetti disponibili. Il guaritore recupera salute più rapidamente; una cura attiva dedicata resta da realizzare. Tutte le classi usano temporaneamente Dante. La prima taratura numerica è descritta in [docs/bilanciamento.md](docs/bilanciamento.md).

## Audio e combattimento

Costi MP di attacco base/abilità Q: guerriero 0/35, mago 15/40, assassino 0/30, guaritore 15/35. Il recupero del mana in combattimento è ridotto del 50%; fuori combattimento è il 50% più rapido rispetto a questo nuovo valore. La salute mantiene la rigenerazione precedente. I dettagli per classe sono in docs/bilanciamento.md.

La musica parte dopo la prima interazione con la pagina, rispettando le regole audio del browser. Camminata e corsa hanno tracce distinte; armi, magie, colpi, ferite, morti dei mostri, porte/forzieri, monete, consumabili e interfaccia usano i file in assets/audio. In pausa è disponibile il comando per attivare o disattivare l'audio; la preferenza resta salvata. Camminata e corsa saltano il silenzio iniziale dei file.

I danni inflitti compaiono sopra i nemici; quelli ricevuti appaiono sulla barra HP con un lampo. Il mago ha una portata fissa di 210 pixel del mondo; la lama da lancio dell'assassino arriva a 70 pixel. Anteprima e percorso del centro dei proiettili usano la stessa distanza, indipendente dal mouse; muri e nemici possono interrompere prima il colpo. La rotazione dell'assassino conserva il proprio raggio. A zero HP la partita si ferma su Game over: si può ricominciare o tornare al menu, senza chiudere la finestra per riprendere da morti.

La salute si rigenera una volta al secondo: in combattimento il recupero è il 50% di quello fuori combattimento. Si rimane in combattimento con nemici vicini oppure per cinque secondi dopo uno scambio di colpi. Salute massima, mana, velocità e rigenerazione dipendono dalla classe; i bonus degli oggetti si applicano ai rispettivi valori di base.

Gli attacchi del guaritore possono essere mirati entro 300 pixel dal centro del giocatore. Oltre il limite, anteprima e punto del fulmine si fermano sul bordo del raggio; i nemici con il centro oltre 300 pixel non ricevono danni. Il limite vale per attacco base e abilità Q.

## Stanze e ricompense

La stanza iniziale è un rifugio senza nemici. Ogni gruppo appare 1,5 secondi dopo l’ingresso nella propria stanza, con cerchi di preavviso. Uscire durante il preavviso annulla l’evocazione. I nemici aggirano gli ostacoli su una griglia di 24 pixel e restano nella stanza di origine. Dopo ogni gruppo sconfitto compare un solo forziere, anche dopo l'ultimo combattimento; il completamento sblocca il passaggio successivo.

La stanza più a sud non genera nemici e contiene un solo forziere casuale. Ogni forziere usa una delle 48 celle di chests.png e produce 1–2 oggetti di categorie diverse, con varianti grafiche casuali. Il bottino entra subito nell’inventario e rimane visibile a terra per 1,5–2,5 secondi; la scomparsa è soltanto visiva. Ogni forziere si apre una sola volta. Le rarità sono Comune, Raro, Epico e Leggendario; per ora cambiano l'identità visiva, non la potenza del bonus.

## Oggetti e negozio

| Oggetto | Effetto per 30 secondi | Prezzo |
| --- | --- | --- |
| Libro | Mana massimo +25% | 10 monete |
| Caffè | Velocità +25% | 8 monete |
| Pozione | Danno +25% | 12 monete |
| Cibo | Salute massima +35% | 5 monete |

Il recupero dura 60 secondi dall'uso ed è condiviso fra i colori della stessa categoria. Gli effetti di categorie diverse possono coesistere; lo stesso bonus non si accumula. Libro e cibo rendono subito disponibile l'aumento della risorsa. Alla scadenza il valore corrente viene limitato al massimo di base. La larghezza esterna delle barre resta invariata.

Si comincia con 10 monete. Ogni nemico normale lascia 4 monete, il boss 10; basta avvicinarsi per raccoglierle. Non si guadagna più esperienza. Il negozio vende quattro consumabili a prezzo fisso e mostra un’arma casuale non acquistabile tratta da assets/img/RPG_weapons: il catalogo contiene 496 immagini, delle quali 138 con prefisso W_ sono identificate come armi. Gli acquisti possono essere ripetuti finché le monete bastano.

Pausa, inventario e negozio fermano movimento, attacchi ritardati, bonus e recuperi. La simulazione usa passi fissi a 60 Hz. Anche perdere il focus mette in pausa la partita.

## Boss e piani

Dopo il boss compaiono un mercante e un portale blu in posizioni libere della stanza finale, lontano dal giocatore. Toccare il portale apre una conferma: restare per commerciare oppure scendere. Dopo un rifiuto bisogna uscire dal portale e rientrare per riaprire la domanda.

Il piano successivo riusa la stessa mappa e conserva salute, mana, monete, inventario, bonus e recuperi. Nemici, forzieri e negozi vengono ricreati. Salute e danno dei nemici crescono del 20% del valore di base per piano. Il numero del piano compare nell'HUD.

I bonus attivi mostrano l’effetto effettivo e il tempo residuo, con icone ritagliate in celle da 32 pixel da assets/img/effects_icons/effects._icons.png. La pausa usa un menu verticale. I suggerimenti cambiano fra rifugio, combattimento, bottino e portale. La guida iniziale evidenzia l'interazione E vicino a mercanti e forzieri e indica i passaggi con una freccia. La minimappa mostra giocatore, nemici, mercanti, tesori e portale.

Per i ritagli delle risorse vedere assets/img/items/README.md.

Per il mercante si usa esclusivamente NPC_mercante_000: 6 colonne e 13 righe da 64 × 64 pixel. La riga con indice 5 contiene le sei pose complete usate dal gioco.

## Verifiche

Eseguire `node scripts/check-assets.cjs` per controllare risorse e dimensioni. Con server HTTP sulla porta 8000 e Chrome di prova con debug remoto sulla 9222, `node scripts/browser-smoke.cjs` controlla navigazione, animazioni, pausa, negozio, bonus, recuperi, tesori, monete e secondo piano. Le prove di progressione azzerano la salute dei nemici: non sostituiscono una partita manuale per valutare la difficoltà.
