
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Category, Position, ErrorLog, WordData } from './types';
import { GAME_LIBRARY } from './constants';
import { speak } from './services/speechService';

// --- COMPONENTS ---

const Header: React.FC = () => (
  <div className="pt-8 pb-6 bg-white border-b border-gray-100 flex flex-col items-center select-none">
    {/* Cuadro del Logo */}
    <div className="w-24 h-24 bg-[#4d8d64] rounded-[2rem] flex items-center justify-center mb-4 shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14">
        {/* Parte superior del birrete (diamante) */}
        <path d="M22 10L12 5L2 10L12 15L22 10Z" />
        {/* Base del birrete */}
        <path d="M6 12.5V16C6 16 8.5 18.5 12 18.5C15.5 18.5 18 16 18 16V12.5" />
        {/* Borla/Tassel */}
        <path d="M22 10V15" />
      </svg>
    </div>
    
    {/* Texto NOGALESPT */}
    <div className="text-[2.75rem] leading-none font-black flex items-baseline tracking-[-0.05em]">
      <span className="text-[#1a1d23]">NOGALES</span>
      <span className="text-[#4d8d64]">PT</span>
    </div>
    
    {/* Subtítulo dinámico */}
    <h1 className="text-[10px] font-bold text-purple-400 tracking-[0.4em] uppercase mt-2">CONCIENCIA SILÁBICA</h1>
  </div>
);

// --- MAIN APP ---

const App: React.FC = () => {
  const [view, setView] = useState<View>('LOGIN');
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState<Category>('directas');
  const [position, setPosition] = useState<Position>('inicio');
  const [level, setLevel] = useState(0);
  const [errors, setErrors] = useState<ErrorLog[]>([]);

  const goToMainMenu = useCallback(() => setView('MAIN_MENU'), []);
  const goToPositionMenu = (cat: Category) => {
    setCategory(cat);
    speak(cat);
    setView('POSITION_MENU');
  };
  const startLevel = (pos: Position) => {
    setPosition(pos);
    setLevel(0);
    setErrors([]);
    setView('GAME');
  };

  const handleLogin = (name: string) => {
    if (!name.trim()) {
      speak("Por favor, escribe el nombre.");
      return;
    }
    setStudentName(name);
    speak("Hola " + name);
    goToMainMenu();
  };

  return (
    <div className="min-h-screen py-4 px-2 sm:py-8 sm:px-4 bg-slate-100 flex justify-center items-start overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-purple-50 overflow-hidden relative min-h-[650px] flex flex-col">
        <Header />
        
        <main className="flex-1 flex flex-col p-5 overflow-hidden">
          {view === 'LOGIN' && <LoginView onLogin={handleLogin} />}
          {view === 'MAIN_MENU' && (
            <MainMenu 
              studentName={studentName} 
              onSelectCategory={goToPositionMenu} 
              onChangeStudent={() => setView('LOGIN')} 
            />
          )}
          {view === 'POSITION_MENU' && (
            <PositionMenu 
              onBack={goToMainMenu} 
              onSelectPosition={startLevel} 
            />
          )}
          {view === 'GAME' && (
            <GameView 
              category={category}
              position={position}
              level={level}
              setLevel={setLevel}
              errors={errors}
              setErrors={setErrors}
              onExit={() => setView('POSITION_MENU')}
              onWin={() => setView('REPORT')}
            />
          )}
          {view === 'REPORT' && (
            <ReportView 
              studentName={studentName}
              category={category}
              position={position}
              errors={errors}
              onBackMenu={goToMainMenu}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// --- SUB-VIEWS ---

const LoginView: React.FC<{ onLogin: (name: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  return (
    <div className="fade-in space-y-6 flex flex-col items-center">
      <p className="text-gray-500 font-bold text-center">¡Hola! Escribe el nombre del alumno para empezar:</p>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text" 
        placeholder="Escribe el nombre aquí" 
        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-purple-100 text-center text-xl font-bold outline-none focus:border-purple-400"
        onKeyDown={(e) => e.key === 'Enter' && onLogin(name)}
        autoFocus
      />
      <button 
        onClick={() => onLogin(name)}
        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-purple-700 transition-colors"
      >
        Entrar
      </button>
    </div>
  );
};

const MainMenu: React.FC<{ studentName: string; onSelectCategory: (c: Category) => void; onChangeStudent: () => void }> = ({ studentName, onSelectCategory, onChangeStudent }) => (
  <div className="fade-in space-y-3">
    <p className="text-center text-gray-400 font-bold mb-4 text-xs tracking-widest uppercase">Alumno: {studentName}</p>
    <button onClick={() => onSelectCategory('directas')} className="w-full p-5 bg-blue-500 text-white rounded-3xl font-bold text-lg shadow-md flex items-center justify-between hover:scale-[0.98] transition-transform">
      <span>Directas (CV)</span>
      <span className="text-xl">➔</span>
    </button>
    <button onClick={() => onSelectCategory('inversas')} className="w-full p-5 bg-emerald-500 text-white rounded-3xl font-bold text-lg shadow-md flex items-center justify-between hover:scale-[0.98] transition-transform">
      <span>Inversas (VC)</span>
      <span className="text-xl">➔</span>
    </button>
    <button onClick={() => onSelectCategory('trabadas')} className="w-full p-5 bg-purple-500 text-white rounded-3xl font-bold text-lg shadow-md flex items-center justify-between hover:scale-[0.98] transition-transform">
      <span>Trabadas (CCV)</span>
      <span className="text-xl">➔</span>
    </button>
    <button onClick={() => onSelectCategory('mixtas')} className="w-full p-5 bg-orange-500 text-white rounded-3xl font-bold text-lg shadow-md flex items-center justify-between hover:scale-[0.98] transition-transform">
      <span>Mixtas (CVC)</span>
      <span className="text-xl">➔</span>
    </button>
    <button onClick={onChangeStudent} className="w-full py-3 mt-4 text-gray-400 font-bold text-sm underline">Cambiar de alumno</button>
  </div>
);

const PositionMenu: React.FC<{ onBack: () => void; onSelectPosition: (p: Position) => void }> = ({ onBack, onSelectPosition }) => (
  <div className="fade-in space-y-4">
    <button onClick={onBack} className="text-gray-400 font-bold text-xs mb-4 uppercase tracking-tighter">← Volver al menú</button>
    <p className="text-center text-gray-500 font-bold mb-6 uppercase tracking-tight text-sm">¿En qué parte de la palabra?</p>
    <button onClick={() => onSelectPosition('inicio')} className="w-full p-6 bg-white border-2 border-gray-100 text-slate-700 rounded-3xl font-bold text-xl hover:border-blue-400 transition-colors">Al inicio</button>
    <button onClick={() => onSelectPosition('mitad')} className="w-full p-6 bg-white border-2 border-gray-100 text-slate-700 rounded-3xl font-bold text-xl hover:border-blue-400 transition-colors">En medio</button>
    <button onClick={() => onSelectPosition('final')} className="w-full p-6 bg-white border-2 border-gray-100 text-slate-700 rounded-3xl font-bold text-xl hover:border-blue-400 transition-colors">Al final</button>
  </div>
);

const GameView: React.FC<{
  category: Category;
  position: Position;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  errors: ErrorLog[];
  setErrors: React.Dispatch<React.SetStateAction<ErrorLog[]>>;
  onExit: () => void;
  onWin: () => void;
}> = ({ category, position, level, setLevel, errors, setErrors, onExit, onWin }) => {
  const data: WordData = GAME_LIBRARY[category][position][level];
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Drag and Drop state
  const [draggingSyl, setDraggingSyl] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [isOverTarget, setIsOverTarget] = useState(false);
  
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShuffledOptions([...data.options].sort(() => Math.random() - 0.5));
    setIsCorrect(false);
    speak(data.word);
  }, [data]);

  const posText = position === "inicio" ? "primera" : position === "mitad" ? "de en medio" : "última";

  const handlePointerDown = (e: React.PointerEvent, syl: string) => {
    if (isCorrect) return;
    setDraggingSyl(syl);
    setPointerPos({ x: e.clientX, y: e.clientY });
    speak(syl);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!draggingSyl) return;
    setPointerPos({ x: e.clientX, y: e.clientY });

    // Check collision with targetRef
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isOver = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
      setIsOverTarget(isOver);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!draggingSyl) return;

    if (isOverTarget) {
      if (draggingSyl === data.syllables[data.targetIdx]) {
        setIsCorrect(true);
        speak(data.word);
        setTimeout(() => speak("¡Bien hecho!", false), 800);
        setTimeout(() => {
          if (level < 19) {
            setLevel(level + 1);
          } else {
            onWin();
          }
        }, 1600);
      } else {
        setErrors([...errors, { word: data.word, correct: data.syllables[data.targetIdx], failed: draggingSyl }]);
        speak("Prueba otra vez", false);
      }
    }

    setDraggingSyl(null);
    setIsOverTarget(false);
  };

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingSyl, isOverTarget, data, level, errors]);

  return (
    <div className="fade-in flex flex-col items-center flex-1 h-full select-none">
      <div className="w-full flex justify-between items-center mb-2">
        <button onClick={onExit} className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">← Salir</button>
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${((level + 1) / 20) * 100}%` }}></div>
          </div>
          <span className="text-[10px] font-bold text-gray-300">{level + 1}/20</span>
        </div>
      </div>

      <p className="text-gray-600 font-bold text-center mb-4 leading-tight text-sm">
        ¿Cuál es la <span className="text-purple-600 font-black">{posText}</span> sílaba?
      </p>

      <button 
        onClick={() => speak(data.word)}
        className="mb-4 p-3 bg-purple-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/>
        </svg>
      </button>

      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-[2.5rem] flex items-center justify-center text-[5.5rem] sm:text-[7rem] shadow-inner border-4 border-white mb-6">
        {data.emoji}
      </div>

      <div className="flex gap-2 h-16 items-center mb-8 justify-center">
        {data.syllables.map((syl, i) => (
          i === data.targetIdx ? (
            <div 
              key={i}
              ref={targetRef}
              className={`w-16 h-16 border-4 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-200
                ${isCorrect ? 'border-green-500 text-green-600 bg-green-50 correct-pop' : 
                  isOverTarget ? 'border-purple-500 bg-purple-100 scale-110 shadow-lg' : 
                  draggingSyl ? 'border-dashed border-purple-200 bg-purple-50 pulse-target' : 'border-dashed border-gray-200 text-gray-200 bg-white'}`}
            >
              {isCorrect ? syl : '?'}
            </div>
          ) : (
            <div key={i} className="w-16 h-16 border-4 border-gray-50 rounded-xl flex items-center justify-center text-xl font-bold text-gray-300 bg-gray-50/50">
              {syl}
            </div>
          )
        ))}
      </div>

      <div className="mt-auto w-full p-5 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
        <div className="flex justify-center gap-4 flex-wrap">
          {shuffledOptions.map((syl, idx) => (
            <div 
              key={`${level}-${idx}`}
              onPointerDown={(e) => handlePointerDown(e, syl)}
              className={`w-16 h-16 bg-white border-2 border-purple-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-purple-600 shadow-sm cursor-grab active:cursor-grabbing hover:border-purple-300 transition-colors
                ${draggingSyl === syl ? 'opacity-0' : 'opacity-100'}`}
            >
              {syl}
            </div>
          ))}
        </div>
      </div>
      
      {/* Elemento que se arrastra (Floating Tile) */}
      {draggingSyl && (
        <div 
          className="dragging-active w-20 h-20 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl"
          style={{ 
            left: pointerPos.x, 
            top: pointerPos.y 
          }}
        >
          {draggingSyl}
        </div>
      )}
    </div>
  );
};

const ReportView: React.FC<{ 
  studentName: string; 
  category: Category; 
  position: Position; 
  errors: ErrorLog[]; 
  onBackMenu: () => void 
}> = ({ studentName, category, position, errors, onBackMenu }) => {
  
  const generateReportText = () => {
    let text = `INFORME: ${studentName}\n`;
    text += `Categoría: ${category.toUpperCase()} (${position})\n`;
    text += `Aciertos: ${20 - errors.length}/20\n`;
    text += `Errores (${errors.length}):\n`;
    errors.forEach((e, i) => {
      text += `${i + 1}. ${e.word}: Puso "${e.failed}" (Era "${e.correct}")\n`;
    });
    return text;
  };

  const copyToClipboard = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text).then(() => {
      speak("Informe copiado al portapapeles.");
    });
  };

  useEffect(() => {
    speak("¡Genial! Fase terminada");
  }, []);

  return (
    <div className="fade-in flex flex-col h-full text-center">
      <div className="mb-4">
        <h2 className="text-3xl font-black text-purple-600">¡MUY BIEN!</h2>
        <div className="text-[4rem] my-2">🏆</div>
      </div>
      <p className="text-gray-400 text-sm mb-4">Resumen para: <span className="font-bold text-gray-600">{studentName}</span></p>
      
      <div className="bg-gray-50 rounded-3xl p-5 text-left text-xs mb-6 flex-1 overflow-y-auto border border-gray-100 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
        {generateReportText()}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={copyToClipboard}
          className="py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-lg shadow-lg hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>📋</span> Copiar Informe
        </button>
        <button 
          onClick={onBackMenu}
          className="py-4 bg-purple-600 text-white rounded-[1.5rem] font-black hover:bg-purple-700 active:scale-95 transition-all"
        >
          Menú Principal
        </button>
      </div>
    </div>
  );
};

export default App;
