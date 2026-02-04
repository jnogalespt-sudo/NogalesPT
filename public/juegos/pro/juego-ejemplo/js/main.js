const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const svgGhost = document.getElementById('svg-ghost');
const svgUi = document.getElementById('svg-ui');
const quizOverlay = document.getElementById('quiz-overlay');
const winOverlay = document.getElementById('win-overlay');
const letterSelector = document.getElementById('letter-selector');
const hintMsg = document.getElementById('hint-msg');
const gameContainer = document.getElementById('game-container');
const gameWrapper = document.getElementById('game-wrapper');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');

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

const alphabet = Object.keys(alphabetData);
let curL = 'A';
let sIdx = 0, pIdx = 0;
let drawing = false, strokeActive = false;
let gameActive = false;
let estaCambiando = false;

function init() {
    alphabet.forEach(l => {
        const btn = document.createElement('div');
        btn.innerText = l;
        btn.className = `min-w-[44px] md:min-w-[48px] h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl cursor-pointer transition-all letter-pill bg-white text-slate-400 shadow-sm`;
        btn.onclick = () => { if(gameActive && !estaCambiando) loadLetter(l); };
        letterSelector.appendChild(btn);
    });

    window.addEventListener('resize', resize);
    resize();
    setupInteraction();

    document.getElementById('btn-clear').onclick = () => { if(gameActive && !estaCambiando) loadLetter(curL); };

    btnStart.onclick = () => {
        gameActive = true;
        startOverlay.style.display = 'none';
        loadLetter('A');
    };
}

function speak(text) {
    if (!window.speechSynthesis || !gameActive) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
}

function resize() {
    const size = Math.min(gameWrapper.clientWidth, gameWrapper.clientHeight, 450);
    gameContainer.style.width = size + 'px'; gameContainer.style.height = size + 'px';
    canvas.width = size; canvas.height = size;
    render();
}

function loadLetter(l) {
    estaCambiando = false;
    curL = l; sIdx = 0; pIdx = 0; strokeActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    quizOverlay.classList.add('hidden');
    winOverlay.classList.add('hidden');
    hintMsg.innerText = alphabetData[l].msg;
    
    Array.from(letterSelector.children).forEach(btn => {
        const isAct = btn.innerText === l;
        btn.className = `min-w-[44px] md:min-w-[48px] h-10 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl cursor-pointer transition-all letter-pill ${isAct?'active':'bg-white text-slate-400'}`;
        if (isAct) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    render();
    speak(`Letra ${l}`);
}

function render() {
    svgGhost.innerHTML = '';
    alphabetData[curL].strokes.forEach(s => {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", s.map((pt, i) => `${i===0?'M':'L'} ${pt.x} ${pt.y}`).join(' '));
        p.setAttribute("fill", "none"); p.setAttribute("stroke", "#10b981"); 
        p.setAttribute("stroke-width", "16"); p.setAttribute("stroke-linecap", "round");
        svgGhost.appendChild(p);
    });
    svgUi.innerHTML = '';
    const stroke = alphabetData[curL].strokes[sIdx];
    if (!stroke) return;
    stroke.forEach((pt, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y);
        c.setAttribute("r", i === pIdx ? "7" : "4");
        c.setAttribute("fill", i < pIdx ? "#10b981" : "#cbd5e1");
        if (i === pIdx) {
            const next = stroke[i+1];
            if (next) {
                const angle = Math.atan2(next.y - pt.y, next.x - pt.x) * 180 / Math.PI;
                const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
                arrow.setAttribute("d", "M-4,-4 L6,0 L-4,4 Z"); arrow.setAttribute("fill", "#f59e0b");
                arrow.setAttribute("transform", `translate(${pt.x + (next.x-pt.x)*0.15}, ${pt.y + (next.y-pt.y)*0.15}) rotate(${angle})`);
                g.appendChild(arrow);
            }
        }
        g.appendChild(c);
        svgUi.appendChild(g);
    });
}

function setupInteraction() {
    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const px = cx - r.left;
        const py = cy - r.top;
        return { px, py, x: (px/canvas.width)*100, y: (py/canvas.height)*100 };
    };
    
    const validate = (pos) => {
        if (estaCambiando) return;
        const stroke = alphabetData[curL].strokes[sIdx];
        if (!stroke) return;
        
        const target = stroke[pIdx];
        const d = Math.hypot(pos.x - target.x, pos.y - target.y);
        const radioDeteccion = 9; 

        if (pIdx === 0 && d < radioDeteccion && !strokeActive) {
            strokeActive = true;
            ctx.beginPath();
            ctx.moveTo(pos.px, pos.py);
            ctx.lineWidth = canvas.width * 0.14; 
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = "#10b981"; 
        }
        
        if (strokeActive && d < radioDeteccion) {
            pIdx++;
            render();
            if (pIdx === stroke.length) {
                strokeActive = false;
                sIdx++;
                pIdx = 0;
                if (sIdx >= alphabetData[curL].strokes.length) {
                    estaCambiando = true;
                    setTimeout(showQuiz, 400);
                } else {
                    render();
                }
            }
        }
    };

    const hStart = (e) => { if(!gameActive || estaCambiando) return; drawing = true; validate(getPos(e)); };
    const hMove = (e) => {
        if (!drawing || !gameActive || estaCambiando) return;
        const p = getPos(e);
        if (strokeActive) { ctx.lineTo(p.px, p.py); ctx.stroke(); }
        validate(p);
    };
    const hEnd = () => { drawing = false; strokeActive = false; };

    canvas.addEventListener('mousedown', hStart);
    canvas.addEventListener('mousemove', hMove);
    window.addEventListener('mouseup', hEnd);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); hStart(e); }, {passive: false});
    canvas.addEventListener('touchmove', e => { e.preventDefault(); hMove(e); }, {passive: false});
    canvas.addEventListener('touchend', hEnd);
}

function showQuiz() {
    const d = alphabetData[curL];
    document.getElementById('quiz-char').innerText = curL;
    quizOverlay.classList.remove('hidden');
    const optsCont = document.getElementById('quiz-options');
    optsCont.innerHTML = '';
    
    const opts = [...d.dist, {w: d.word, i: d.icon}].sort(() => Math.random() - 0.5);
    
    opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = "flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-50 font-bold active:scale-95 transition-all w-full";
        btn.innerHTML = `<span class="text-3xl">${o.i}</span> <span class="text-lg text-slate-700">${o.w}</span>`;
        btn.onclick = () => {
            if (o.w === d.word) {
                winOverlay.classList.remove('hidden');
                speak("¡Muy bien hecho!");
                setTimeout(() => {
                    const siguiente = alphabet[(alphabet.indexOf(curL)+1)%alphabet.length];
                    loadLetter(siguiente);
                }, 3500);
            } else {
                btn.classList.add('border-red-200', 'bg-red-50');
                speak("¡Prueba otra vez!");
                setTimeout(() => btn.classList.remove('border-red-200', 'bg-red-50'), 800);
            }
        };
        optsCont.appendChild(btn);
    });
    speak(`¿Qué empieza por la letra ${curL}?`);
}

window.onload = init;