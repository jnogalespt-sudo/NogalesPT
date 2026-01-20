
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, Bot, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'No he podido generar una respuesta.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ha ocurrido un error al conectar con el servidor de inteligencia artificial.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {isOpen ? (
        <div className="bg-white w-[350px] md:w-[420px] h-[600px] rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">Asistente IA</h3>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">NOGALESPT Smart Help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mx-auto shadow-sm">
                  <Bot size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">¡Bienvenido Docente!</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-8">
                    ¿En qué puedo ayudarte hoy? Puedo darte ideas para actividades, ayudarte con adaptaciones PT/AL o resolver dudas sobre REA.
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pregúntame algo sobre educación..."
                className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center mt-3">
              Potenciado por Gemini 3 Flash • IA Experimental
            </p>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-5 rounded-[24px] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative"
        >
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">IA</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
