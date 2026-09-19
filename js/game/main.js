"use strict";


//ridimenziona canvas
function ridimensiona_canvas() {
    const rapporto = canvas.width / canvas.height; // 800/500 = 1.6
    
    const larghezza_max = window.innerWidth;
    const altezza_max   = window.innerHeight;

    let nuova_larghezza = larghezza_max;
    let nuova_altezza   = nuova_larghezza / rapporto;

    // se troppo alta, scala dall'altezza
    if (nuova_altezza > altezza_max) {
        nuova_altezza   = altezza_max;
        nuova_larghezza = nuova_altezza * rapporto;
    }

    canvas.style.width  = nuova_larghezza + "px";
    canvas.style.height = nuova_altezza   + "px";

    // centra
    canvas.style.position = "absolute";
    canvas.style.left = ((larghezza_max - nuova_larghezza) / 2) + "px";
    canvas.style.top  = ((altezza_max  - nuova_altezza)  / 2) + "px";
}
ridimensiona_canvas();
window.addEventListener("resize", ridimensiona_canvas);

function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = mulberry32(12345);
//const random = mulberry32(Math.floor(Math.random() * 11111));






//caricamento collisioni

function genera_rettangoli_da_griglia(griglia, min_gx, min_gy, max_gx, max_gy) {
    const rettangoli = [];
    const visitata = new Set();

    const chiave = (gx, gy) => gx + "," + gy;
    const e_piena = (gx, gy) => griglia.has(chiave(gx, gy));
    const e_visitata = (gx, gy) => visitata.has(chiave(gx, gy));

    for (let gy = min_gy; gy <= max_gy; gy++) {
        for (let gx = min_gx; gx <= max_gx; gx++) {
            if (!e_piena(gx, gy) || e_visitata(gx, gy)) continue;

            // espandi in larghezza finché la riga resta piena e libera
            let larghezza = 1;
            while (e_piena(gx + larghezza, gy) && !e_visitata(gx + larghezza, gy)) {
                larghezza++;
            }

            // espandi in altezza finché l'intera riga sotto resta piena e libera
            let altezza = 1;
            let puo_espandere = true;
            while (puo_espandere) {
                for (let dx = 0; dx < larghezza; dx++) {
                    if (!e_piena(gx + dx, gy + altezza) || e_visitata(gx + dx, gy + altezza)) {
                        puo_espandere = false;
                        break;
                    }
                }
                if (puo_espandere) altezza++;
            }

            // marca tutte le celle del rettangolo come visitate
            for (let dy = 0; dy < altezza; dy++) {
                for (let dx = 0; dx < larghezza; dx++) {
                    visitata.add(chiave(gx + dx, gy + dy));
                }
            }

            rettangoli.push({ gx, gy, larghezza, altezza });
        }
    }

    return rettangoli;
}

const TILE_SIZE = 48; // tilewidth/tileheight della mappa Tiled

async function carica_collisioni_mappa(url = "../data/maps/selva.json") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Mappa non disponibile: ${res.status}`);
    const mappa = await res.json();

    const layer = mappa.layers.find(l => l.name === "collesioni");
    if (!layer) {
        throw new Error("Layer collisioni non trovato nella mappa");
    }

    const griglia = new Set();
    let min_gx = Infinity, min_gy = Infinity, max_gx = -Infinity, max_gy = -Infinity;

    for (let gy = 0; gy < layer.height; gy++) {
        for (let gx = 0; gx < layer.width; gx++) {
            const idx = gy * layer.width + gx;
            if (layer.data[idx] !== 0) {
                griglia.add(gx + "," + gy);
                if (gx < min_gx) min_gx = gx;
                if (gx > max_gx) max_gx = gx;
                if (gy < min_gy) min_gy = gy;
                if (gy > max_gy) max_gy = gy;
            }
        }
    }

    if (griglia.size === 0) {
        console.warn("nessuna tile solida nel layer 'collesioni'");
        return;
    }

    const rettangoli = genera_rettangoli_da_griglia(griglia, min_gx, min_gy, max_gx, max_gy);

    rettangoli.forEach((r) => {
        const px = r.gx * TILE_SIZE;
        const py = r.gy * TILE_SIZE;
        const larghezza_px = r.larghezza * TILE_SIZE;
        const altezza_px = r.altezza * TILE_SIZE;

        blocci_con_collisioni.push(
            new blocco("traspa", px, py, larghezza_px, altezza_px)
        );
    });

    console.log(`collisioni mappa: ${griglia.size} tile -> ${rettangoli.length} rettangoli (blocchi "traspa")`);

    // ricostruisce la griglia a celle usata da blocchi_vicini() con i nuovi blocchi
    griglia_collisioni.clear();
    costruisci_griglia();
}

//fine caricameto collisioni



const grandezza_blocci = 24;


const blocci_bac_grand = [
    new blocco("mappa1", 0, 0, 7680, 7680),


    
    
];

function creaBarriere() {
    return [
        new blocco("porta_C", 3*TILE_SIZE+12, 8*TILE_SIZE, 3*40, 162),
        new blocco("muro_separatore", 20*TILE_SIZE, 19*TILE_SIZE, TILE_SIZE/2, 3*TILE_SIZE),
        new blocco("porta_C", 31*TILE_SIZE+12, 26*TILE_SIZE, 3*40, 162),
        new blocco("porta_C", 35*TILE_SIZE+12, 6*TILE_SIZE, 3*40, 162),
        new blocco("muro_separatore", 39*TILE_SIZE, 16*TILE_SIZE, TILE_SIZE/2, 3*TILE_SIZE)
    ];
}
const blocci_con_collisioni = creaBarriere();

const blocci_sovraimpressione = [
    new blocco("fuoco", 400, 300, 60, 60),

];

var magie = [];

var magie_nemiche = [];


var nemici = [];
let statoStanza = 'attesa';
let scadenzaEvocazione = 0;
let puntiEvocazione = [];
function nelRifugio(entita) {
    return entita.x < 960 && entita.y < 600;
}

var fase = 0;
function controlla_fase(){
    if (areeCombattimento[fase] && statoStanza !== 'attiva') {
        if (!dentroArea(player, areeCombattimento[fase])) { statoStanza = 'attesa'; puntiEvocazione = []; return; }
        if (statoStanza === 'attesa') {
            puntiEvocazione = preparaEvocazioni();
            scadenzaEvocazione = tempoGioco + 1500;
            statoStanza = 'preavviso';
            avvisa('Nemici in arrivo! Allontanati dai cerchi luminosi.');
            return;
        }
        if (tempoGioco < scadenzaEvocazione) return;
        generaNemiciFase(); statoStanza = 'attiva'; return;
    }
    if (nemici.length > 0) return;

    premiaStanza(fase);
    if (fase >= 5) return;

    for (let i = 0; i < blocci_con_collisioni.length; i++) {

        if (blocci_con_collisioni[i].nome == "porta_C"){

            fase++;
            audioGioco.effetto('porta');
            blocci_bac_grand.push(new blocco("porta_A", blocci_con_collisioni[i].x, blocci_con_collisioni[i].y, blocci_con_collisioni[i].lx, blocci_con_collisioni[i].ly));

            blocci_con_collisioni.splice(i,1);
            
            griglia_collisioni.clear();
            costruisci_griglia();

            break;
        }
        if (blocci_con_collisioni[i].nome == "muro_separatore"){

            fase++;
            audioGioco.effetto('porta');
            blocci_con_collisioni.splice(i,1);
            
            griglia_collisioni.clear();
            costruisci_griglia();

            break;
        }

        if (i >= blocci_con_collisioni.length-1){
            return 1;
        }
        
    }
    

    statoStanza = 'attesa';
    if (fase === 3) obiettivoGuida = { x: 1570, y: 1560 };
}

function generaNemiciFase() {
    switch (fase) {
        case 1:
            for (let i = 0; i < 2; i++) 
            nemici.push({
                HP: 90,
                max_HP: 90,
                nemico: new blocco("drago", 273+(i*10), 900, 100, 70),
                camminata: 1,
                corsa: 2,
                vista: 300,
                danno: 1,

                magie: [0, 1, 2, 3, 4],
                i: 0,
                max_delay: 210,
                delay: 0,
                moltiplicatore_magico: 2,
                moltiplicatore_delay_magie: 1,
                MP: 0,
                max_MP: 100,
                regen_MP: 0.2,

            });
            
            break;
        case 2:
            for (let i = 0; i < 3; i++) 
            nemici.push({
                HP: 90,
                max_HP: 90,
                nemico: new blocco("drago", 1500+(i*10), 900, 100, 70),
                camminata: 1,
                corsa: 2,
                vista: 300,
                danno: 1,

                magie: [0, 1, 2, 3, 4],
                i: 0,
                max_delay: 210,
                delay: 0,
                moltiplicatore_magico: 2,
                moltiplicatore_delay_magie: 1,
                MP: 0,
                max_MP: 100,
                regen_MP: 0.2,

            });
            
            break;
        case 3:
            // La stanza meridionale è riservata ai tesori, senza combattimenti.
            obiettivoGuida = { x: 1570, y: 1560 };
            break;
        case 4:
            for (let i = 0; i < 5; i++) 
            nemici.push({
                HP: 90,
                max_HP: 90,
                nemico: new blocco("drago", 1700+(i*10), 100, 100, 70),
                camminata: 1,
                corsa: 2,
                vista: 300,
                danno: 1,
    
                magie: [0, 1, 2, 3, 4],
                i: 0,
                max_delay: 210,
                delay: 0,
                moltiplicatore_magico: 2,
                moltiplicatore_delay_magie: 1,
                MP: 0,
                max_MP: 100,
                regen_MP: 0.2,

            });
            
            break;
        case 5:
            nemici.push({
                boss: true,
                HP: 480,
                max_HP: 480,
                nemico: new blocco("mago", 2500, 800, 120, 120, 20, 20, 20, 20),
                camminata: 2,
                corsa: 4,
                vista: 300,
                danno: 1.5,
    
                magie: [0, 1, 2, 3, 4],
                i: 0,
                max_delay: 120,
                delay: 0,
                moltiplicatore_magico: 3,
                moltiplicatore_delay_magie: 0.8,
                MP: 0,
                max_MP: 300,
                regen_MP: 0.5,

            });
            
            break;
    
        default:
            break;
    }
    for (const nemico of nemici) {
        if (nemico.preparato) continue;
        nemico.preparato = true;
        nemico.area = areeCombattimento[fase];
        const corpo = nemico.nemico;
        corpo.d_sin = corpo.d_des = (corpo.lx - 40) / 2;
        corpo.d_sop = corpo.ly - 28; corpo.d_sot = 4;
        const punto = puntiEvocazione[nemici.indexOf(nemico)];
        if (punto) { corpo.x = punto.x - corpo.d_sin; corpo.y = punto.y - corpo.d_sop; }
        const fattore = 1 + (piano - 1) * 0.2;
        const base = nemico.boss ? bilanciamentoNemici.boss : bilanciamentoNemici.normale;
        nemico.HP = Math.round(base.hp * fattore);
        nemico.max_delay = base.intervallo;
        nemico.delay = base.intervallo;
        nemico.danno = base.contatto;
        nemico.moltiplicatore_magico = base.moltiplicatore;
        nemico.max_HP = nemico.HP;
        nemico.danno *= fattore;
        if (nemico.moltiplicatore_magico) nemico.moltiplicatore_magico *= fattore;
    }





}


// UTILITY GEOMETRIA
function punto_in_poligono(px, py, poli) {
    let dentro = false;
    const n = poli.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = poli[i].x, yi = poli[i].y;
        const xj = poli[j].x, yj = poli[j].y;
        const interseca = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (interseca) dentro = !dentro;
    }
    return dentro;
}
function distanza_punto_punto(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}






const player = new blocco("dante", 200, 200, 50, 50, 10, 30, 10, 10);
player.set_nome_animazione("indietro_stand");

var player_speed = statisticheClasse.velocita;

var player_HP = statisticheClasse.hp;
var player_max_HP = statisticheClasse.hp;

var player_MP = statisticheClasse.mp;
var player_max_MP = statisticheClasse.mp;

var player_molt_t_magie = 1;
var player_molt_danno = 1;



// =====================
// funzione blocci vicini
// =====================
const cella_size = 100;
const griglia_collisioni = new Map();

function chiave_cella(x, y) {
    return `${Math.floor(x/cella_size)},${Math.floor(y/cella_size)}`;
}

// costruisci la griglia UNA VOLTA (i blocchi sono statici)
function costruisci_griglia() {
    blocci_con_collisioni.forEach(b => {
        const gx1 = Math.floor(b.x / cella_size);
        const gy1 = Math.floor(b.y / cella_size);
        const gx2 = Math.floor((b.x + b.lx) / cella_size);
        const gy2 = Math.floor((b.y + b.ly) / cella_size);

        for (let gx = gx1; gx <= gx2; gx++) {
            for (let gy = gy1; gy <= gy2; gy++) {
                const c = `${gx},${gy}`;
                if (!griglia_collisioni.has(c)) griglia_collisioni.set(c, []);
                griglia_collisioni.get(c).push(b);
            }
        }
    });
}
costruisci_griglia();

function blocchi_vicini(b) {
    const risultato = [];
    for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
        const c = `${Math.floor(b.x/cella_size)+dx},${Math.floor(b.y/cella_size)+dy}`;
        if (griglia_collisioni.has(c))
            risultato.push(...griglia_collisioni.get(c));
    }
    return risultato;
}
// fine



// Arma esclusiva della classe selezionata.
const armaClasse = sessione.arma;

// ======================
// INPUT WASD 
// ======================

const keys = {};
window.addEventListener('blur', () => {
    for (const key in keys) keys[key] = false;
});

window.addEventListener("keydown", (e) => {
    if (!giocoInPausa() && !["SELECT", "INPUT", "TEXTAREA"].includes(e.target.tagName)) keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

const n_tipo_magia = armaClasse.attacchi[0];
const staz_magie = [
    {
        delay: 0,
        nome: "spada1",
        grandezza: 50,
        vuoto: 0,
        tipo: "rotazione",
        raggio: 50,                 // distanza dal player (centro di rotazione)
        velocita_rotazione: 16,      // gradi per frame (positivo = senso orario)
        gradi_in_piu: (30/360)*(Math.PI*2),
        consumo: 0,
        danno: 16,
        tempo: 8,
        gradi_in_meno: (50/360)*(Math.PI*2),
    },
    {
        delay: 0,
        nome: "spada1",
        grandezza: 50,
        vuoto: 0,
        tipo: "rotazione",
        raggio: 50,                 // distanza dal player (centro di rotazione)
        velocita_rotazione: 32,      // gradi per frame (positivo = senso orario)
        gradi_in_piu: (30/360)*(Math.PI*2),
        consumo: 40,
        danno: 8,
        tempo: 100,
        gradi_in_meno: (0/360)*(Math.PI*2),
    },
    {
        delay: 200,
        nome: "effetto_di_spada1",
        grandezza: 128,
        vuoto: 16,
        tipo: "stand_raggio",
        tempo: src_blocci.effetto_di_spada1.stand.length * src_blocci.effetto_di_spada1.stand_fps,
        raggio: 64,
        consumo: 20,
        danno: 15,
    },
    {
        delay: 0,
        nome: "spada2",
        grandezza: 50,
        vuoto: 0,
        tipo: "rotazione",
        raggio: 50,                 // distanza dal player (centro di rotazione)
        velocita_rotazione: 32,      // gradi per frame (positivo = senso orario)
        gradi_in_piu: (30/360)*(Math.PI*2),
        consumo: 40,
        danno: 8,
        tempo: 100,
        gradi_in_meno: (0/360)*(Math.PI*2),
    },
    {
        delay: 0,
        nome: "spada1",
        grandezza: 32,
        vuoto: 0,
        tipo: "muv_base",
        tempo: 4,
        velocita: 16,
        consumo: 0,
        danno: 10,
        rad_in_piu: Math.PI*3/4, 
    },
    {
        delay: 100,
        nome: "taglia_vento",
        grandezza: 32,
        vuoto: 0,
        tipo: "muv_base",
        tempo: 400,
        velocita: 8,
        consumo: 10,
        danno: 10,

    },
    {
        delay: 200,
        nome: "palla_energetica_blu",
        grandezza: 64,
        vuoto: 16,
        tipo: "muv_impact",
        tempo: 400,
        velocita: 12,
        consumo: 30,
        danno: 30,

    },
    {
        delay: 200,
        nome: "mini_esplosione",
        grandezza: 64,
        vuoto: 16,
        tipo: "stand",
        tempo: 28,
        velocita: 8,
        consumo: 20,
        danno: 15,
    },
    {
        delay: 200,
        nome: "fulmine_giallo",
        x: 32,
        y: 128,
        vuoto: 32,
        tipo: "stand_dif",
        tempo: 32,
        velocita: 8,
        consumo: 20,
        danno: 15,
    },
    {
        delay: 200,
        nome: "fulmine_blu",
        x: 64,
        y: 128,
        vuoto: 64,
        tipo: "stand_dif",
        tempo: 20,
        velocita: 8,
        consumo: 30,
        danno: 25,
    },
    {
        delay: 100,
        nome: "portale_",
        tipo: "teleport",
        tempo: 40,
        consumo: 60,
    },
    
]
armaClasse.attacchi.forEach((indice, posizione) => Object.assign(staz_magie[indice], statisticheClasse.attacchi[posizione]));
staz_magie[4].tempo = 20;
staz_magie[4].velocita = 14;
staz_magie[3].tempo = 24;

const staz_magie_nemici = [
    {
        delay: 300,
        nome: "taglia_vento",
        grandezza: 32,
        vuoto: 0,
        tipo: "muv_base",
        tempo: 400,
        velocita: 8,
        consumo: 10,
        danno: 10,

    },
    {
        delay: 600,
        nome: "palla_energetica_blu",
        grandezza: 64,
        vuoto: 16,
        tipo: "muv_impact",
        tempo: 400,
        velocita: 12,
        consumo: 30,
        danno: 30,

    },
    {
        delay: 600,
        nome: "mini_esplosione",
        grandezza: 64,
        vuoto: 16,
        tipo: "stand",
        tempo: 28,
        velocita: 8,
        consumo: 20,
        danno: 15,
    },
    {
        delay: 600,
        nome: "fulmine_giallo",
        x: 32,
        y: 128,
        vuoto: 32,
        tipo: "stand_dif",
        tempo: 32,
        velocita: 8,
        consumo: 20,
        danno: 15,
    },
    {
        delay: 600,
        nome: "fulmine_blu",
        x: 64,
        y: 128,
        vuoto: 64,
        tipo: "stand_dif",
        tempo: 20,
        velocita: 8,
        consumo: 30,
        danno: 25,
    },
    
]

// Danni nemici moderati e preavviso visibile prima delle magie.
const danniMagieNemiche = [10, 16, 12, 12, 16];
danniMagieNemiche.forEach((danno, indice) => {
    staz_magie_nemici[indice].danno = danno;
    staz_magie_nemici[indice].delay = Math.max(700, staz_magie_nemici[indice].delay);
});

var in_magia = false;

function lancia(e, scelta=n_tipo_magia) {
    if (giocoInPausa() || !e) return;


    const rect = canvas.getBoundingClientRect();

    const x_mouse = (e.clientX - rect.left) * canvas.width  / rect.width;
    const y_mouse = (e.clientY - rect.top)  * canvas.height / rect.height;

    const world_x = x_mouse + telecamera.x;
    const world_y = y_mouse + telecamera.y;

    mouse_x = world_x;
    mouse_y = world_y;




    let mom2;

    const staz_magia_mom = staz_magie[scelta];//staz_magie[n_tipo_magia];
    if (tempoGioco < (recuperoAttacchi[scelta] || 0)) return;
    const danno_magia_mom = staz_magia_mom.danno * player_molt_danno;
    //staz_magia_mom.danno *= player_molt_danno;



    if (staz_magia_mom.tipo == "teleport"){
        mom2 = {   
            magia: new blocco(staz_magia_mom.nome+"rosso", world_x-player.lx/2-20, world_y-player.ly/2, player.lx, player.ly,  player.d_sin+20, player.d_sop, player.d_des-20, player.d_sot),
            tempo: staz_magia_mom.tempo,
            collider: false,
        }
        mom2.magia.radianti = Math.PI;
        let portale_collide = false;
        blocchi_vicini(mom2.magia).forEach((e) => {
        if (e.if_collide(mom2.magia))
            portale_collide = true;
        });
        if (portale_collide){
            document.getElementById("spunta").textContent = "punto di teletrasporto non valido";
            return;
        }
    }
    
    let mom = {};
    if (staz_magia_mom.consumo > player_MP){
        document.getElementById("spunta").textContent = testoGioco('Mana insufficiente');
        return;
    }
    if (in_magia){
        document.getElementById("spunta").textContent = testoGioco('Abilità già in corso');
        return;
    }
    else
        player_MP -= staz_magia_mom.consumo;


    let dif_x;
    let dif_y;
    let distanza;

    recuperoAttacchi[scelta] = tempoGioco + (staz_magia_mom.recupero || 400);
    if (nemici.some(n => n.HP > 0 && Math.hypot(n.nemico.x-player.x,n.nemico.y-player.y)<650)) ultimoScambio = tempoGioco;
    const suono = sessione.classe === 'mage' ? (scelta === armaClasse.attacchi[1] ? 'energia' : 'magia') : sessione.classe === 'healer' ? 'elettrico' : 'lama';
    audioGioco.effetto(suono);
    in_magia = true;
    programmaAzione(() => {

        switch (staz_magia_mom.tipo) {
            case "rotazione":
                if (magie.filter(e => e.rotante).length > 0) break;

                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);

                mom = {
                    magia: new blocco(
                        staz_magia_mom.nome,
                        player.x + player.lx/2 - staz_magia_mom.grandezza/2,
                        player.y + player.ly/2 - staz_magia_mom.grandezza/2,
                        staz_magia_mom.grandezza, staz_magia_mom.grandezza,
                        staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto
                    ),
                    tempo: staz_magia_mom.tempo,           // non conta, la fa sparire gradi_rimanenti
                    collider: false,         // gestiamo noi il danno, niente rimozione automatica al primo colpo
                    danno: danno_magia_mom,
                    rotante: true,
                    angolo: Math.atan2(dif_y, dif_x)-staz_magia_mom.gradi_in_meno,         // angolo iniziale
                    raggio: staz_magia_mom.raggio,
                    velocita_rotazione: staz_magia_mom.velocita_rotazione * (Math.PI/180), // in radianti/frame
                    gradi_in_piu: staz_magia_mom.gradi_in_piu,
                    nemici_colpiti: [],
                };
            
                magie.push(mom);
            
                break;
            case "muv_base":
            
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, player.x+(player.lx/2)-staz_magia_mom.grandezza/2, player.y+(player.ly/2)-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: true,//si distrugge quando collide
                    danno: danno_magia_mom,
                }
            
                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);
            
                distanza = Math.max(0.001, Math.hypot(dif_x, dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magia_mom.velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magia_mom.velocita;
            
                mom.magia.radianti = Math.atan2(dif_y, dif_x) +(staz_magia_mom.rad_in_piu || 0);
                preparaPortata(mom, world_x, world_y, staz_magia_mom.velocita);
                magie.push(mom);
                
                break;
        
            case "muv_impact":

                mom = {   
                    magia: new blocco(staz_magia_mom.nome, player.x+(player.lx/2)-staz_magia_mom.grandezza/2, player.y+(player.ly/2)-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: true,//si distrugge quando collide
                    danno: danno_magia_mom,
                    impact: true,//con animazione
                }
            
                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);
            
                distanza = Math.max(0.001, Math.hypot(dif_x, dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magia_mom.velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magia_mom.velocita;
            
                mom.magia.radianti = Math.atan2(dif_y, dif_x) +(staz_magia_mom.rad_in_piu || 0);
                preparaPortata(mom, world_x, world_y, staz_magia_mom.velocita);
                magie.push(mom);

                break;
            case "stand_raggio":

                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);
            
                distanza = Math.max(0.001, Math.hypot(dif_x, dif_y));


                let punto_x = (player.x+player.lx/2)+(staz_magia_mom.raggio* dif_x/distanza);
                let punto_y = (player.y+player.ly/2)+(staz_magia_mom.raggio* dif_y/distanza);
                    
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, punto_x-staz_magia_mom.grandezza/2, punto_y-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: false,
                }
                nemici.forEach((n, i) => {
                    if (mom.magia.if_collide(n.nemico))
                        danneggiaNemico(n, danno_magia_mom);
                })
                mom.magia.radianti = Math.atan2(dif_y, dif_x);
                
                magie.push(mom);
                break;
            case "stand":
                    
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, world_x-staz_magia_mom.grandezza/2, world_y-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: false,
                }
                nemici.forEach((n, i) => {
                    if (mom.magia.if_collide(n.nemico))
                        danneggiaNemico(n, danno_magia_mom);
                })
                
                magie.push(mom);
                break;
            case "stand_dif":
                {
                const bersaglio = sessione.classe === 'healer' ? miraGuaritore(world_x, world_y) : { x: world_x, y: world_y };
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, bersaglio.x-staz_magia_mom.x/2, bersaglio.y-staz_magia_mom.y, staz_magia_mom.x, staz_magia_mom.y, 0, staz_magia_mom.vuoto, 0, 0),
                    tempo: staz_magia_mom.tempo,
                    collider: false,
                }
                nemici.forEach((n, i) => {
                    const entroRaggio = sessione.classe !== 'healer' || Math.hypot(n.nemico.x + n.nemico.lx/2 - player.x - player.lx/2, n.nemico.y + n.nemico.ly/2 - player.y - player.ly/2) <= raggioGuaritore;
                    if (entroRaggio && mom.magia.if_collide(n.nemico))
                        danneggiaNemico(n, danno_magia_mom);
                })
                
                magie.push(mom);
                break;
                }

            case "teleport":

            mom = {   
                magia: new blocco(staz_magia_mom.nome+"blu", player.x+20, player.y, player.lx, player.ly,                          player.d_sin-20, player.d_sop, player.d_des+20, player.d_sot),
                tempo: staz_magia_mom.tempo,
                collider: false,
            }
            player.x = mom2.magia.x+20;
            player.y = mom2.magia.y;

            
            magie.push(mom);
            magie.push(mom2);


                break;
    
            default:
                break;
        }
    

        in_magia = false;
    }, staz_magia_mom.delay *player_molt_t_magie);
}

var e_di_mouse;

canvas.addEventListener("click", (e) => {
    lancia(e, armaClasse.attacchi[0]);
});

document.addEventListener("keydown", (tasto) => {
    if (tasto.key.toLowerCase() == "q" && e_di_mouse && !tasto.repeat && !giocoInPausa()){
        console.log("q premuto");
        lancia(e_di_mouse, armaClasse.attacchi[1]);
    }
});



var mouse_x;
var mouse_y;
window.addEventListener("mousemove", (e) => {
    e_di_mouse = e;


    const rect = canvas.getBoundingClientRect();

    const x_mouse = (e.clientX - rect.left) * canvas.width  / rect.width;
    const y_mouse = (e.clientY - rect.top)  * canvas.height / rect.height;

    const world_x = x_mouse + telecamera.x;
    const world_y = y_mouse + telecamera.y;

    mouse_x = world_x;
    mouse_y = world_y;
});



function line(x1, y1, x2, y2, spessore = 1) {

    x1 = x1 - telecamera.x;
    x2 = x2 - telecamera.x;
    y1 = y1 - telecamera.y;
    y2 = y2 - telecamera.y;

    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = spessore;
    ctx.stroke();
}

var ID_rosso = 0;
const disegno_magie = [];
function nemico_lancia_magia(n) {
    if (nelRifugio(player) || dentroArea(player, areaTesoro)) return;

    

    if (staz_magie_nemici[n.magie[n.i]].consumo > n.MP)
        return;
    
    n.MP -= staz_magie_nemici[n.magie[n.i]].consumo;
    audioGioco.effetto('mostro');

    ID_rosso++;
    if (ID_rosso == Infinity)
        ID_rosso = 0;
    let id_mom = ID_rosso;

    switch (staz_magie_nemici[n.magie[n.i]].tipo) {

        case "muv_base":
        case "muv_impact":
            disegno_magie.push({
                ID: ID_rosso,
                tipo: staz_magie_nemici[n.magie[n.i]].tipo,
                array: [n.nemico.x+ (n.nemico.lx/2), n.nemico.y+(n.nemico.ly/2), player.x+(player.lx/2), player.y+(player.ly/2), staz_magie_nemici[n.magie[n.i]].grandezza],
            });
            
            break;
        case "stand":
            disegno_magie.push({
                ID: ID_rosso,
                tipo: staz_magie_nemici[n.magie[n.i]].tipo,
                array: [player.x +player.lx/2 -staz_magie_nemici[n.magie[n.i]].grandezza/2 + staz_magie_nemici[n.magie[n.i]].vuoto, player.y +player.ly/2 -staz_magie_nemici[n.magie[n.i]].grandezza/2 +staz_magie_nemici[n.magie[n.i]].vuoto, staz_magie_nemici[n.magie[n.i]].grandezza -staz_magie_nemici[n.magie[n.i]].vuoto*2, staz_magie_nemici[n.magie[n.i]].grandezza -staz_magie_nemici[n.magie[n.i]].vuoto*2],
            });
            
            break;
        case "stand_dif":
            disegno_magie.push({
                ID: ID_rosso,
                tipo: staz_magie_nemici[n.magie[n.i]].tipo,
                array: [player.x+player.lx/2 -staz_magie_nemici[n.magie[n.i]].x/2, player.y + player.ly -staz_magie_nemici[n.magie[n.i]].y +staz_magie_nemici[n.magie[n.i]].vuoto, staz_magie_nemici[n.magie[n.i]].x, staz_magie_nemici[n.magie[n.i]].y -staz_magie_nemici[n.magie[n.i]].vuoto],
            });
            
            break;
    
        default:
            break;
    } 
    
    let mom = {};

    let dif_x;
    let dif_y;
    let distanza;

    let numero_magia = n.magie[n.i];
    
    programmaAzione(() => {
        let indice = disegno_magie.findIndex(e => id_mom === e.ID);
        if (indice == -1) return;
        if (nelRifugio(player) || dentroArea(player, areaTesoro) || n.HP <= 0 || n.da_rimuovere) {
            disegno_magie.splice(indice, 1);
            return;
        }

        switch (staz_magie_nemici[numero_magia].tipo) {
            case "muv_base":
            
                mom = {   
                    magia: new blocco(staz_magie_nemici[numero_magia].nome, disegno_magie[indice].array[0] -staz_magie_nemici[numero_magia].grandezza/2, disegno_magie[indice].array[1] -staz_magie_nemici[numero_magia].grandezza/2, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, ),
                    tempo: staz_magie_nemici[numero_magia].tempo,
                    collider: true,//si distrugge quando collide
                    danno: staz_magie_nemici[numero_magia].danno *n.moltiplicatore_magico,
                }
            
                
                dif_x = disegno_magie[indice].array[2] - disegno_magie[indice].array[0];
                dif_y = disegno_magie[indice].array[3] - disegno_magie[indice].array[1];
            
                distanza = Math.max(0.001, Math.hypot(dif_x, dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magie_nemici[numero_magia].velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magie_nemici[numero_magia].velocita;
            
                mom.magia.radianti = Math.atan2(dif_y, dif_x);
                magie_nemiche.push(mom);
                
                break;
        
            case "muv_impact":

                mom = {   
                    magia: new blocco(staz_magie_nemici[numero_magia].nome, disegno_magie[indice].array[0] -staz_magie_nemici[numero_magia].grandezza/2, disegno_magie[indice].array[1] -staz_magie_nemici[numero_magia].grandezza/2, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, ),
                    tempo: staz_magie_nemici[numero_magia].tempo,
                    collider: true,//si distrugge quando collide
                    danno: staz_magie_nemici[numero_magia].danno *n.moltiplicatore_magico,
                    impact: true,//con animazione
                }
            
                dif_x = disegno_magie[indice].array[2] - disegno_magie[indice].array[0];
                dif_y = disegno_magie[indice].array[3] - disegno_magie[indice].array[1];
            
                distanza = Math.max(0.001, Math.hypot(dif_x, dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magie_nemici[numero_magia].velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magie_nemici[numero_magia].velocita;
            
                mom.magia.radianti = Math.atan2(dif_y, dif_x);
                magie_nemiche.push(mom);

                break;
            case "stand":
                    
                mom = {   
                    magia: new blocco(staz_magie_nemici[numero_magia].nome, disegno_magie[indice].array[0] -staz_magie_nemici[numero_magia].vuoto, disegno_magie[indice].array[1] -staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].grandezza, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].vuoto, ),
                    tempo: staz_magie_nemici[numero_magia].tempo,
                    collider: false,
                }
                
                if (mom.magia.if_collide(player))
                    danneggiaGiocatore(staz_magie_nemici[numero_magia].danno * n.moltiplicatore_magico);
                
                magie_nemiche.push(mom);
                break;
            case "stand_dif":
                    
                mom = {   
                    magia: new blocco(staz_magie_nemici[numero_magia].nome, disegno_magie[indice].array[0], disegno_magie[indice].array[1] -staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].x, staz_magie_nemici[numero_magia].y, 0, staz_magie_nemici[numero_magia].vuoto, 0, 0),
                    tempo: staz_magie_nemici[numero_magia].tempo,
                    collider: false,
                }

                if (mom.magia.if_collide(player))
                    danneggiaGiocatore(staz_magie_nemici[numero_magia].danno * n.moltiplicatore_magico);
                    
                magie_nemiche.push(mom);
                break;
    
            default:
                break;
        }
    
        disegno_magie.splice(indice, 1);
        

    }, staz_magie_nemici[numero_magia].delay * n.moltiplicatore_delay_magie)

    n.i++;
    if (n.i >= n.magie.length)
        n.i = 0;
}




const ofset_telecamera = 100;

function muovi_telecamera() {
    let differenza_x = 0;
    let differenza_y = 0;
    if (player.x < ofset_telecamera + telecamera.x) {
        differenza_x = telecamera.x + ofset_telecamera - player.x;
    }
    else if (player.get_destra() > canvas.width - ofset_telecamera + telecamera.x) {
        differenza_x = telecamera.x + canvas.width - ofset_telecamera - player.get_destra();
    }

    if (player.y < ofset_telecamera + telecamera.y) {
        differenza_y = telecamera.y + ofset_telecamera - player.y;
    }
    else if (player.get_basso() > canvas.height - ofset_telecamera + telecamera.y) {
        differenza_y =telecamera.y + canvas.height - ofset_telecamera - player.get_basso();
    }


    //canvas.width, canvas.height

    telecamera.x -= differenza_x;
    telecamera.y -= differenza_y;
    mouse_x -= differenza_x;
    mouse_y -= differenza_y;
    
}



const nemici_uccisi = {};
function aggiungi_nemico(n) {

    ricompensaNemico(n);
    if (n.nemico.nome in nemici_uccisi)
        nemici_uccisi[n.nemico.nome]++;
    else
        nemici_uccisi[n.nemico.nome] = 1;
}

// ======================
// GAME LOOP
// ======================

var scatto_caricato = true;
const posizione_scatto = {x:0, y:0};

function update() {
    if (player_HP <= 0) { player_HP = 0; apriFinestra('morte'); return; }
    controlla_fase();

    //=======================================================================
    //  player
    //=======================================================================

    //if (!keys["q"] || !scatto_caricato){    
        player.vy = ((keys["s"] || 0) - (keys["w"] || 0)) * player_speed * (!keys["shift"] || 1.5);
        player.vx = ((keys["d"] || 0) - (keys["a"] || 0)) * player_speed * (!keys["shift"] || 1.5);
    /*}
    else{
        player.vy = ((keys["s"] || 0) - (keys["w"] || 0)) * player_speed*8;
        player.vx = ((keys["d"] || 0) - (keys["a"] || 0)) * player_speed*8;
        scatto_caricato = false;
        posizione_scatto.x = player.xy;
        posizione_scatto.y = player.y;
        programmaAzione(() => {
            scatto_caricato = true;
        }, 1000);
    }*/
   player.vx *= !in_magia;
   player.vy *= !in_magia;

    let playerAnimation = player.nome_animazione.replace('_stand', '');
    if (player.vx > 0) {
        playerAnimation = "destra";
    }
    else if (player.vx < 0) {
        playerAnimation = "sinistra";
    }
    else if (player.vy > 0) {
        playerAnimation = "indietro";
    }
    else if (player.vy < 0) {
        playerAnimation = "avanti";
    }
    if (player.vx === 0 && player.vy === 0) playerAnimation += '_stand';
    if (playerAnimation !== player.nome_animazione) {
        player.set_nome_animazione(playerAnimation);
    }

    blocchi_vicini(player).forEach((e) => {
        player.fisica_qubo(e);
    });
    
    player.add_gradi((keys["p"]||0)-(keys["o"]||0));
    
    rigeneraRisorse();

    nemici.forEach((n) => {
        if (n.HP > 0 && player.if_collide(n.nemico) && tempoGioco >= (n.prossimoContatto || 0)){
            n.prossimoContatto = tempoGioco + 1200;
            danneggiaGiocatore(n.danno);
        }
    });
    
    if (player_HP <= 0) { player_HP = 0; apriFinestra("morte"); return; }

    //      fine player



    //=======================================================================
    //  aggiorna
    //=======================================================================  


    //rotazione magie rotazione
    // gestione magie rotanti (spada attorno al player)
    magie.forEach((m) => {
        if (!m.rotante) return;

        m.angolo += m.velocita_rotazione;
        //m.gradi_rimanenti -= Math.abs(m.velocita_rotazione);

        // posizione sul cerchio attorno al player
        m.magia.x = player.x + player.lx/2 + Math.cos(m.angolo) * m.raggio - m.magia.lx/2;
        m.magia.y = player.y + player.ly/2 + Math.sin(m.angolo) * m.raggio - m.magia.ly/2;

        // orienta la spada come un raggio che punta verso fuori (cambia +Math.PI/2 a piacere)
        m.magia.radianti = m.angolo + Math.PI/2 + m.gradi_in_piu;

        // Ogni attacco rotante colpisce ciascun nemico una sola volta.
        nemici.forEach((n) => {
            if (m.magia.if_collide(n.nemico) && !m.nemici_colpiti.includes(n)) {
                danneggiaNemico(n, m.danno);
                m.nemici_colpiti.push(n);

            }
        });

        //if (m.gradi_rimanenti <= 0)
        //    m.da_rimuovere = true;
    });



    //distruzione magie blocci
    magie.forEach((m, i) => {
        blocchi_vicini(m.magia).forEach((e) => {

            if (m.collider) {
                if (m.magia.if_collide(e) && m.magia.nome_animazione !== "impact"){
                    if (m.impact){
                        m.magia.set_nome_animazione("impact");
                        m.magia.vx = 0;
                        m.magia.vy = 0;
                    }
                    else
                        m.da_rimuovere = true;
                }
            }
        })
    });
    magie_nemiche.forEach((mn, i) => {
        blocchi_vicini(mn.magia).forEach((e) => {

            if (mn.collider) {
                if (mn.magia.if_collide(e) && mn.magia.nome_animazione !== "impact"){

                    if (mn.impact){
                        mn.magia.set_nome_animazione("impact");
                        mn.magia.vx = 0;
                        mn.magia.vy = 0;
                    }
                    else
                        mn.da_rimuovere = true;
                }
            }
        })
    });



    blocci_sovraimpressione.forEach((e) => {
        e.aggiorna();
    });
    
    
    //danno nemici
    nemici.forEach((e, i_n) => {
        magie.forEach((m, i) => {
            if (m.collider && !m.da_rimuovere) {
                if (m.magia.if_collide(e.nemico) && m.magia.nome_animazione !== "impact"){
                    danneggiaNemico(e, m.danno);
                    if (m.impact){
                        m.magia.set_nome_animazione("impact");
                        m.magia.vx = 0;
                        m.magia.vy = 0;
                    }
                    else
                        m.da_rimuovere = true;
                }
            }
        });
        aggiornaNavigazioneNemico(e);

    })

    //danno player magie
    magie_nemiche.forEach((mn, i) => {
        if (mn.collider) {
            if (!nelRifugio(player) && !dentroArea(player, areaTesoro) && mn.magia.if_collide(player) && mn.magia.nome_animazione !== "impact"){
                danneggiaGiocatore(mn.danno);
                if (mn.impact){
                    mn.magia.set_nome_animazione("impact");
                    mn.magia.vx = 0;
                    mn.magia.vy = 0;
                }
                else
                    mn.da_rimuovere = true;
            }
        }
    });

    nemici.forEach((n) => {
        blocchi_vicini(n.nemico).forEach((e) => {
            n.nemico.fisica_qubo(e);
        })
    })

    nemici.forEach((e) => {
        if ("delay" in e)
            e.delay--;

        if (e.MP <= e.max_MP){
            e.MP += e.regen_MP;
            if (e.MP > e.max_MP)
                e.MP = e.max_MP;
        }
        if (e.HP <= 0) {
            e.da_rimuovere = true;
            aggiungi_nemico(e);
        }


        const posizionePrecedente = { x: e.nemico.x, y: e.nemico.y };
        e.nemico.aggiorna();
        if (e.area && !dentroArea({x:e.nemico.x+e.nemico.d_sin,y:e.nemico.y+e.nemico.d_sop}, e.area)) {
            e.nemico.x = posizionePrecedente.x; e.nemico.y = posizionePrecedente.y;
        }
        // I nemici non possono entrare nel rifugio iniziale.

    })
    
    player.aggiorna();

    blocci_bac_grand.forEach((e) => {
        e.aggiorna();
    })
    blocci_con_collisioni.forEach((e) => {
        e.aggiorna();
    });

    
    //despouning magie
    magie.forEach((m) => {
        m.tempo--;
        avanzaMagia(m);
        if (m.collider && m.impact && m.magia.nome_animazione === "impact")
            if (m.magia.if_fine_animazione()) m.da_rimuovere = true;
        if (m.tempo <= 0) m.da_rimuovere = true;
    });
    
    magie_nemiche.forEach((mn, i) => {
        mn.tempo--;
        mn.magia.aggiorna();
        if (mn.collider && mn.impact && mn.magia.nome_animazione === "impact")
            if (mn.magia.if_fine_animazione()) mn.da_rimuovere = true;
        if (mn.tempo <= 0) mn.da_rimuovere = true;
    })

    magie = magie.filter(m => !m.da_rimuovere);
    magie_nemiche = magie_nemiche.filter(mn => !mn.da_rimuovere);
    nemici = nemici.filter(n => n.HP > 0 && !n.da_rimuovere);



    aggiornaAmbiente();
    if (player_HP <= 0) { player_HP = 0; apriFinestra("morte"); }
    muovi_telecamera();
}

function draw() {



    // pulizia schermo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    

    blocci_bac_grand.forEach((e) => {
        e.disegna();
    });



    blocci_con_collisioni.forEach((e) => {
        if (player.get_basso() >= e.get_basso())
            e.disegna();
    })

    disegnaAmbientazione();
    player.disegna();

    blocci_con_collisioni.forEach((e) => {
        if (player.get_basso() < e.get_basso())
            e.disegna();
    })


    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    nemici.forEach((e) => {
        e.nemico.disegna();
        if (e.colpitoFino > tempoGioco) {
            ctx.save(); ctx.fillStyle = 'rgba(255,235,180,.28)';
            ctx.fillRect(e.nemico.x-telecamera.x,e.nemico.y-telecamera.y,e.nemico.lx,e.nemico.ly); ctx.restore();
        }
        
        ctx.fillRect(e.nemico.x -telecamera.x, e.nemico.get_basso()+10 -telecamera.y, e.nemico.lx*e.HP/e.max_HP, 10);
        if (e.magie !== undefined){
            ctx.fillStyle = "rgba(0, 0, 255, 1)";
            ctx.fillRect(e.nemico.x -telecamera.x, e.nemico.get_basso()+25 -telecamera.y, e.nemico.lx*e.MP/e.max_MP, 10);
            ctx.fillStyle = "rgba(255, 0, 0, 1)";
        }
    })




    blocci_sovraimpressione.forEach((e) => {
        e.disegna();
    })
    magie.forEach((m) => {
        m.magia.disegna();
    })
    magie_nemiche.forEach((mn) => {
        mn.magia.disegna();
    })

    disegnaGuida();
    disegnaNumeriDanno();

    //grigio la magia selezionata
    //scatto
    //rosso magia che sta per avvenire
    {
        ctx.fillStyle = "rgba(188, 188, 188, 0.3)";
        ctx.strokeStyle = "rgba(188, 188, 188, 0.3)";
        switch (staz_magie[n_tipo_magia].tipo) {

            case "muv_base":      
            case "muv_impact":
                {
                    const mira = fineMiraClasse(mouse_x, mouse_y);
                    line(player.x+player.lx/2, player.y+player.ly/2, mira.x, mira.y, staz_magie[n_tipo_magia].grandezza);
                }

                break;
            case "stand":
                ctx.fillRect(mouse_x-telecamera.x -staz_magie[n_tipo_magia].grandezza/2 + staz_magie[n_tipo_magia].vuoto, mouse_y-telecamera.y -staz_magie[n_tipo_magia].grandezza/2 +staz_magie[n_tipo_magia].vuoto, staz_magie[n_tipo_magia].grandezza -staz_magie[n_tipo_magia].vuoto*2, staz_magie[n_tipo_magia].grandezza -staz_magie[n_tipo_magia].vuoto*2);

                break;
            case "stand_dif":
                {
                const mira = sessione.classe === 'healer' ? miraGuaritore(mouse_x, mouse_y) : { x: mouse_x, y: mouse_y };
                if (sessione.classe === 'healer') {
                    ctx.beginPath(); ctx.arc(player.x + player.lx/2 - telecamera.x, player.y + player.ly/2 - telecamera.y, raggioGuaritore, 0, Math.PI * 2); ctx.stroke();
                }
                ctx.fillRect(mira.x-telecamera.x -staz_magie[n_tipo_magia].x/2, mira.y-telecamera.y -staz_magie[n_tipo_magia].y +staz_magie[n_tipo_magia].vuoto, staz_magie[n_tipo_magia].x, staz_magie[n_tipo_magia].y -staz_magie[n_tipo_magia].vuoto);
                break;
                }
            case "teleport":
                ctx.fillRect(player.x -telecamera.x, player.y -telecamera.y, player.lx, player.ly);
                ctx.fillRect(mouse_x-telecamera.x - 25, mouse_y-telecamera.y - 25, player.lx, player.ly);


                break;            



        
            default:
                break;
        }
    
        if (!scatto_caricato) {
            ctx.fillStyle = "rgba(39, 248, 255, 0.5)";
            ctx.fillRect(posizione_scatto.x -telecamera.x, posizione_scatto.y -telecamera.y, player.lx, player.ly);
        }
    
        //ctx.fillRect(mouse_x-telecamera.x-30, mouse_y-telecamera.y-30, 60, 60);
    
        
        disegno_magie.forEach((e) => {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            switch (e.tipo) {

                case "muv_base":      
                case "muv_impact":
                    line(e.array[0], e.array[1], e.array[2], e.array[3], e.array[4]);

                    break;
                case "stand":
                    ctx.fillRect(e.array[0] -telecamera.x, e.array[1] -telecamera.y, e.array[2], e.array[3]);

                    break;
                case "stand_dif":
                    ctx.fillRect(e.array[0] -telecamera.x, e.array[1] -telecamera.y, e.array[2], e.array[3]);
                
                    break;
               
                default:
                    break;

            }
        })
    
    }

}

let frames = 0;
let ultimoFotogramma = performance.now();
let accumulatore = 0;
const passoSimulazione = 1000 / 60;
function gameLoop(adesso = performance.now()) {
    const delta = Math.min(100, adesso - ultimoFotogramma);
    ultimoFotogramma = adesso;
    if (!giocoInPausa()) {
        accumulatore += delta;
        while (accumulatore >= passoSimulazione && !giocoInPausa()) {
            aggiornaTempo(passoSimulazione);
            update();
            accumulatore -= passoSimulazione;
            frames++;
        }
    } else accumulatore = 0;
    draw();
    aggiornaInterfaccia();
    audioGioco.aggiorna();
    requestAnimationFrame(gameLoop);
}

// ======================
// AVVIO
// ======================

Promise.all([assetsReady, ambientazioneReady, carica_collisioni_mappa()]).then(() => {
    preparaAmbiente();
    pronto = true;
    disegnaCella(document.getElementById('coin-icon').getContext('2d'), 'rpg_icons', 0, 0, 0, 24);
    document.getElementById('loading').hidden = true;
    apriFinestra('comandi');
    gameLoop();
}).catch(error => {
    console.error(error);
    document.getElementById('loading-message').textContent =
        `Avvio non riuscito. ${error.message}. Avvia il progetto con un server HTTP (vedi README).`;
});
