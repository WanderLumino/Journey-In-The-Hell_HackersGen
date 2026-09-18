# Oggetti e ritagli

Le immagini sono spritesheet con celle da 16 × 16 pixel. I ritagli vengono eseguiti con Canvas, senza modificare i PNG.

| Immagine | Griglia | Utilizzo |
| --- | --- | --- |
| chests.png | 8 × 6 | 48 varianti di forziere, scelte con la stessa probabilità |
| books.png | 14 × 12 | Varianti di libro |
| consumables.png | 44 × 17 | Prima riga: 44 varianti di caffè |
| potions.png | 21 × 15 | Prime 14 righe: varianti di pozione |
| food.png | 8 × 8 | Varianti di cibo |
| rpg_icons.png | 3 × 3 | Prima riga: HUD, moneta a terra, prezzo nel negozio |

Le 48 celle dei forzieri sono suddivise in quattro gruppi di 12: Comune, Raro, Epico, Leggendario. Il colore sotto il forziere e il suggerimento E indicano la rarità. Il forziere aperto viene attenuato e contrassegnato: non serve un'immagine separata.

In js/game/state.js si configurano tipi, prezzi, varianti e durata degli effetti. In js/game/rewards.js si configurano risorse, bottino, mercanti e portale. Le spade in esposizione riutilizzano i ritagli da 32 pixel già usati dal combattimento.

I portali esistenti si trovano nella cartella storica assets/img/potali/portale_blu; il codice usa quel percorso reale.
