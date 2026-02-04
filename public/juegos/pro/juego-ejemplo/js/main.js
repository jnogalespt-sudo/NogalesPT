const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const svgGhost = document.getElementById('svg-ghost');
const svgUi = document.getElementById('svg-ui');
const quizOverlay = document.getElementById('quiz-overlay');
const winOverlay = document.getElementById('win-overlay');
const letterSelector = document.getElementById('letter-selector');
const hintMsg = document.getElementById('hint-msg');
const gameWrapper = document.getElementById('game-wrapper');
const gameContainer = document.getElementById('game-container');

// BASE DE DATOS COMPLETA
const alphabetData = {
    'A': { word: 'Abeja', icon: '🐝', dist: [{w:'Pelo', i:'💇'}, {w:'Coche', i:'🚗'}], strokes: [[{x:50,y:20},{x:20,y:80}],[{x:50,y:20},{x:80,y:80}],[{x:35,y:55},{x:65,y:55}]], msg: "Sube y baja la montaña" },
    'B': { word: 'Barco', icon: '🚢', dist: [{w:'Casa', i:'🏠'}, {w:'Luna', i:'🌙'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:60,y:20},{x:70,y:35},{x:35,y:50}],[{x:35,y:50},{x:70,y:50},{x:80,y:65},{x:35,y:80}]], msg: "Baja recto y haz dos barrigas" },
    'C': { word: 'Conejo', icon: '🐰', dist: [{w:'Sol', i:'☀️'}, {w:'Taza', i:'☕'}], strokes: [[{x:75,y:25},{x:50,y:20},{x:25,y:50},{x:50,y:80},{x:75,y:75}]], msg: "Haz una curva abierta" },
    'D': { word: 'Dado', icon: '🎲', dist: [{w:'Flor', i:'🌸'}, {w:'Gato', i:'🐱'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:70,y:20},{x:85,y:50},{x:70,y:80},{x:35,y:80}]], msg: "Un palo y una gran panza" },
    'E': { word: 'Elefante', icon: '🐘', dist: [{w:'Queso', i:'🧀'}, {w:'Ratón', i:'🐭'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:75,y:20}],[{x:35,y:50},{x:65,y:50}],[{x:35,y:80},{x:75,y:80}]], msg: "Un peine con tres dientes" },
    'F': { word: 'Flor', icon: '🌸', dist: [{w:'Uva', i:'🍇'}, {w:'Vaca', i:'🐮'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:75,y:20}],[{x:35,y:50},{x:65,y:50}]], msg: "Baja y haz dos bracitos" },
    'G': { word: 'Gato', icon: '🐱', dist: [{w:'Sol', i:'☀️'}, {w:'Pino', i:'🌲'}], strokes: [[{x:75,y:25},{x:50,y:20},{x:25,y:50},{x:50,y:80},{x:75,y:75},{x:75,y:55},{x:55,y:55}]], msg: "Haz un círculo y entra" },
    'H': { word: 'Helado', icon: '🍦', dist: [{w:'Pez', i:'🐟'}, {w:'Bota', i:'🥾'}], strokes: [[{x:30,y:20},{x:30,y:80}],[{x:70,y:20},{x:70,y:80}],[{x:30,y:50},{x:70,y:50}]], msg: "Dos palos cogidos de la mano" },
    'I': { word: 'Isla', icon: '🏝️', dist: [{w:'Libro', i:'📖'}, {w:'Dedo', i:'☝️'}], strokes: [[{x:50,y:20},{x:50,y:80}]], msg: "Un palito muy flaco" },
    'J': { word: 'Jirafa', icon: '🦒', dist: [{w:'Reloj', i:'⌚'}, {w:'Mesa', i:'🪑'}], strokes: [[{x:65,y:20},{x:65,y:70},{x:50,y:80},{x:35,y:75}]], msg: "Un bastón de caramelo" },
    'K': { word: 'Koala', icon: '🐨', dist: [{w:'Vela', i:'🕯️'}, {w:'Pan', i:'🍞'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:75,y:20},{x:35,y:50}],[{x:35,y:50},{x:75,y:80}]], msg: "Un palo que lanza patadas" },
    'L': { word: 'León', icon: '🦁', dist: [{w:'Ojo', i:'👁️'}, {w:'Uña', i:'💅'}], strokes: [[{x:40,y:20},{x:40,y:80}],[{x:40,y:80},{x:70,y:80}]], msg: "Baja y gira a la derecha" },
    'M': { word: 'Mono', icon: '🐒', dist: [{w:'Nube', i:'☁️'}, {w:'Silla', i:'🪑'}], strokes: [[{x:15,y:80},{x:15,y:20}],[{x:15,y:20},{x:50,y:50}],[{x:50,y:50},{x:85,y:20}],[{x:85,y:20},{x:85,y:80}]], msg: "Sube, baja, sube y baja" },
    'N': { word: 'Naranja', icon: '🍊', dist: [{w:'Pelo', i:'💇'}, {w:'Duna', i:'🏜️'}], strokes: [[{x:25,y:80},{x:25,y:20}],[{x:25,y:20},{x:75,y:80}],[{x:75,y:80},{x:75,y:20}]], msg: "Sube, baja inclinado y sube" },
    'Ñ': { word: 'Ñandú', icon: '🐦', dist: [{w:'Gato', i:'🐱'}, {w:'Sapo', i:'🐸'}], strokes: [[{x:25,y:80},{x:25,y:25}],[{x:25,y:25},{x:75,y:80}],[{x:75,y:80},{x:75,y:25}],[{x:35,y:12},{x:50,y:8},{x:65,y:12}]], msg: "¡No olvides el sombrerito!" },
    'O': { word: 'Oveja', icon: '🐑', dist: [{w:'Voz', i:'🗣️'}, {w:'Piel', i:'✋'}], strokes: [[{x:50,y:20},{x:20,y:50},{x:50,y:80},{x:80,y:50},{x:50,y:20}]], msg: "Redonda como un donut" },
    'P': { word: 'Pollito', icon: '🐥', dist: [{w:'Vaca', i:'🐮'}, {w:'Toro', i:'🐂'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:70,y:20},{x:70,y:45},{x:35,y:45}]], msg: "Un palo con una mochila" },
    'Q': { word: 'Queso', icon: '🧀', dist: [{w:'Pan', i:'🍞'}, {w:'Tarta', i:'🍰'}], strokes: [[{x:50,y:20},{x:20,y:50},{x:50,y:80},{x:80,y:50},{x:50,y:20}],[{x:60,y:70},{x:85,y:90}]], msg: "Un círculo con una patita" },
    'R': { word: 'Ratón', icon: '🐭', dist: [{w:'Gato', i:'🐱'}, {w:'Pato', i:'🦆'}], strokes: [[{x:35,y:20},{x:35,y:80}],[{x:35,y:20},{x:70,y:20},{x:70,y:45},{x:35,y:45}],[{x:45,y:45},{x:70,y:80}]], msg: "Un palo con cabeza y pata" },
    'S': { word: 'Sol', icon: '☀️', dist: [{w:'Mar', i:'🌊'}, {w:'Viento', i:'💨'}], strokes: [[{x:75,y:30},{x:50,y:20},{x:25,y:35},{x:50,y:50},{x:75,y:65},{x:50,y:80},{x:25,y:70}]], msg: "Sigue el camino de la serpiente" },
    'T': { word: 'Tortuga', icon: '🐢', dist: [{w:'Pez', i:'🐟'}, {w:'Búho', i:'🦉'}], strokes: [[{x:25,y:20},{x:75,y:20}],[{x:50,y:20},{x:50,y:80}]], msg: "Un martillo" },
    'U': { word: 'Uvas', icon: '🍇', dist: [{w:'Piña', i:'🍍'}, {w:'Coco', i:'🥥'}], strokes: [[{x:25,y:20},{x:25,y:70},{x:50,y:85},{x:75,y:70},{x:75,y:20}]], msg: "Como una gran sonrisa" },
    'V': { word: 'Vaca', icon: '🐮', dist: [{w:'Tigre', i:'🐅'}, {w:'Oso', i:'🐻'}], strokes: [[{x:25,y:20},{x:50,y:80}],[{x:50,y:80},{x:75,y:20}]], msg: "Baja y sube rápido" },
    'W': { word: 'Waterpolo', icon: '🤽', dist: [{w:'Fútbol', i:'⚽'}, {w:'Yudo', i:'🥋'}], strokes: [[{x:15,y:20},{x:30,y:80}],[{x:30,y:80},{x:50,y:40}],[{x:50,y:40},{x:70,y:80}],[{x:70,y:80},{x:85,y:20}]], msg: "Baja, sube, baja y sube" },
    'X': { word: 'Xilófono', icon: '🎹', dist: [{w:'Caja', i:'📦'}, {w:'Pera', i:'🍐'}], strokes: [[{x:25,y:20},{x:75,y:80}],[{x:75,y:20},{x:25,y:80}]], msg: "Dos palos cruzados" },
    'Y': { word: 'Yogur', icon: '🥛', dist: [{w:'Sopa', i:'🍜'}, {w:'Puré', i:'🥣'}], strokes: [[{x:25,y:20},{x:50,y:45}],[{x:75,y:20},{x:50,y:45}],[{x:50,y:45},{x:50,y:80}]], msg: "Una V con una pierna" },
    'Z': { word: 'Zebra', icon: '🦓', dist: [{w:'León', i:'🦁'}, {w:'Gato', i:'🐱'}], strokes: [[{x:25,y:20},{x:75,y:20}],[{x:75,y:20},{x:25,y:80}],[{x:25,y:80},{x:75,y:80}]], msg: "Un rayo en el cielo" }
};

let curL = 'A', sIdx = 0, pIdx = 0;
let drawing = false, strokeActive = false, gameActive = false, estaCambiando = false;

function init() {
    Object.keys(alphabetData).forEach(l => {
        const btn = document.createElement('div');
        btn.innerText = l;
        btn.className = `letter-pill`;
        btn.onclick = () => { if(gameActive && !estaCambiando) loadLetter(l); };
        letterSelector.appendChild(btn);
    });
    window.addEventListener('resize', resize);
    resize();
    setupInteraction();
    document.getElementById('btn-clear').onclick = () => { if(gameActive && !estaCambiando) loadLetter(curL); };
    document.getElementById('btn-start').onclick = () => { gameActive = true; document.getElementById('start-overlay').style.display = 'none'; loadLetter('A'); };
}

function speak(text) {
    if (!window.speechSynthesis || !gameActive) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    window.speechSynthesis.speak(u);
}

function resize() {
    const size = Math.min(gameWrapper.clientWidth, gameWrapper.clientHeight, 450);
    gameContainer.style.width = size + 'px'; gameContainer.style.height = size + 'px';
    canvas.width = size; canvas.height = size;
    render();
}

function loadLetter(l) {
    estaCambiando = false; curL = l; sIdx = 0; pIdx = 0; strokeActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    quizOverlay.classList.add('hidden'); winOverlay.classList.add('hidden');
    hintMsg.innerText = alphabetData[l].msg;
    Array.from(letterSelector.children).forEach(b => b.className = `letter-pill ${b.innerText===l?'active':''}`);
    render(); speak(`Letra ${l}`);
}

function render() {
    svgGhost.innerHTML = '';
    alphabetData[curL].strokes.forEach(s => {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", s.map((pt, i) => `${i===0?'M':'L'} ${pt.x} ${pt.y}`).join(' '));
        p.setAttribute("fill", "none"); p.setAttribute("stroke", "#10b98122"); p.setAttribute("stroke-width", "16"); p.setAttribute("stroke-linecap", "round");
        svgGhost.appendChild(p);
    });
    svgUi.innerHTML = '';
    const stroke = alphabetData[curL].strokes[sIdx];
    if (!stroke) return;
    stroke.forEach((pt, i) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.setAttribute("r", i === pIdx ? "6" : "3");
        c.setAttribute("fill", i < pIdx ? "#10b981" : "#cbd5e1");
        svgUi.appendChild(c);
    });
}

function setupInteraction() {
    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { px: cx - r.left, py: cy - r.top, x: ((cx-r.left)/canvas.width)*100, y: ((cy-r.top)/canvas.height)*100 };
    };
    
    const validate = (pos) => {
        const s = alphabetData[curL].strokes[sIdx];
        if (!s || estaCambiando) return;
        const t = s[pIdx];
        const d = Math.hypot(pos.x - t.x, pos.y - t.y);
        if (pIdx === 0 && d < 10 && !strokeActive) { strokeActive = true; ctx.beginPath(); ctx.moveTo(pos.px, pos.py); ctx.lineWidth = canvas.width*0.12; ctx.strokeStyle = "#10b981"; ctx.lineCap = 'round'; }
        if (strokeActive && d < 10) { pIdx++; render(); if (pIdx === s.length) { strokeActive = false; sIdx++; pIdx = 0; if (sIdx >= alphabetData[curL].strokes.length) { estaCambiando = true; setTimeout(showQuiz, 500); } } }
    };

    canvas.addEventListener('mousedown', (e) => { drawing = true; validate(getPos(e)); });
    canvas.addEventListener('mousemove', (e) => { if(drawing) { const p = getPos(e); if(strokeActive) { ctx.lineTo(p.px, p.py); ctx.stroke(); } validate(p); } });
    window.addEventListener('mouseup', () => { drawing = false; strokeActive = false; });
    
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; validate(getPos(e)); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(drawing) { const p = getPos(e); if(strokeActive) { ctx.lineTo(p.px, p.py); ctx.stroke(); } validate(p); } });
    canvas.addEventListener('touchend', () => { drawing = false; strokeActive = false; });
}

function showQuiz() {
    const d = alphabetData[curL];
    document.getElementById('quiz-char').innerText = curL;
    quizOverlay.classList.remove('hidden');
    const oCont = document.getElementById('quiz-options');
    oCont.innerHTML = '';
    [{w:d.word, i:d.icon}, ...d.dist].sort(()=>Math.random()-0.5).forEach(o => {
        const b = document.createElement('div');
        b.className = "quiz-btn";
        b.innerHTML = `<span>${o.i}</span> <span>${o.w}</span>`;
        b.onclick = () => {
            if(o.w === d.word) {
                winOverlay.classList.remove('hidden'); speak("¡Muy bien!");
                setTimeout(() => { const next = alphabet[(alphabet.indexOf(curL)+1)%alphabet.length]; loadLetter(next); }, 3000);
            } else { b.style.borderColor = "red"; speak("Prueba otra vez"); }
        };
        oCont.appendChild(b);
    });
    speak(`¿Qué empieza por la letra ${curL}?`);
}

init();
