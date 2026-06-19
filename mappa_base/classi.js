"use strict";

debugger;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const g64 = 64;
const g32 = 32;
const g16 = 16;

function crea_array(inizio_nome, n_min, n_max, fine_nome, salto) {
    const array = [];

    for (let i = n_min; i <= n_max; i += salto) {
        array.push(`${inizio_nome}${i}${fine_nome}`);
    }

    return array;
}

const telecamera = {x:0, y:0};



const numero_sentiero = 2*3;


const src_blocci = {
    fuoco: {
        stand: crea_array("./img/fuoco_blu/frame_", 0, 19, ".png", 1),
        stand_fps: 4,
        stand_ripeti: true,

        //attack: crea_array("./img/fuoco_attack/frame_", 0, 100, ".png", 5),
        //attack_fps: 6,
    },
    taglia_vento: {
        stand: [
            ["./img/magia/taglia_vento.png", 0, 0, g32, g32],
            ["./img/magia/taglia_vento.png", 1 *g32, 0 , g32, g32],
            ["./img/magia/taglia_vento.png", 2 *g32, 0 , g32, g32],
            ["./img/magia/taglia_vento.png", 0 *g32, 1*g32 , g32, g32],
            ["./img/magia/taglia_vento.png", 1 *g32, 1*g32 , g32, g32],
            ["./img/magia/taglia_vento.png", 2 *g32, 1*g32 , g32, g32],
        ],
        stand_fps: 4,
        stand_ripeti: true,
    },
    mini_esplosione : {
        stand: [
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 0*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 1*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 2*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 3*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 4*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 5*g64, g64, g64],
            ["./img/Foozle_Pixel_Magic_Effects/Foozle_2DE0001_Pixel_Magic_Effects/Pixel_Magic_Effects_Animations.png", 5*g64, 6*g64, g64, g64],
        ],
        stand_fps: 4,
        stand_ripeti: false,
    },
    fulmine_giallo : {
        stand: [
            ["./img/Animation_Pack/Thunder.png", 0*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 1*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 2*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 3*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 4*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 5*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 6*g64, 0, g64, 256],
            ["./img/Animation_Pack/Thunder.png", 7*g64, 0, g64, 256],
        ],
        stand_fps: 4,
        stand_ripeti: false,
    },
    fulmine_blu : {
        stand: [
            ["./img/magia/fulmine_alto.png", 0*128, 0, 128, 256],
            ["./img/magia/fulmine_alto.png", 1*128, 0, 128, 256],
            ["./img/magia/fulmine_alto.png", 2*128, 0, 128, 256],
            ["./img/magia/fulmine_alto.png", 3*128, 0, 128, 256],
            ["./img/magia/fulmine_alto.png", 4*128, 0, 128, 256],
        ],
        stand_fps: 4,
        stand_ripeti: false,
    },
    palla_energetica_blu: {
        stand: [
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 0*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 1*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 2*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 3*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 4*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 5*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 6*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 7*128, 0, 128, 128],
            ["./img/Animation_Pack/Energy ball/EnergyBall.png", 8*128, 0, 128, 128],
        ],
        stand_fps: 4,
        stand_ripeti: true,
        impact: [
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 0*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 1*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 2*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 3*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 4*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 5*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 6*128, 128, 128],
            ["./img/Animation_Pack/Energy ball/energyBallImpact.png", 0, 7*128, 128, 128],
        ],
        impact_fps: 4,
        impact_ripeti: true,
    },
    portale_rosso: {
        stand: [
            "./img/potali/portale_rosso/frame_0.png",
            "./img/potali/portale_rosso/frame_1.png",
            "./img/potali/portale_rosso/frame_2.png",
            "./img/potali/portale_rosso/frame_3.png",
            "./img/potali/portale_rosso/frame_4.png",
            "./img/potali/portale_rosso/frame_5.png",
            "./img/potali/portale_rosso/frame_6.png",
            "./img/potali/portale_rosso/frame_7.png",
        ],
        stand_fps: 6,
        stand_ripeti: true,

    },
    portale_blu: {
        stand: [
            "./img/potali/portale_blu/frame_0.png",
            "./img/potali/portale_blu/frame_1.png",
            "./img/potali/portale_blu/frame_2.png",
            "./img/potali/portale_blu/frame_3.png",
            "./img/potali/portale_blu/frame_4.png",
            "./img/potali/portale_blu/frame_5.png",
            "./img/potali/portale_blu/frame_6.png",
            "./img/potali/portale_blu/frame_7.png",
            "./img/potali/portale_blu/frame_8.png",
        ],
        stand_fps: 6,
        stand_ripeti: true,

    },
    drago: {
        stand: [
            ["./img/drago.png", 0,   0, 100, 70],
            ["./img/drago.png", 100, 0, 100, 70],
            ["./img/drago.png", 200, 0, 100, 70],
            ["./img/drago.png", 100, 0, 100, 70],

        ],
        stand_fps: 12,
        stand_ripeti: true,

        sin: [
            ["./img/drago.png", 0,   70, 100, 70],
            ["./img/drago.png", 100, 70, 100, 70],
            ["./img/drago.png", 200, 70, 100, 70],
            ["./img/drago.png", 100, 70, 100, 70],

        ],
        sin_fps: 12,
        sin_ripeti: true,

        des: [
            ["./img/drago.png", 0,   140, 100, 70],
            ["./img/drago.png", 100, 140, 100, 70],
            ["./img/drago.png", 200, 140, 100, 70],
            ["./img/drago.png", 100, 140, 100, 70],

        ],
        des_fps: 12,
        des_ripeti: true,

        alto: [
            ["./img/drago.png", 0,   210, 100, 70],
            ["./img/drago.png", 100, 210, 100, 70],
            ["./img/drago.png", 200, 210, 100, 70],
            ["./img/drago.png", 100, 210, 100, 70],

        ],
        alto_fps: 12,
        alto_ripeti: true,
    },
    carino: {
        avanti: ["./img/Basic_Charakter/Basic_su_c1.png", "./img/Basic_Charakter/Basic_su_c2.png"],
        indietro: ["./img/Basic_Charakter/Basic_gu_c1.png", "./img/Basic_Charakter/Basic_gu_c2.png"],
        destra: ["./img/Basic_Charakter/Basic_de_c1.png", "./img/Basic_Charakter/Basic_de_c2.png"],
        sinistra: ["./img/Basic_Charakter/Basic_si_c1.png", "./img/Basic_Charakter/Basic_si_c2.png"],

        avanti_stand: ["./img/Basic_Charakter/Basic_su_s1.png", "./img/Basic_Charakter/Basic_su_s2.png"],
        indietro_stand: ["./img/Basic_Charakter/Basic_gu_s1.png", "./img/Basic_Charakter/Basic_gu_s2.png"],
        destra_stand: ["./img/Basic_Charakter/Basic_de_s1.png", "./img/Basic_Charakter/Basic_de_s2.png"],
        sinistra_stand: ["./img/Basic_Charakter/Basic_si_s1.png", "./img/Basic_Charakter/Basic_si_s2.png"],


        avanti_fps: 12,
        indietro_fps: 12,
        destra_fps: 12,
        sinistra_fps: 12,
        avanti_stand_fps: 12,
        indietro_stand_fps: 12,
        destra_stand_fps: 12,
        sinistra_stand_fps: 12,


        avanti_ripeti: true,
        indietro_ripeti: true,
        destra_ripeti: true,
        sinistra_ripeti: true,
        avanti_stand_ripeti: true,
        indietro_stand_ripeti: true,
        destra_stand_ripeti: true,
        sinistra_stand_ripeti: true,
    },
    albero: {
        stand: ["./img/alberi/albero.png"],
        stand_fps: 100,
        stand_ripeti: true,
    },
    albero_secco: {
        stand: ["./img/alberi/albero_secco.png"],
        stand_fps: 100,
        stand_ripeti: true,
    },
    albero_secco2: {//80 96
        stand: [
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 0, 96, 80, 96],
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 1, 96, 80, 96],
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 2, 96, 80, 96],
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 3, 96, 80, 96],
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 4, 96, 80, 96],
            ["./img/sito_craftpix/craftpix-oscuro/PNG/Animation2.png", 80* 5, 96, 80, 96],
        ],
        stand_fps: 10,
        stand_ripeti: true,
    },

    //sentiero
    sentiero1: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 5, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero2: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 1), g32 * 5, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero3: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 0), g32 * 5, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },

    sentiero1101: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 1), g32 * 0, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero1110: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 0, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero1011: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 1), g32 * 1, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0111: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 1, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0010: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 0), g32 * 2, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0011: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 1), g32 * 2, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0001: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 2, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero1001: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 3, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero1000: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 2), g32 * 4, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero1100: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 1), g32 * 4, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0100: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 0), g32 * 4, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    sentiero0110: {
        stand: [["./img/tiles/terreno32.png", g32 * (numero_sentiero + 0), g32 * 3, g32, g32]],
        stand_fps: 100,
        stand_ripeti: true,
    },
    //fine sentiero
};

const src_blocci_img = {};

for (const nome_blocco in src_blocci) {

    src_blocci_img[nome_blocco] = {};

    for (const chiave in src_blocci[nome_blocco]) {

        if (chiave.includes("_fps") || chiave.includes("_ripeti")) continue;

        const array_src = src_blocci[nome_blocco][chiave];

        src_blocci_img[nome_blocco][chiave] = array_src.map(src => {

            // se src è un array → è una sezione: [percorso, sx, sy, sw, sh]
            if (Array.isArray(src)) {
                const [percorso, sx, sy, sw, sh] = src;

                const sorgente = new Image();
                sorgente.src = percorso;

                // canvas temporaneo per ritagliare la sezione
                const offscreen = document.createElement("canvas");
                offscreen.width  = sw;
                offscreen.height = sh;
                const offCtx = offscreen.getContext("2d");

                sorgente.onload = () => {
                    offCtx.drawImage(sorgente, sx, sy, sw, sh, 0, 0, sw, sh);
                };

                return offscreen;   // restituisce il canvas ritagliato
            }

            // altrimenti è una stringa normale
            const img = new Image();
            img.src = src;
            return img;
        });
    }
}

console.log(src_blocci_img);






src_blocci.fuoco.stand.length

class blocco {
    constructor(nome, x, y, lx, ly, d_sin, d_sop, d_des, d_sot) {
        
        if (lx < d_des || lx < d_sin || ly < d_sop || ly < d_sot)
            console.error("hai messo degli ofset sulle collisioni più grandi della figura");

        this.nome = nome;
        this.x = x;
        this.y = y;
        this.lx = lx;
        this.ly = ly;
        this.vx = 0;
        this.vy = 0;

        this.d_sin = d_sin || 0;
        this.d_sop = d_sop || 0;
        this.d_des = d_des || 0;
        this.d_sot = d_sot || 0;
        
        this.indice_frame = 0;          //fps
        this.indice_animazione = 0;     //i dell'array
        this.nome_animazione = "stand";

        this.radianti = 0;
    }

    set_gradi(n){
        this.radianti = n *(Math.PI/180);
    }
    add_gradi(n){
        this.radianti += n *(Math.PI/180);
    }

    set_nome_animazione(nome){
        this.nome_animazione = nome;
        this.indice_frame = 0;
        this.indice_animazione = 0;   
    }


    get_basso(){
        return this.y + this.ly;
    }
    get_destra(){
        return this.x + this.lx;
    }
    
    set_basso(n){
        this.y = n - this.ly;
    }
    set_destra(n){
        this.x = n - this.lx;
    }


    
    get_col_basso(){
        return this.y + this.ly - this.d_sot;
    }
    get_col_destra(){
        return this.x + this.lx - this.d_des;
    }
    set_col_basso(n){
        this.y = n - this.ly + this.d_sot;
    }
    set_col_destra(n){
        this.x = n - this.lx + this.d_des;
    }

    get_col_x(){
        return this.x + this.d_sin;
    }
    get_col_y(){
        return this.y + this.d_sop;
    }
    set_col_x(n){
        this.x = n - this.d_sin;
    }
    set_col_y(n){
        this.y = n - this.d_sop;
    }







    if_collide(o){
        return (
            this.get_col_basso() > o.get_col_y() &&
            this.get_col_y() < o.get_col_basso() &&
            this.get_col_destra() > o.get_col_x() &&
            this.get_col_x() < o.get_col_destra()
        )
    }
    if_future_collide(o){
        return (
            this.get_col_basso()+this.vy > o.get_col_y()+o.vy &&
            this.get_col_y()+this.vy < o.get_col_basso()+o.vy &&
            this.get_col_destra()+this.vx > o.get_col_x()+o.vx &&
            this.get_col_x()+this.vx < o.get_col_destra()+o.vx
        )
    }


    /*
    fisica_qubo(o) {
        if (!this.if_future_collide(o)) return;

        if (this.if_collide(o)) {
            console.error(this.nome + " e " + o.nome + " stanno già collidendo");
            return;
        }

        // Calcola i bordi di collisione attuali
        const mio_basso    = this.get_col_basso();
        const mio_alto     = this.get_col_y();
        const mio_destra   = this.get_col_destra();
        const mio_sinistro = this.get_col_x();

        const suo_basso    = o.get_col_basso();
        const suo_alto     = o.get_col_y();
        const suo_destra   = o.get_col_destra();
        const suo_sinistro = o.get_col_x();

        // Determina da quale lato arriva la collisione
        // confrontando la posizione ATTUALE (non futura)
        if (mio_basso <= suo_alto) {
            // this arriva dall'alto
            this.set_col_basso(suo_alto - 1);
            this.vy = 0;
        } else if (mio_alto >= suo_basso) {
            debugger;
            // this arriva dal basso
            this.set_col_y(suo_basso + 1);
            this.vy = 0;
        } else if (mio_destra <= suo_sinistro) {
            // this arriva da sinistra
            this.set_col_destra(suo_sinistro - 1);
            this.vx = 0;
        } else if (mio_sinistro >= suo_destra) {
            // this arriva da destra
            this.set_col_x(suo_destra + 1);
            this.vx = 0;
        }
    }*/
    fisica_qubo(o) {
        // --- PASSATA X ---
        const future_collide_x = (
            this.get_col_basso()            > o.get_col_y() &&
            this.get_col_y()                < o.get_col_basso() &&
            this.get_col_destra() + this.vx > o.get_col_x() + o.vx &&
            this.get_col_x()      + this.vx < o.get_col_destra() + o.vx
        );

        if (future_collide_x && !this.if_collide(o)) {
            if (this.get_col_destra() <= o.get_col_x()) {
                this.set_col_destra(o.get_col_x() - 1);
                this.vx = 0;
            } else if (this.get_col_x() >= o.get_col_destra()) {
                this.set_col_x(o.get_col_destra() + 1);
                this.vx = 0;
            }
        }

        // --- PASSATA Y ---
        const future_collide_y = (
            this.get_col_basso() + this.vy > o.get_col_y() + o.vy &&
            this.get_col_y()     + this.vy < o.get_col_basso() + o.vy &&
            this.get_col_destra()           > o.get_col_x() &&
            this.get_col_x()                < o.get_col_destra()
        );

        if (future_collide_y && !this.if_collide(o)) {
            if (this.get_col_basso() <= o.get_col_y()) {
                this.set_col_basso(o.get_col_y() - 1);
                this.vy = 0;
            } else if (this.get_col_y() >= o.get_col_basso()) {
                this.set_col_y(o.get_col_basso() + 1);
                this.vy = 0;
            }
        }
    }

    aggiorna(){
        this.x += this.vx;
        this.y += this.vy;



        this.indice_frame++;

        if (this.indice_frame >= src_blocci[this.nome][this.nome_animazione+"_fps"]){
            this.indice_frame = 0;
            this.indice_animazione++;

            if (this.indice_animazione >= src_blocci_img[this.nome][this.nome_animazione].length){
                this.indice_animazione = 0;
                if (!src_blocci[this.nome][this.nome_animazione + "_ripeti"])
                    this.nome_animazione = "stand";
            }
        }
    }

    if_fine_animazione(){
        return (this.indice_animazione >= src_blocci_img[this.nome][this.nome_animazione].length-1 && this.indice_frame >= src_blocci[this.nome][this.nome_animazione+"_fps"]-1);
    }




    disegna(){

        ctx.save();

        // centro dello sprite
        const cx = this.x - telecamera.x + this.lx / 2;
        const cy = this.y - telecamera.y + this.ly / 2;

        ctx.translate(cx, cy);
        ctx.rotate(this.radianti);

        ctx.drawImage(
            src_blocci_img[this.nome][this.nome_animazione][this.indice_animazione],
            -this.lx / 2,
            -this.ly / 2,
            this.lx,
            this.ly
        );

        ctx.restore();

        //this.disegna_collisioni();
    }
    
    disegna_collisioni(){
        
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillRect(this.x- telecamera.x,this.y- telecamera.y,this.lx,this.ly);



        //debugger;
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.fillRect(this.x + this.d_sin- telecamera.x, this.y + this.d_sop- telecamera.y, this.lx - this.d_des - this.d_sin, this.ly - this.d_sop - this.d_sot);
    }




}
