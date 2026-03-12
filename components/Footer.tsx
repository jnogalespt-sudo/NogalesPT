import React from 'react';
import { GraduationCap } from 'lucide-react';

interface FooterProps {
  themeClasses: { bg: string; text: string; softBg: string; softText: string };
}

const Footer: React.FC<FooterProps> = ({ themeClasses }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 mt-24 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <GraduationCap size={32} className={themeClasses.text} />
        <span className="text-2xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">© 2025 • Blog y Repositorio Docente Colaborativo para Andalucía</p>
    </footer>
  );
};

export default Footer;
