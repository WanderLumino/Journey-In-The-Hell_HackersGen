// Eseguire da qualsiasi cartella: node scripts/check-assets.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/game/entities.js'), 'utf8');
const catalog = vm.runInNewContext(source.slice(0, source.indexOf('const src_blocci_img = {};')) + '\nsrc_blocci;', {
    document: { getElementById: () => ({ getContext: () => ({}) }) }
});
const assets = new Set();
for (const animations of Object.values(catalog)) {
    for (const frames of Object.values(animations)) {
        if (Array.isArray(frames)) frames.forEach(frame => assets.add(Array.isArray(frame) ? frame[0] : frame));
    }
}
const missing = [...assets].filter(asset => !fs.existsSync(path.resolve(root, 'html', asset)));
for (const [nome, larghezza, altezza] of [
    ['chests',128,96], ['books',224,192], ['consumables',704,272],
    ['food',128,128], ['potions',336,240], ['rpg_icons',48,48]
]) {
    const percorso = path.join(root, 'assets/img/items', `${nome}.png`);
    if (!fs.existsSync(percorso)) missing.push(percorso);
    else {
        const png = fs.readFileSync(percorso);
        if (png.readUInt32BE(16) !== larghezza || png.readUInt32BE(20) !== altezza) missing.push(`Dimensioni inattese: ${nome}`);
    }
}
const mercante = path.join(root, 'assets/img/Basic_Character/NPC/NPC_mercante_000/mercante_sprite.png');
if (!fs.existsSync(mercante)) missing.push(mercante);
else {
    const png = fs.readFileSync(mercante);
    if (png.readUInt32BE(16) !== 384 || png.readUInt32BE(20) !== 832) missing.push('Dimensioni inattese del mercante: aggiornare il ritaglio');
}
const map = JSON.parse(fs.readFileSync(path.join(root, 'data/maps/selva.json'), 'utf8'));
if (!map.layers.some(layer => layer.name === 'collesioni' && layer.data.length === layer.width * layer.height)) {
    missing.push('Livello collisioni valido in selva.json');
}
if (missing.length) {
    console.error('Risorse mancanti:', missing);
    process.exitCode = 1;
} else {
    console.log(`OK: ${assets.size} immagini, mercante, sei spritesheet degli oggetti e collisioni della mappa.`);
}
