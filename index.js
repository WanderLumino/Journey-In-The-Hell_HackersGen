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


const grandezza_blocci = 24;

//sentiero
const distanze_punti_sentiero = 10;
const largezza_sentiero = 4;
const sentiero = [];
const sentiero_rettangoli = [];
{
sentiero.push({
    x: 0, //Math.floor(random()*100),
    y: 0, //Math.floor(random()*100),
    direzione: 0
});

for (let i = 0; i < 20; i++) {
    const nuova_direzine = sentiero[i].direzione + (random() + random() + random() + random()-2)*60;//max 120 gradi
    const rad = nuova_direzine * Math.PI / 180;
    sentiero.push({
        x: sentiero[i].x + Math.floor(Math.cos(rad) * distanze_punti_sentiero),
        y: sentiero[i].y + Math.floor(Math.sin(rad) * distanze_punti_sentiero),
        direzione: nuova_direzine
    });
}


// Genera i blocchi del sentiero con larghezza
debugger;
for (let i = 0; i < sentiero.length-1; i++) {
    const mom = [];
    const rad_p = (sentiero[i+1].direzione + 90) * Math.PI / 180;
    const rad_m = (sentiero[i+1].direzione - 90) * Math.PI / 180;

    mom.push(
        {
            x: sentiero[i].x + Math.floor(Math.cos(rad_m) * largezza_sentiero),
            y: sentiero[i].y + Math.floor(Math.sin(rad_m) * largezza_sentiero),
        }
    );
    mom.push(
        {
            x: sentiero[i].x + Math.floor(Math.cos(rad_p) * largezza_sentiero),
            y: sentiero[i].y + Math.floor(Math.sin(rad_p) * largezza_sentiero),
        }
    );
    mom.push(
        {
            x: sentiero[i+1].x + Math.floor(Math.cos(rad_p) * largezza_sentiero),
            y: sentiero[i+1].y + Math.floor(Math.sin(rad_p) * largezza_sentiero),
        }
    );
    mom.push(
        {
            x: sentiero[i+1].x + Math.floor(Math.cos(rad_m) * largezza_sentiero),
            y: sentiero[i+1].y + Math.floor(Math.sin(rad_m) * largezza_sentiero),
        }
    );
    sentiero_rettangoli.push(mom);
    
}



}
console.log(sentiero);
console.log(sentiero_rettangoli);

const blocci_bac_grand = [
];
const blocci_con_collisioni = [
    new blocco("fuoco", 300, 300, 60, 60, 20, 30, 20, 10),

    new blocco("albero", 300, 100, 60, 80, 20, 50, 20, 10),
    new blocco("albero_secco", 500, 100, 80, 80, 30, 50, 30, 10),

    new blocco("fuoco", 150, 200, 50, 50),
    new blocco("fuoco", 150, 250, 50, 50),

    new blocco("albero_secco2", 0, 200, 80, 96, 15, 60, 35, 20),
];

const blocci_sovraimpressione = [
    new blocco("fuoco", 400, 300, 60, 60),
];

var magie = [
    {   
        magia: new blocco("portale_blu", 80, 20, 50, 50,     -10, 20, 30, 10),
        tempo: 2000,
        collider: true,
        danno: 10,
    },
    {   
        magia: new blocco("portale_rosso", 120, 20, 50, 50,     30, 20, -10, 10),
        tempo: 2000,
        collider: true,
        danno: 10,
    },

];
debugger
magie[1].magia.radianti = Math.PI;

var magie_nemiche = [

];


var nemici = [
    {
        HP: 300,
        max_HP: 300,
        nemico: new blocco("drago", 23, 446, 100, 70),
        camminata: 1,
        corsa: 2,
        vista: 200,
        danno: 1,
    },
]

for (let i = 0; i < 2; i++) 
    nemici.push({
        HP: 300,
        max_HP: 300,
        nemico: new blocco("drago", 373, 446, 100, 70),
        camminata: 1,
        corsa: 2,
        vista: 300,
        danno: 1,

        magie: [0, 1, 2, 3, 4],
        i: 0,
        max_delay: 100,
        delay: 0,
        moltiplicatore_magico: 2,
        moltiplicatore_delay_magie: 1,
        MP: 0,
        max_MP: 100,
        regen_MP: 0.2,
    });
    




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


//  generazione sentiero
debugger;
{
let min_gx = Infinity, min_gy = Infinity;
let max_gx = -Infinity, max_gy = -Infinity;

sentiero.forEach(p => {
    if (p.x < min_gx) min_gx = p.x;
    if (p.y < min_gy) min_gy = p.y;
    if (p.x > max_gx) max_gx = p.x;
    if (p.y > max_gy) max_gy = p.y;
});

min_gx -= largezza_sentiero + 1;
min_gy -= largezza_sentiero + 1;
max_gx += largezza_sentiero + 1;
max_gy += largezza_sentiero + 1;

// --- Fase 1: griglia booleana ---
const griglia = new Set();
const chiave = (gx, gy) => `${gx},${gy}`;

for (let gy = min_gy; gy <= max_gy; gy++) {
    for (let gx = min_gx; gx <= max_gx; gx++) {
        const cx = gx + 0.5;
        const cy = gy + 0.5;

        const in_rettangolo = sentiero_rettangoli.some(poli =>
            punto_in_poligono(cx, cy, poli)
        );
        const vicino_punto = sentiero.some(p =>
            distanza_punto_punto(cx, cy, p.x, p.y) <= largezza_sentiero
        );

        if (in_rettangolo || vicino_punto) {
            griglia.add(chiave(gx, gy));
        }
    }
}
debugger;
// --- Fase 2: scegli il blocco o scarta ---
const pieno = (gx, gy) => griglia.has(chiave(gx, gy));

ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
for (const cella of griglia) {
    const [gx, gy] = cella.split(",").map(Number);
    if ((gx == 7 || gx == 6 || gx == 5) && (gy == 10 || gy == 9))
        console.log("ciao");
    
    const T  = pieno(gx,   gy - 1);// alto
    const B  = pieno(gx,   gy + 1);// basso
    const L  = pieno(gx - 1, gy  );// sinistra
    const R  = pieno(gx + 1, gy  );// destra
    const TL = pieno(gx - 1, gy - 1);// alto-sinistra
    const TR = pieno(gx + 1, gy - 1);// alto-destra
    const BL = pieno(gx - 1, gy + 1);// basso-sinista
    const BR = pieno(gx + 1, gy + 1);// basso-destra
    
    ctx.fillRect(gx * grandezza_blocci, gy * grandezza_blocci, grandezza_blocci, grandezza_blocci);
    
    
    const n = (T?1:0) + (B?1:0) + (L?1:0) + (R?1:0);
    
    // scarta: 1 solo adiacente pieno
    if (n <= 1) continue;
    
    // scarta: 2 adiacenti pieni ma alternati (a scacchiera: angoli opposti)
    if (n === 2) {
        const opposti_diag = (T && R && !B && !L)
        || (T && L && !B && !R)
        || (B && R && !T && !L)
        || (B && L && !T && !R);
        if (opposti_diag) continue;
    }
    
    // --- scelta tipo ---
    let tipo;
    
    if (n === 4) {
        // tutti e 4 adiacenti pieni: guarda le diagonali
        if      (!TR && TL && BL && BR) tipo = "sentiero1011"; // manca alto-destra
        else if (!TL && TR && BL && BR) tipo = "sentiero0111"; // manca alto-sinistra
        else if (!BR && TL && TR && BL) tipo = "sentiero1101"; // manca basso-destra
        else if (!BL && TL && TR && BR) tipo = "sentiero1110"; // manca basso-sinistra
        else if (!TL && !TR && BR && BL) tipo = "sentiero0011";
        else if (TL && !TR && !BR && BL) tipo = "sentiero1001";
        else if (TL && TR && !BR && !BL) tipo = "sentiero1100";
        else if (!TL && TR && BR && !BL) tipo = "sentiero0110";
        else if (TL && TR && BR && BL)  tipo = "sentiero" + ((Math.ceil(random()*3)-Math.floor(random()*2)) || 1);    // tutti 8 pieni (o più mancanti → centro pieno)
        else {tipo = "fuoco"; console.error("tipo sbagliato")}
    } else if (n === 3) {
        if      (!T) tipo = "sentiero0011"; // manca sopra
        else if (!B) tipo = "sentiero1100"; // manca sotto
        else if (!R) tipo = "sentiero1001"; // manca destra
        else if (!L) tipo = "sentiero0110"; // manca sinistra
        else {tipo = "fuoco"; console.error("tipo sbagliato")}
        
    } else if (n === 2) {
        // solo coppie adiacenti (le diagonali a scacchiera già scartate sopra)
        if      (B && R) tipo = "sentiero0010"; // pieni basso e destra
        else if (B && L) tipo = "sentiero0001"; // pieni basso e sinistra
        else if (T && R) tipo = "sentiero0100"; // pieni alto e destra
        else if (T && L) tipo = "sentiero1000"; // pieni alto e sinistra
        else             continue;              // T+B o L+R: bordo dritto, scarta
    }
    
    blocci_bac_grand.push(
        new blocco(
            tipo,
            gx * grandezza_blocci,
            gy * grandezza_blocci,
            grandezza_blocci,
            grandezza_blocci
        )
    );
    blocci_bac_grand[blocci_bac_grand.length-1].disegna();
}
}





const player = new blocco("carino", 100, 100, 50, 50, 10, 20, 10, 10);
player.nome_animazione = "indietro";

var player_speed = 4;

var player_HP = 1;
var player_max_HP = 100;
var player_MP = 1;
var player_max_MP = 100;

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
        const c = chiave_cella(b.x, b.y);
        if (!griglia_collisioni.has(c)) griglia_collisioni.set(c, []);
        griglia_collisioni.get(c).push(b);
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




// ======================
// INPUT WASD 
// ======================
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});


var n_tipo_magia = 0;
const staz_magie = [
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

var in_magia = false;
canvas.addEventListener("click", (e) => {
    
    const rect = canvas.getBoundingClientRect();

    const x_mouse = (e.clientX - rect.left) * canvas.width  / rect.width;
    const y_mouse = (e.clientY - rect.top)  * canvas.height / rect.height;

    const world_x = x_mouse + telecamera.x;
    const world_y = y_mouse + telecamera.y;

    mouse_x = world_x;
    mouse_y = world_y;

    console.log(world_x, world_y);


    let mom2;

    const staz_magia_mom = staz_magie[n_tipo_magia];

    if (staz_magia_mom.tipo == "teleport"){
        mom2 = {   
            magia: new blocco(staz_magia_mom.nome+"rosso", world_x-player.lx/2-20, world_y-player.ly/2, player.lx, player.ly,  player.d_sin+20, player.d_sop, player.d_des-20, player.d_sot),
            tempo: staz_magia_mom.tempo,
            collider: false,
        }
        mom2.magia.radianti = Math.PI;
        let portale_collide = false;
        blocci_con_collisioni.forEach((e) => {
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
        document.getElementById("spunta").textContent = "MP insufficente";
        return;
    }
    if (in_magia){
        document.getElementById("spunta").textContent = "stai gia eseguendo una altra magia";
        return;
    }
    else
        player_MP -= staz_magia_mom.consumo;


    let dif_x;
    let dif_y;
    let distanza;

    in_magia = true;
    setTimeout(() => {

        switch (staz_magia_mom.tipo) {
            case "muv_base":
            
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, player.x+(player.lx/2)-staz_magia_mom.grandezza/2, player.y+(player.ly/2)-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: true,//si distrugge quando collide
                    danno: staz_magia_mom.danno,
                }
            
                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);
            
                distanza = Math.sqrt((dif_x*dif_x) + (dif_y*dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magia_mom.velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magia_mom.velocita;
            
                mom.magia.radianti = Math.atan2(dif_y, dif_x);
                magie.push(mom);
                
                break;
        
            case "muv_impact":

                mom = {   
                    magia: new blocco(staz_magia_mom.nome, player.x+(player.lx/2)-staz_magia_mom.grandezza/2, player.y+(player.ly/2)-staz_magia_mom.grandezza/2, staz_magia_mom.grandezza, staz_magia_mom.grandezza, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, staz_magia_mom.vuoto, ),
                    tempo: staz_magia_mom.tempo,
                    collider: true,//si distrugge quando collide
                    danno: staz_magia_mom.danno,
                    impact: true,//con animazione
                }
            
                dif_x = world_x - (player.x+player.lx/2);
                dif_y = world_y - (player.y+player.ly/2);
            
                distanza = Math.sqrt((dif_x*dif_x) + (dif_y*dif_y));
            
                mom.magia.vx = (dif_x/distanza) * staz_magia_mom.velocita;
                mom.magia.vy = (dif_y/distanza) * staz_magia_mom.velocita;
            
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
                        n.HP -= staz_magia_mom.danno;
                })
                
                magie.push(mom);
                break;
            case "stand_dif":
                    
                mom = {   
                    magia: new blocco(staz_magia_mom.nome, world_x-staz_magia_mom.x/2, world_y-staz_magia_mom.y, staz_magia_mom.x, staz_magia_mom.y, 0, staz_magia_mom.vuoto, 0, 0),
                    tempo: staz_magia_mom.tempo,
                    collider: false,
                }
                nemici.forEach((n, i) => {
                    if (mom.magia.if_collide(n.nemico))
                        n.HP -= staz_magia_mom.danno;
                })
                
                magie.push(mom);
                break;

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
    }, staz_magia_mom.delay)
});



window.addEventListener("wheel", (event) => {

    if (event.deltaY > 0) {
        n_tipo_magia--;
        if (n_tipo_magia < 0)
            n_tipo_magia = 0;
    }
    else {
        n_tipo_magia++;
        if (n_tipo_magia >= staz_magie.length)
            n_tipo_magia = staz_magie.length-1;
    }
    document.getElementById("selezionato").textContent = `magia numero: ${n_tipo_magia}\nnome: ${staz_magie[n_tipo_magia].nome}\ndanno: ${staz_magie[n_tipo_magia].danno}\nconsumo MP: ${staz_magie[n_tipo_magia].consumo}\ntempo di attivazione: ${staz_magie[n_tipo_magia].delay/1000}s` ;
    ``
});

var mouse_x;
var mouse_y;
window.addEventListener("mousemove", (e) => {

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
    debugger
    

    if (staz_magie_nemici[n.magie[n.i]].consumo > n.MP)
        return;
    
    n.MP -= staz_magie_nemici[n.magie[n.i]].consumo;

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
    
    setTimeout(() => {
        let indice = disegno_magie.findIndex(e => id_mom === e.ID);
        if (indice == -1) return;

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
            
                distanza = Math.sqrt((dif_x*dif_x) + (dif_y*dif_y));
            
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
            
                distanza = Math.sqrt((dif_x*dif_x) + (dif_y*dif_y));
            
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
                    player_HP -= staz_magie_nemici[numero_magia].danno *n.moltiplicatore_magico;
                
                magie_nemiche.push(mom);
                break;
            case "stand_dif":
                    
                mom = {   
                    magia: new blocco(staz_magie_nemici[numero_magia].nome, disegno_magie[indice].array[0], disegno_magie[indice].array[1] -staz_magie_nemici[numero_magia].vuoto, staz_magie_nemici[numero_magia].x, staz_magie_nemici[numero_magia].y, 0, staz_magie_nemici[numero_magia].vuoto, 0, 0),
                    tempo: staz_magie_nemici[numero_magia].tempo,
                    collider: false,
                }

                if (mom.magia.if_collide(player))
                    player_HP -= staz_magie_nemici[numero_magia].danno *n.moltiplicatore_magico;
                    
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





// ======================
// GAME LOOP
// ======================

var scatto_caricato = true;
const posizione_scatto = {x:0, y:0};

function update() {

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
        setTimeout(() => {
            scatto_caricato = true;
        }, 1000);
    }*/
   player.vx *= !in_magia;
   player.vy *= !in_magia;

    if (player.vx > 0) {
        player.nome_animazione = "destra";
    }
    else if (player.vx < 0) {
        player.nome_animazione = "sinistra";
    }
    else if (player.vy > 0) {
        player.nome_animazione = "indietro";
    }
    else if (player.vy < 0) {
        player.nome_animazione = "avanti";
    }

    blocchi_vicini(player).forEach((e) => {
        player.fisica_qubo(e);
    })
    
    player.add_gradi((keys["p"]||0)-(keys["o"]||0));
    
    //regen
    if (player_MP < player_max_MP)
        player_MP += 0.5;
    if (player_HP < player_max_HP)
        player_HP += 0.2;
    
    nemici.forEach((n) => {
        if (player.if_collide(n.nemico))
            player_HP -= n.danno;
    });
    
    if (player_HP <= 0) {}

    //      fine player



    //=======================================================================
    //  aggiorna
    //=======================================================================  

    //distruzione magie blocci
    magie.forEach((m, i) => {
        blocchi_vicini(m).forEach((e) => {

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
        blocchi_vicini(mn).forEach((e) => {

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
            if (m.collider) {
                if (m.magia.if_collide(e.nemico) && m.magia.nome_animazione !== "impact"){
                    e.HP -= m.danno;
                    if (m.impact){
                        m.magia.set_nome_animazione("impact");
                        m.magia.vx = 0;
                        m.magia.vy = 0;
                    }
                    else
                        m.da_rimuovere = true;
                    if (e.HP <= 0)
                        e.da_rimuovere = true;

                }
            }
        });
        let difx = player.x-e.nemico.x;
        let dify = player.y-e.nemico.y;

        let dist = Math.sqrt((difx*difx)+(dify*dify));
        if (dist < e.vista) {
            if (e.magie === undefined){

                e.nemico.vx = e.corsa* difx/dist;
                e.nemico.vy = e.corsa* dify/dist;
                
            }
            else {

                if (dist > e.vista*0.8){
                    e.nemico.vx = e.corsa* difx/dist;
                    e.nemico.vy = e.corsa* dify/dist;
                }
                else {
                    let dis = Math.sqrt((e.nemico.vx*e.nemico.vx)+(e.nemico.vy*e.nemico.vy));
                    
                    if (dis ==! 0){
                        e.nemico.vx = (e.nemico.vx/dis)*e.corsa;
                        e.nemico.vy = (e.nemico.vy/dis)*e.corsa;
                    }
                }

                

                debugger
                if (e.delay < 0){
                    e.delay = e.max_delay;
                    nemico_lancia_magia(e);
                }
            }
            
            
            if (Math.abs(e.nemico.vx) > Math.abs(e.nemico.vy))
                e.nemico.nome_animazione = e.nemico.vx > 0? "des" : "sin";
            else 
                e.nemico.nome_animazione = e.nemico.vy > 0? "stand" : "alto";
        }

    })

    //danno player magie
    magie_nemiche.forEach((mn, i) => {
        if (mn.collider) {
            if (mn.magia.if_collide(player) && mn.magia.nome_animazione !== "impact"){
                player_HP -= mn.danno;
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

    //camminata random
    for (let i = Math.floor(Math.random()*100); i < nemici.length; i += 100) {
        
        let angolo = Math.random()*2*Math.PI;
        nemici[i].nemico.vx = Math.cos(angolo)*nemici[i].camminata;
        nemici[i].nemico.vy = Math.sin(angolo)*nemici[i].camminata; 
        
        if (Math.abs(nemici[i].nemico.vx) > Math.abs(nemici[i].nemico.vy))
            nemici[i].nemico.nome_animazione = nemici[i].nemico.vx > 0? "des" : "sin";
        else 
            nemici[i].nemico.nome_animazione = nemici[i].nemico.vy > 0? "stand" : "alto";
    }

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

        e.nemico.aggiorna();
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
        m.magia.aggiorna();
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



    muovi_telecamera();
}


function draw() {

    //if player fermo

    if (player.vx == 0 && player.vy == 0) {
        if (!player.nome_animazione.includes("_stand")) {
            player.nome_animazione = player.nome_animazione + "_stand";
        }

    }


    // pulizia schermo
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    blocci_bac_grand.forEach((e) => {
        e.disegna();
    })


    blocci_con_collisioni.forEach((e) => {
        if (player.get_basso() >= e.get_basso())
            e.disegna();
    })

    player.disegna();

    blocci_con_collisioni.forEach((e) => {
        if (player.get_basso() < e.get_basso())
            e.disegna();
    })


    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    nemici.forEach((e) => {
        e.nemico.disegna();
        
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


    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.fillRect(10, 20, 200*(player_HP/player_max_HP), 20);
    ctx.fillStyle = "rgba(0, 0, 255, 1)";
    ctx.fillRect(10, 45, 200*(player_MP/player_max_MP), 20);



    //grigio la magia selezionata
    //scatto
    //rosso magia che sta per avvenire
    {
        ctx.fillStyle = "rgba(188, 188, 188, 0.3)";
        ctx.strokeStyle = "rgba(188, 188, 188, 0.3)";
        switch (staz_magie[n_tipo_magia].tipo) {

            case "muv_base":      
            case "muv_impact":
                line(player.x+player.lx/2, player.y+player.ly/2, mouse_x, mouse_y, staz_magie[n_tipo_magia].grandezza);

                break;
            case "stand":
                ctx.fillRect(mouse_x-telecamera.x -staz_magie[n_tipo_magia].grandezza/2 + staz_magie[n_tipo_magia].vuoto, mouse_y-telecamera.y -staz_magie[n_tipo_magia].grandezza/2 +staz_magie[n_tipo_magia].vuoto, staz_magie[n_tipo_magia].grandezza -staz_magie[n_tipo_magia].vuoto*2, staz_magie[n_tipo_magia].grandezza -staz_magie[n_tipo_magia].vuoto*2);

                break;
            case "stand_dif":
                ctx.fillRect(mouse_x-telecamera.x -staz_magie[n_tipo_magia].x/2, mouse_y-telecamera.y -staz_magie[n_tipo_magia].y +staz_magie[n_tipo_magia].vuoto, staz_magie[n_tipo_magia].x, staz_magie[n_tipo_magia].y -staz_magie[n_tipo_magia].vuoto);
                
                break;
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

let fps = 0;
let frames = 0;
let lastTime = performance.now();

function gameLoop() {

    update();
    draw();



    frames++;
    const now = performance.now();

    // aggiorna FPS ogni secondo
    if (now - lastTime >= 1000) {
        fps = frames;
        frames = 0;
        lastTime = now;
    }
    // disegna FPS
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("FPS: " + fps, 700, 30);



    requestAnimationFrame(gameLoop);
}


// ======================
// AVVIO
// ======================

gameLoop();
