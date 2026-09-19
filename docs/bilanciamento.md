# Prima taratura della demo

I valori effettivi sono centralizzati in js/game/balance.js. Gli attacchi del catalogo di main.js ricevono danni, costi, tempi di preparazione e recuperi dalla classe selezionata.

## Classi al primo piano

| Classe | HP | MP | Velocità | Danno base / speciale | Costo MP base / speciale | Recupero base / speciale |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Guerriero | 140 | 80 | 3,8 | 28 / 60 | 0 / 35 | 400 / 1400 ms |
| Mago | 90 | 140 | 4,0 | 24 / 64 | 15 / 40 | 350 / 1200 ms |
| Assassino | 100 | 100 | 4,6 | 18 / 42 | 0 / 30 | 230 / 1000 ms |
| Guaritore | 120 | 120 | 4,0 | 22 / 50 | 15 / 35 | 420 / 1300 ms |

La velocità è espressa in pixel per passo della simulazione a 60 Hz. Lo speciale del guerriero usa Blue Group Slashes. La lama dell'assassino percorre 70 pixel; ogni attacco rotante colpisce ciascun nemico una sola volta. Un proiettile consumato non può danneggiare altri bersagli nello stesso passo.

Obiettivi: resistenza per il guerriero, riserva di mana per il mago, mobilità e ritmo rapido per l'assassino, maggiore sopravvivenza e attacchi ad area per il guaritore. I recuperi impediscono che la velocità dei clic determini il danno massimo.

## Rigenerazione

| Classe | HP/s fuori combattimento | HP/s in combattimento | MP/s in combattimento | MP/s fuori combattimento |
| --- | ---: | ---: | ---: | ---: |
| Guerriero | 4 | 2 | 5 | 7,5 |
| Mago | 3 | 1,5 | 6 | 9 |
| Assassino | 3 | 1,5 | 5 | 7,5 |
| Guaritore | 5 | 2,5 | 5,5 | 8,25 |

Il recupero del mana in combattimento è dimezzato rispetto alla taratura precedente; fuori combattimento aumenta del 50% rispetto al nuovo recupero in combattimento. La rigenerazione della salute resta invariata.

Il recupero avviene a scatti di un secondo, mai a ogni fotogramma. Prima la salute recuperava circa 12 HP/s; ora anche il recupero fuori combattimento è inferiore. La vicinanza entro la vista del nemico più 60 pixel segnala pericolo; dopo attacchi o danni il combattimento dura almeno altri cinque secondi. I timer si fermano in pausa e nei menu.

Gli aumenti percentuali di libro, caffè e cibo partono dai valori della classe. I massimi HP/MP vengono arrotondati all'intero più vicino. La pozione moltiplica il danno per 1,25; il danno finale viene arrotondato e il numero mostrato non supera la salute residua del bersaglio.

## Nemici

- Mostro comune: 90 HP; contatto da 10; tentativi di magia ogni 210 passi, circa 3,5 s, contro i precedenti 100 passi. Frequenza ridotta di circa il 52%.
- Boss: 480 HP; contatto da 16; tentativi di magia ogni 120 passi, circa 2 s, contro i precedenti 40 passi. Frequenza ridotta di circa il 67%.
- Magie: danni base 10 / 16 / 12 / 12 / 16, moltiplicati per 1,25 sul boss. Il preavviso è almeno 700 ms prima del moltiplicatore di preparazione del nemico; il boss mantiene il fattore 0,8.
- Il contatto può colpire al massimo ogni 1,2 s per nemico. Dopo qualsiasi danno ricevuto ci sono 650 ms di invulnerabilità globale: niente svuotamento della barra a ogni fotogramma.
- Per piano successivo, HP e danni crescono del 20% del valore di base. La frequenza non cresce.

Contro 90 HP, senza bonus, servono circa 4 colpi base del guerriero o del mago e 5 dell'assassino o del guaritore. Gli attacchi ad area premiano il posizionamento. Sono obiettivi iniziali: schivate, geometria della mappa e precisione cambiano la durata reale dei combattimenti.

## Verifica

La prova nel browser controlla statistiche delle quattro classi, rapporto 2:1 della rigenerazione, limite di un recupero per secondo, danni effettivi, invulnerabilità, costi e recuperi degli attacchi, anteprima e portata dei proiettili (mago 210 pixel, assassino 70), decodifica audio e Game over. Le prove automatiche di progressione non sostituiscono una sessione manuale di bilanciamento.
