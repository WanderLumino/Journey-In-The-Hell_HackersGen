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
            if (await evaluate("!!document.getElementById('loading')?.hidden")) return;
        }
        throw new Error('Il gioco non ha completato il caricamento');
    };
    try {
        await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable');
        await send('Page.navigate', { url: 'http://127.0.0.1:8000/' });
        await sleep(1200);
        assert.match(await evaluate('location.pathname'), /home.html$/);
        await evaluate("document.getElementById('startBtn').click()"); await sleep(1300);
        await evaluate("document.querySelector('[data-class=warrior] .card-select-btn').click(); document.getElementById('modalConfirm').click()");
        await loaded();
        assert.deepEqual(await evaluate('armaClasse.attacchi'), [0, 2]);
        assert.deepEqual(await evaluate('({nemici:nemici.length,forzieri:forzieri.length,monete})'), {nemici:0,forzieri:4,monete:10});
        assert.equal(await evaluate('forzieri.every(f => dentroArea(f, areaTesoro) && posizioneLibera(f.x,f.y))'), true);
        assert.equal(await evaluate('Object.values(src_blocci_img.dante).every(f => f.length === 6)'), true);
        for (const [tasto, animazione] of [['w','avanti'], ['s','indietro'], ['a','sinistra'], ['d','destra']]) {
            await send('Input.dispatchKeyEvent', { type: 'keyDown', key: tasto }); await sleep(100);
            assert.equal(await evaluate('player.nome_animazione'), animazione);
            await send('Input.dispatchKeyEvent', { type: 'keyUp', key: tasto }); await sleep(100);
            assert.equal(await evaluate('player.nome_animazione'), `${animazione}_stand`);
        }
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
        // Il mercante offre quattro consumabili e un'arma non acquistabile.
        await evaluate('player.x=260; player.y=210'); await key('e');
        assert.equal(await evaluate('finestraAttiva'), 'negozio');
        assert.equal(await evaluate("document.querySelectorAll('.item-slot').length"), 5);
        assert.equal(await evaluate('acquistaOggetto(1)'), true);
        assert.equal(await evaluate('monete'), 2);
        assert.equal(await evaluate('acquistaOggetto(0)'), false);
        assert.equal(await evaluate('acquistaOggetto(4)'), false);
        await evaluate('monete=100; acquistaOggetto(0); acquistaOggetto(2); acquistaOggetto(3)');
        assert.equal(await evaluate('monete'), 73);
        await key('Escape'); await key('b');
        assert.equal(await evaluate('finestraAttiva'), 'zaino');
        await evaluate('inventario.slice().forEach(o => usaOggetto(o.id))');
        assert.deepEqual(await evaluate('[player_max_MP,player_speed,player_molt_danno,player_max_HP]'), [125,5,1.25,135]);
        await evaluate("inventario.push(creaOggetto('books'))");
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), false);
        await evaluate('aggiornaTempo(30001)');
        assert.deepEqual(await evaluate('[player_max_MP,player_speed,player_molt_danno,player_max_HP]'), [100,4,1,100]);
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), false);
        await evaluate('aggiornaTempo(30000)');
        assert.equal(await evaluate('usaOggetto(inventario[0].id)'), true);
        await key('Escape');
        // Ogni forziere restituisce 3–4 categorie diverse e si apre una volta sola.
        await evaluate('player.x=forzieri[0].x; player.y=forzieri[0].y');
        const bottino = await evaluate('apriForziere(forzieri[0])');
        assert.ok(bottino.length === 3 || bottino.length === 4);
        assert.equal(new Set(bottino.map(o => o.tipo)).size, bottino.length);
        assert.equal(await evaluate('apriForziere(forzieri[0])'), false);
        assert.equal(await evaluate('nemici.some(n => dentroArea(n.nemico, areaTesoro))'), false);
        await evaluate('player.x=273; player.y=650; controlla_fase()');
        assert.equal(await evaluate('nemici.length'), 2);
        const denaroPrima = await evaluate('monete + moneteATerra.reduce((tot,m) => tot+m.valore,0)');
        for (const faseAttesa of [1,2,4,5]) {
            assert.equal(await evaluate('fase'), faseAttesa);
            await evaluate('nemici.forEach(n => n.HP=0)'); await sleep(150);
        }
        assert.equal(await evaluate('forzieri.length'), 8);
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
        assert.deepEqual(await evaluate('[nemici.length,forzieri.length,mercanti.length,portaleFinale]'), [0,4,1,null]);
        await evaluate('player.x=273; player.y=650; controlla_fase()');
        assert.equal(await evaluate('nemici[0].max_HP'), 360);
        await evaluate("document.getElementById('language').value='en'; document.getElementById('language').dispatchEvent(new Event('change'))");
        assert.equal(await evaluate("testoGioco('Zaino')"), 'Backpack');
        for (const [classe, attacchi] of Object.entries({ warrior:[0,2], mage:[5,6], assassin:[4,3], healer:[8,9] })) {
            await send('Page.navigate', { url: `http://127.0.0.1:8000/html/game.html?class=${classe}` }); await loaded();
            assert.deepEqual(await evaluate('armaClasse.attacchi'), attacchi);
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 430, y: 270 });
            await evaluate('lancia(e_di_mouse,armaClasse.attacchi[1])'); await sleep(300);
            assert.ok(await evaluate('magie.length > 0'));
        }
        if (process.env.SMOKE_SCREENSHOT) {
            const screenshot = await send('Page.captureScreenshot');
            fs.writeFileSync(process.env.SMOKE_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(failed, []);
        console.log('OK: HUD, pausa, animazioni, negozio, zaino, bonus/recuperi, bottino, monete, boss, portale e secondo piano.');
    } finally { socket.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
