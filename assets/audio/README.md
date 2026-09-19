# Collegamenti audio

Il catalogo e i volumi sono in js/game/audio.js. La musica usa volume 0,12; gli effetti 0,32. La riproduzione richiede la prima interazione dell'utente. ESC interrompe musica, passi e suoni di combattimento; le azioni nei menu possono riprodurre i relativi effetti. Il comando audio è nel menu di pausa.

| File o gruppo | Evento |
| --- | --- |
| bgmusic/sottofondo basso.mp3 | Musica in ciclo durante la partita |
| camminata nell'erba.mp3 / corsa nell'erba.mp3 | Movimento normale / Shift |
| drawKnife1.ogg / drawKnife2.ogg | Estrazione iniziale per guerriero e assassino |
| knifeSlice.ogg | Attacco con lama |
| magia.mp3 / magia2.mp3 | Attacco base / speciale del mago |
| magia_elettrica.mp3 | Magie del guaritore |
| hit.mp3.flac | Nemico colpito |
| hurt_01.mp3 / hurt_02.mp3 / hurt_03.mp3 | Danno ricevuto, variante casuale |
| mostro_attack1.wav / mostro_attack2.wav / mostro_attack3.wav | Preparazione di un attacco nemico |
| morte_mostro.mp3 | Nemico sconfitto |
| doorOpen.ogg | Passaggio sbloccato o forziere aperto |
| handleCoins.ogg | Raccolta di monete o acquisto |
| bookFlip.ogg | Uso di un libro |
| Drink_coffe.wav / Drink_potion.wav | Uso di caffè / pozione |
| eat_sound.ogg / eat_sound2.ogg | Uso di cibo, variante casuale |
| Click.mp3 / switch.wav | Pulsanti e selettori dell'interfaccia |

Gli effetti ravvicinati sono limitati a 12 voci simultanee e 90 ms fra ripetizioni dello stesso evento. Un errore audio non blocca il gioco. Il file license_sound.txt originale resta invariato.
