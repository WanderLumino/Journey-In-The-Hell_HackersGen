// I nomi dei file indicano gli eventi; gli effetti non bloccano l'avvio del gioco.
const audioGioco = (() => {
    const cartella = '../assets/audio/';
    const risorse = {
        musica: ['bgmusic/sottofondo basso.mp3'],
        cammino: ["personaggi_sound/camminata nell'erba.mp3"], corsa: ["personaggi_sound/corsa nell'erba.mp3"],
        books: ['items_sound/bookFlip.ogg'], consumables: ['items_sound/Drink_coffe.wav'],
        potions: ['items_sound/Drink_potion.wav'], food: ['items_sound/eat_sound.ogg','items_sound/eat_sound2.ogg'],
        monete: ['items_sound/handleCoins.ogg'], porta: ['personaggi_sound/doorOpen.ogg'],
        estrazione: ['personaggi_sound/drawKnife1.ogg','personaggi_sound/drawKnife2.ogg'],
        lama: ['personaggi_sound/knifeSlice.ogg'], colpo: ['personaggi_sound/hit.mp3.flac'],
        ferita: ['personaggi_sound/hurt_01.mp3','personaggi_sound/hurt_02.mp3','personaggi_sound/hurt_03.mp3'],
        magia: ['personaggi_sound/magia.mp3'], energia: ['personaggi_sound/magia2.mp3'],
        elettrico: ['personaggi_sound/magia_elettrica.mp3'], morteNemico: ['personaggi_sound/morte_mostro.mp3'],
        mostro: ['personaggi_sound/mostro_attack1.wav','personaggi_sound/mostro_attack2.wav','personaggi_sound/mostro_attack3.wav'],
        clic: ['ui_sound_effect/Click.mp3'], cambio: ['ui_sound_effect/switch.wav']
    };
    const tracce = {}, ultimi = {}, attivi = new Set();
    let sbloccato = false, muto = false;
    try { muto = localStorage.getItem('audioMuto') === 'true'; } catch {}
    function volume(nome) {
        const predefinito = nome === 'musica' ? 12 : 50;
        let livello = predefinito;
        try {
            const valore = localStorage.getItem('audioVolume' + (nome === 'musica' ? 'Musica' : 'Effetti'));
            if (valore !== null && Number.isFinite(Number(valore))) livello = Number(valore);
        } catch {}
        // Il mix si applica anche alle preferenze già salvate: musica più presente, effetti più discreti.
        const mix = nome === 'musica' ? 1.5 : 0.8;
        return Math.max(0, Math.min(1, livello / 100 * mix));
    }
    for (const [nome, file] of Object.entries(risorse)) {
        tracce[nome] = file.map(percorso => {
            const audio = new Audio(cartella + percorso);
            audio.preload = 'auto'; audio.volume = volume(nome);
            audio.loop = ['musica','cammino','corsa'].includes(nome);
            // I file dei passi iniziano con circa mezzo secondo quasi silenzioso.
            if (nome === 'cammino' || nome === 'corsa') {
                audio.inizioPassi = nome === 'corsa' ? 0.5 : 0.34;
                audio.addEventListener('canplay', () => { audio.currentTime = audio.inizioPassi; }, { once: true });
            }
            return audio;
        });
    }
    function riproduci(audio) { audio.play().catch(() => {}); }
    function effetto(nome) {
        if (!sbloccato || muto || !tracce[nome]) return;
        const adesso=performance.now();
        if (adesso-(ultimi[nome] ?? -Infinity)<90) return;
        ultimi[nome]=adesso;
        if (attivi.size >= 12) return;
        const base=tracce[nome][Math.floor(Math.random()*tracce[nome].length)];
        const voce=base.cloneNode(); voce.volume=base.volume;
        attivi.add(voce);
        const termina=()=>attivi.delete(voce);
        voce.addEventListener('ended',termina,{once:true}); voce.addEventListener('error',termina,{once:true});
        voce.play().catch(termina);
    }
    function ferma() {
        Object.values(tracce).flat().forEach(traccia=>traccia.pause());
        for(const voce of attivi) voce.pause();
        attivi.clear();
    }
    function aggiorna() {
        if (!sbloccato || muto || giocoInPausa()) {
            for(const nome of ['musica','cammino','corsa']) tracce[nome][0].pause();
            return;
        }
        if(tracce.musica[0].paused) riproduci(tracce.musica[0]);
        const movimento= Math.abs(player.vx)+Math.abs(player.vy)>0 && !in_magia;
        for(const nome of ['cammino','corsa']) {
            const traccia=tracce[nome][0];
            const serve=movimento && (nome==='corsa')===!!keys.shift;
            if(serve && traccia.paused) riproduci(traccia);
            if(!serve && !traccia.paused) { traccia.pause(); traccia.currentTime = traccia.inizioPassi || 0; }
        }
    }
    function attiva() {
        if(sbloccato) return;
        sbloccato=true;
        if (['warrior','assassin'].includes(sessione.classe)) effetto('estrazione');
        aggiorna();
    }
    document.addEventListener('pointerdown',attiva,{capture:true});
    document.addEventListener('keydown',attiva,{capture:true});
    document.addEventListener('click',evento=>{ if(evento.target.closest('button,a')) effetto('clic'); });
    document.addEventListener('change',evento=>{ if(evento.target.matches('select')) effetto('cambio'); });
    window.addEventListener('storage', () => {
        try { muto = localStorage.getItem('audioMuto') === 'true'; } catch {}
        for (const [nome, elenco] of Object.entries(tracce)) elenco.forEach(traccia => { traccia.volume = volume(nome); });
        if (muto) ferma();
    });
    return { effetto, aggiorna, ferma, risorse, tracce,
        get muto() { return muto; },
        alterna() { muto=!muto; if(muto) ferma(); else aggiorna(); try {localStorage.setItem('audioMuto',muto);} catch {} }
    };
})();
