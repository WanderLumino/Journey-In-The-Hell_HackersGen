// Richiede Node.js 22+, server HTTP :8000 e Chrome con debug remoto :9222.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
    const tabs = await (await fetch('http://127.0.0.1:9222/json/list')).json();
    const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map(), errors = [], failed = [];
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
        if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && !message.params.response.url.endsWith('favicon.ico')) failed.push(message.params.response.url);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
        const request = ++id;
        pending.set(request, message => message.error ? reject(message.error) : resolve(message.result));
        socket.send(JSON.stringify({ id: request, method, params }));
    });
    const evaluate = async expression => {
        const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const key = async key => {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key });
    };
    const loaded = async () => {
        for (let i = 0; i < 40; i++) {
            await sleep(150);
            if (await evaluate("!!document.getElementById('loading')?.hidden")) {
                assert.equal(await evaluate('finestraAttiva'), 'comandi');
                assert.equal(await evaluate("document.querySelectorAll('.control-card').length"), 11);
                const tempo = await evaluate('tempoGioco');
                await sleep(100);
                assert.equal(await evaluate('tempoGioco'),tempo);
                await evaluate("document.querySelector('#dialog-content > button').click()");
                assert.equal(await evaluate('finestraAttiva'),null);
                return;
            }
        }
        throw new Error('Il gioco non ha completato il caricamento: ' + JSON.stringify(errors));
    };
    try {
        await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable');
        await send('Network.setCacheDisabled', {cacheDisabled:true});
        errors.length = 0; failed.length = 0;
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/' });
        await sleep(1200);
        assert.match(await evaluate('location.pathname'), /home.html$/);
        await evaluate("impostaLingua('it'); document.querySelector('[data-language-toggle]').click()");
        assert.equal(await evaluate('document.documentElement.lang'), 'en');
        assert.match(await evaluate("document.getElementById('startBtn').textContent"), /Start the journey/);
        await send('Page.navigate', {url:'http://127.0.0.1:8000/html/settings.html'}); await sleep(250);
        assert.equal(await evaluate('document.documentElement.lang'), 'en');
        assert.equal(await evaluate("document.querySelectorAll('.s-panel').length"),4);
        await evaluate("document.querySelector('[data-language-toggle]').click();localStorage.setItem('audioVolumeEffetti','50');localStorage.setItem('audioMuto','false')");
        assert.equal(await evaluate("localStorage.getItem('lingua')"), 'it');
        await send('Page.navigate', {url:'http://127.0.0.1:8000/html/home.html'}); await sleep(250);
        assert.match(await evaluate("document.getElementById('startBtn').textContent"), /Inizia il viaggio/);
        await evaluate("document.getElementById('startBtn').click()"); await sleep(1300);
        assert.match(await evaluate("document.querySelector('[data-class=warrior] .card-title').textContent"), /Guerriero/);
        await evaluate("document.querySelector('[data-class=warrior] .card-select-btn').click(); document.getElementById('modalConfirm').click()");
        await loaded();
        assert.deepEqual(await evaluate('armaClasse.attacchi'), [0, 2]);
        assert.deepEqual(await evaluate('({nemici:nemici.length,forzieri:forzieri.length,monete})'), {nemici:0,forzieri:1,monete:10});
        assert.equal(await evaluate('forzieri.every(f => dentroArea(f, areaTesoro) && posizioneLibera(f.x,f.y))'), true);
        assert.equal(await evaluate('Object.values(src_blocci_img.dante).every(f => f.length === 6)'), true);
        // Il percorso deve aggirare un ostacolo reale, con segmenti percorribili.
        assert.equal(await evaluate(`(() => {
            const a={x:72,y:872},b={x:72,y:1160},r=cercaPercorso(a,b,areeCombattimento[1]);
            return !passaggioLibero(a,b) && r.length>2 && Math.hypot(r.at(-1).x-b.x,r.at(-1).y-b.y)<30 && r.every((p,i)=>posizioneLibera(p.x,p.y,40,24)&&(!i||passaggioLibero(r[i-1],p)));
        })()`),true);
        for (const [tasto, animazione] of [['w','avanti'], ['s','indietro'], ['a','sinistra'], ['d','destra']]) {
            await send('Input.dispatchKeyEvent', { type: 'keyDown', key: tasto }); await sleep(100);
            assert.equal(await evaluate('player.nome_animazione'), animazione);
            await send('Input.dispatchKeyEvent', { type: 'keyUp', key: tasto }); await sleep(100);
            assert.equal(await evaluate('player.nome_animazione'), `${animazione}_stand`);
        }
        // Corsa reale da tastiera: il suono deve partire subito e fermarsi col movimento.
        await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Shift',code:'ShiftLeft',modifiers:8});
        await evaluate('player.x=200;player.y=200');
        await send('Input.dispatchKeyEvent', {type:'keyDown',key:'d',code:'KeyD',modifiers:8}); await sleep(60);
        assert.equal(await evaluate('audioGioco.tracce.corsa[0].paused'), false);
        assert.equal(await evaluate('audioGioco.tracce.cammino[0].paused'), true);
        assert.ok(await evaluate('Math.abs(player.vx)>player_speed'));
        await send('Input.dispatchKeyEvent', {type:'keyUp',key:'d'});
        await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Shift'}); await sleep(80);
        assert.equal(await evaluate('audioGioco.tracce.corsa[0].paused'), true);
        // La pausa arresta movimento, orologio e azioni programmate.
        await key('Escape');
        assert.equal(await evaluate('finestraAttiva'), 'pausa');
        const congelato = await evaluate('tempoGioco');
        await evaluate('window.provaAzione = false; programmaAzione(() => window.provaAzione = true, 100)');
        await sleep(220);
        assert.equal(await evaluate('tempoGioco'), congelato);
        assert.equal(await evaluate('window.provaAzione'), false);
        await key('Escape'); await sleep(180);
        assert.equal(await evaluate('window.provaAzione'), true);
        assert.equal(await evaluate('document.activeElement.id'), 'gameCanvas');
        await evaluate("inventario.push(...Object.keys(tipiOggetto).map(creaOggetto))");
        for (const tasto of ['1','2','3','4']) await key(tasto);
        assert.equal(await evaluate('inventario.length'),0);
        assert.equal(await evaluate('Object.keys(effetti).length'),4);
        await evaluate('aggiornaTempo(60001)');
        // Il mercante offre quattro consumabili e un'arma non acquistabile.
        await evaluate('player.x=260; player.y=210'); await key('e');
        assert.equal(await evaluate('finestraAttiva'), 'negozio');
        assert.equal(await evaluate("document.querySelectorAll('.item-slot').length"), 5);
        assert.equal(await evaluate("!!document.querySelector('#dialog-content a[href=\"home.html\"]')"),false);
        assert.equal(await evaluate("mercanteAttivo.arma.startsWith('W_')"),true);
        assert.equal(await evaluate('acquistaOggetto(1)'), true);
        assert.equal(await evaluate('monete'), 2);
        assert.equal(await evaluate('acquistaOggetto(0)'), false);
        assert.equal(await evaluate('acquistaOggetto(4)'), false);
        await evaluate('monete=100; acquistaOggetto(0); acquistaOggetto(2); acquistaOggetto(3)');
        assert.equal(await evaluate('monete'), 73);
        await key('Escape'); await key('b');
        assert.equal(await evaluate('finestraAttiva'), 'zaino');
        await evaluate('inventario.slice().forEach(o => usaOggetto(o.id))');
        assert.deepEqual(await evaluate('[player_max_MP,player_speed,player_molt_danno,player_max_HP]'), [100,4.75,1.25,189]);
        await evaluate("inventario.push(creaOggetto('books'))");
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), false);
        await evaluate('aggiornaTempo(30001)');
        assert.deepEqual(await evaluate('[player_max_MP,player_speed,player_molt_danno,player_max_HP]'), [80,3.8,1,140]);
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), false);
        await evaluate('aggiornaTempo(30000)');
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), true);
        await key('Escape');
        // Ogni forziere restituisce 3–4 categorie diverse e si apre una volta sola.
        await evaluate('player.x=forzieri[0].x; player.y=forzieri[0].y');
        const bottino = await evaluate('apriForziere(forzieri[0])');
        assert.ok(bottino.length === 1 || bottino.length === 2);
        assert.equal(new Set(bottino.map(o => o.tipo)).size, bottino.length);
        assert.equal(await evaluate('apriForziere(forzieri[0])'), false);
        assert.equal(await evaluate('bottiniATerra.length'),bottino.length);
        await evaluate('aggiornaTempo(1400);aggiornaAmbiente()');
        assert.equal(await evaluate('bottiniATerra.length'),bottino.length);
        await evaluate('aggiornaTempo(1200);aggiornaAmbiente()');
        assert.equal(await evaluate('bottiniATerra.length'),0);
        assert.equal(await evaluate('nemici.some(n => dentroArea(n.nemico, areaTesoro))'), false);
        await evaluate('player.x=273; player.y=850; controlla_fase()');
        assert.equal(await evaluate('nemici.length'), 0);
        assert.deepEqual(await evaluate('(() => { aggiornaTempo(scadenzaEvocazione-tempoGioco-10); controlla_fase(); const prima=nemici.length; aggiornaTempo(11); controlla_fase(); return [prima,nemici.length]; })()'), [0,2]);
        assert.equal(await evaluate('nemici.length'), 2);
        const denaroPrima = await evaluate('monete + moneteATerra.reduce((tot,m) => tot+m.valore,0)');
        for (const faseAttesa of [1,2,4,5]) {
            assert.equal(await evaluate('fase'), faseAttesa);
            if (faseAttesa !== 1) await evaluate(`player.x=areeCombattimento[${faseAttesa}].x+100;player.y=areeCombattimento[${faseAttesa}].y+100;controlla_fase();aggiornaTempo(1501);controlla_fase()`);
            assert.ok(await evaluate('nemici.length>0'));
            assert.equal(await evaluate('nemici.every(e=>posizioneLibera(e.nemico.x+e.nemico.d_sin,e.nemico.y+e.nemico.d_sop,40,24))'),true);
            await evaluate('nemici.forEach(n => n.HP=0)'); await sleep(150);
        }
        assert.equal(await evaluate('forzieri.length'), 5);
        assert.equal(await evaluate('monete + moneteATerra.reduce((tot,m) => tot+m.valore,0)'), denaroPrima + 50);
        const raccolta = await evaluate(`(() => {
            const prima=monete, totale=moneteATerra.reduce((tot,m)=>tot+m.valore,0);
            while(moneteATerra.length) { player.x=moneteATerra[0].x-25;player.y=moneteATerra[0].y-25;aggiornaAmbiente(); }
            return monete-prima===totale;
        })()`);
        assert.equal(raccolta, true);
        assert.equal(await evaluate('mercanti.length'), 2);
        assert.equal(await evaluate('!!portaleFinale && distanzaInterazione(portaleFinale) >= 96 && posizioneLibera(portaleFinale.x,portaleFinale.y,64,64)'), true);
        // Con i passaggi aperti, tesori e uscita devono appartenere all'area percorribile.
        const raggiungibili = await evaluate(`(() => {
            const passo=24, coda=[{x:192,y:192}], visitati=new Set(['192,192']);
            for(let i=0;i<coda.length;i++) {
                const punto=coda[i];
                for(const [dx,dy] of [[passo,0],[-passo,0],[0,passo],[0,-passo]]) {
                    const x=punto.x+dx,y=punto.y+dy,chiave=x+','+y;
                    if(x<0||y<0||x>2950||y>1750||visitati.has(chiave)||!posizioneLibera(x,y,30,20)) continue;
                    visitati.add(chiave);coda.push({x,y});
                }
            }
            return [...forzieri.filter(f=>f.stanza==='tesoro'),portaleFinale,...mercanti].map(p => coda.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<70));
        })()`);
        assert.ok(raggiungibili.every(Boolean), `Punti non raggiungibili: ${raggiungibili}`);
        await evaluate('player.x=portaleFinale.x; player.y=portaleFinale.y; aggiornaAmbiente()');
        assert.equal(await evaluate('finestraAttiva'), 'portale');
        await key('Escape'); await sleep(100);
        assert.equal(await evaluate('finestraAttiva'), null);
        await evaluate('player.x-=140; aggiornaAmbiente(); player.x+=140; aggiornaAmbiente()');
        assert.equal(await evaluate('finestraAttiva'), 'portale');
        const conservati = await evaluate('({monete,oggetti:inventario.length})');
        await evaluate('passaAlPianoSuccessivo()'); await sleep(150);
        assert.equal(await evaluate('piano'), 2);
        assert.deepEqual(await evaluate('({monete,oggetti:inventario.length})'), conservati);
        assert.deepEqual(await evaluate('[nemici.length,forzieri.length,mercanti.length,portaleFinale]'), [0,1,1,null]);
        await evaluate('player.x=273; player.y=850; controlla_fase()');
        assert.equal(await evaluate('nemici.length'), 0);
        assert.deepEqual(await evaluate('(() => { aggiornaTempo(scadenzaEvocazione-tempoGioco-10); controlla_fase(); const prima=nemici.length; aggiornaTempo(11); controlla_fase(); return [prima,nemici.length]; })()'), [0,2]);
        assert.equal(await evaluate('nemici[0].max_HP'), 108);
        await evaluate("impostaLingua('en')");
        assert.equal(await evaluate("testoGioco('Inventario')"), 'Inventory');
        for (const [classe, attacchi] of Object.entries({ warrior:[0,2], mage:[5,6], assassin:[4,3], healer:[8,9] })) {
            await send('Page.navigate', { url: `http://127.0.0.1:8000/html/game.html?class=${classe}` }); await loaded();
            assert.deepEqual(await evaluate('armaClasse.attacchi'), attacchi);
            const statistiche = await evaluate('({hp:player_max_HP,mp:player_max_MP,base:statisticheClasse})');
            assert.equal(statistiche.hp, statistiche.base.hp);
            assert.equal(statistiche.mp, statistiche.base.mp);
            assert.deepEqual(statistiche.base.attacchi.map(a=>a.consumo), {warrior:[0,35],mage:[15,40],assassin:[0,30],healer:[15,35]}[classe]);
            const mana = await evaluate(`(() => {
                player_MP=20;ultimoScambio=tempoGioco;prossimaRigenerazione=tempoGioco;rigeneraRisorse();const durante=player_MP-20;
                player_MP=20;ultimoScambio=-Infinity;prossimaRigenerazione=tempoGioco;rigeneraRisorse();const fuori=player_MP-20;
                const prima=player_MP;rigeneraRisorse();const ripetuta=player_MP-prima;
                player_MP=player_max_MP;return {durante,fuori,ripetuta};
            })()`);
            assert.equal(mana.durante,statistiche.base.mana*0.5);
            assert.equal(mana.fuori,mana.durante*1.5);
            assert.equal(mana.ripetuta,0);
            if (classe === 'healer') {
                assert.equal(await evaluate(`(() => {
                    const cx=player.x+player.lx/2,cy=player.y+player.ly/2;
                    for (const [dx,dy] of [[0,0],[100,40],[1000,0],[-800,600]]) {
                        const mira=miraGuaritore(cx+dx,cy+dy);
                        if (Math.abs(Math.hypot(mira.x-cx,mira.y-cy)-Math.min(300,Math.hypot(dx,dy)))>0.001) return false;
                    }
                    for (const indice of armaClasse.attacchi) {
                        magie=[];azioniProgrammate=[];in_magia=false;player_MP=player_max_MP;recuperoAttacchi[indice]=0;
                        nemici=[295,305].map(dx=>({HP:100,nemico:new blocco('drago',cx+dx-10,cy-20,20,20)}));
                        const rect=canvas.getBoundingClientRect();
                        lancia({clientX:rect.left+(cx+1000-telecamera.x)*rect.width/canvas.width,clientY:rect.top+(cy-telecamera.y)*rect.height/canvas.height},indice);
                        aggiornaTempo(staz_magie[indice].delay+1);
                        const m=magie.at(-1).magia;
                        if (Math.abs(Math.hypot(m.x+m.lx/2-cx,m.y+m.ly-cy)-300)>0.001 || nemici[0].HP>=100 || nemici[1].HP!==100) return false;
                    }
                    nemici=[];magie=[];azioniProgrammate=[];in_magia=false;player_MP=player_max_MP;
                    for(const i of armaClasse.attacchi) recuperoAttacchi[i]=0;
                    return true;
                })()`),true);
            }
            if (['mage','assassin'].includes(classe)) {
                const portate = await evaluate(`(() => {
                    const risultati=[];
                    for (const indice of armaClasse.attacchi.filter(i=>['muv_base','muv_impact'].includes(staz_magie[i].tipo))) {
                        for (const [dx,dy] of [[0,0],[1,0],[1000,700],[-900,-300]]) {
                            magie=[]; azioniProgrammate=[]; in_magia=false; player_MP=player_max_MP; recuperoAttacchi[indice]=0;
                            const x=player.x+player.lx/2,y=player.y+player.ly/2,rect=canvas.getBoundingClientRect();
                            const mira=fineMiraClasse(x+dx,y+dy);
                            lancia({clientX:rect.left+(x+dx-telecamera.x)*rect.width/canvas.width,clientY:rect.top+(y+dy-telecamera.y)*rect.height/canvas.height},indice);
                            aggiornaTempo(staz_magie[indice].delay+1);
                            const m=magie.at(-1),ox=m.magia.x,oy=m.magia.y;
                            for(let i=0;i<100&&!m.da_rimuovere;i++) avanzaMagia(m);
                            risultati.push({mira:Math.hypot(mira.x-x,mira.y-y),viaggio:Math.hypot(m.magia.x-ox,m.magia.y-oy),terminato:m.da_rimuovere});
                        }
                    }
                    magie=[];azioniProgrammate=[];in_magia=false;player_MP=player_max_MP;
                    for(const i of armaClasse.attacchi) recuperoAttacchi[i]=0;
                    return risultati;
                })()`);
                const attesa=classe==='mage'?210:70;
                assert.ok(portate.length>0 && portate.every(p=>p.terminato&&Math.abs(p.viaggio-attesa)<0.001&&Math.abs(p.mira-attesa)<0.001),JSON.stringify(portate));
            }
            const cura = await evaluate(`(() => {
                player_HP=40; ultimoScambio=-Infinity; prossimaRigenerazione=tempoGioco; rigeneraRisorse(); const fuori=player_HP-40;
                player_HP=40; ultimoScambio=tempoGioco; prossimaRigenerazione=tempoGioco; rigeneraRisorse(); const durante=player_HP-40;
                const prima=player_HP;rigeneraRisorse();const ripetuta=player_HP-prima;
                player_HP=player_max_HP;return {fuori,durante,ripetuta};
            })()`);
            assert.equal(cura.fuori, cura.durante*2);
            assert.equal(cura.ripetuta, 0);
            assert.ok(cura.fuori <= 5);
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 430, y: 270 });
            await evaluate('lancia(e_di_mouse,armaClasse.attacchi[1])'); await sleep(300);
            assert.ok(await evaluate('magie.length > 0'));
        }
        // I danni effettivi alimentano le etichette, con protezione dai colpi ripetuti.
        await evaluate('invulnerabileFino=0; player_HP=100; danneggiaGiocatore(10); danneggiaGiocatore(20)');
        assert.equal(await evaluate('player_HP'), 90);
        assert.equal(await evaluate('danniHud.at(-1).danno'), 10);
        const dannoNemico = await evaluate(`(() => {
            const n={HP:90,nemico:new blocco('drago',350,240,100,70)};
            danneggiaNemico(n,28); return [n.HP,numeriDanno.at(-1).danno];
        })()`);
        assert.deepEqual(dannoNemico, [62,28]);
        assert.ok(await evaluate(`[[player.x+26,player.y+25],[1000,900],[player.x+25,player.y+25]].every(([x,y])=>{
            const fine=fineMiraMago(x,y);return Math.abs(Math.hypot(fine.x-player.x-25,fine.y-player.y-25)-210)<0.001;
        })`));
        assert.ok(await evaluate('bilanciamentoNemici.normale.intervallo>=200 && bilanciamentoNemici.boss.intervallo>=80'));
        await evaluate('player_MP=player_max_MP; in_magia=false; recuperoAttacchi[armaClasse.attacchi[0]]=0; lancia(e_di_mouse);');
        const manaDopo = await evaluate('player_MP');
        await evaluate('lancia(e_di_mouse)');
        assert.equal(await evaluate('player_MP'), manaDopo);
        await key('w'); await sleep(150);
        assert.equal(await evaluate('audioGioco.tracce.musica[0].paused'), await evaluate('audioGioco.muto'));
        const audio = await evaluate('Object.values(audioGioco.tracce).flat().map(a=>({src:a.src,errore:a.error?.message,pronto:a.readyState}))');
        assert.ok(audio.every(a=>!a.errore && a.pronto>=2), JSON.stringify(audio));
        await key('Escape'); await sleep(100);
        assert.equal(await evaluate('audioGioco.tracce.musica[0].paused'), true);
        await key('Escape');
        await evaluate('invulnerabileFino=0;player_HP=5;danneggiaGiocatore(20)');
        assert.equal(await evaluate('finestraAttiva'), 'morte');
        assert.equal(await evaluate("document.getElementById('dialog-title').textContent"), 'Game over');
        assert.equal(await evaluate('player_HP'), 0);
        await key('Escape');
        assert.equal(await evaluate('finestraAttiva'), 'morte');
        assert.equal(await evaluate("!!document.querySelector('#dialog-content button') && !!document.querySelector('#dialog-content a[href=\"home.html\"]')"), true);
        if (process.env.SMOKE_SCREENSHOT) {
            const screenshot = await send('Page.captureScreenshot');
            fs.writeFileSync(process.env.SMOKE_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
        }
        await evaluate("document.querySelector('#dialog-content button').click()");
        await loaded();
        assert.deepEqual(await evaluate('[player_HP,monete,finestraAttiva]'), [120,10,null]);
        await evaluate('invulnerabileFino=0;danneggiaGiocatore(999)');
        await evaluate("document.querySelector('#dialog-content a[href=\"home.html\"]').click()");
        await sleep(500);
        assert.match(await evaluate('location.pathname'), /home.html$/);
        assert.deepEqual(errors, []);
        assert.deepEqual(failed, []);
        console.log('OK: progressione, inventario, audio decodificato, bilanciamento, rigenerazione, danni, mira, pausa e game over.');
    } finally { socket.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
