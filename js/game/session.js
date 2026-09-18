const sessione = (() => {
    const classes = { warrior: 'Guerriero', mage: 'Mago', assassin: 'Assassino', healer: 'Guaritore' };
    let selected = new URLSearchParams(location.search).get('class');
    if (!Object.hasOwn(classes, selected)) {
        try { selected = localStorage.getItem('selectedClass'); } catch {}
    }
    if (!Object.hasOwn(classes, selected)) selected = 'warrior';
    const equipaggiamenti = {
        warrior: { nome: 'Spada', attacchi: [0, 2] },
        mage: { nome: 'Bastone arcano', attacchi: [5, 6] },
        assassin: { nome: 'Lama da lancio', attacchi: [4, 3] },
        healer: { nome: 'Bastone della luce', attacchi: [8, 9] }
    };
    const arma = equipaggiamenti[selected];
    document.getElementById('chosen-class').textContent = `${classes[selected]} · ${arma.nome}`;
    document.getElementById('restart').addEventListener('click', () => location.reload());
    return { classe: selected, nomeClasse: classes[selected], arma };
})();
aggiornaLinguaGioco();
