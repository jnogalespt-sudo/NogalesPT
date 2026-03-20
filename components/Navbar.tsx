import React from 'react';
import { 
  GraduationCap, Upload, User as UserIcon, Menu, X, 
  LayoutGrid, Newspaper, Trophy, UserCircle 
} from 'lucide-react';
import { AppView, User as UserType } from '../types';

interface NavbarProps {
  navigateTo: (view: AppView, params?: Record<string, string>) => void;
  themeClasses: { bg: string; text: string; softBg: string; softText: string };
  currentUser: UserType | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigateTo, themeClasses, currentUser, isMenuOpen, setIsMenuOpen }) => {
  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[50] h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(AppView.Home)}>
            <div className={`${themeClasses.bg} p-2 rounded-xl text-white`}><GraduationCap size={20} /></div>
            <span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(AppView.Explore)} className="text-xs font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors">Explorar</button>
            <button onClick={() => navigateTo(AppView.Blog)} className="text-xs font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors">Blog</button>
            <button onClick={() => navigateTo(AppView.TopDocentes)} className="text-xs font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors">Ranking</button>
            <button onClick={() => navigateTo(AppView.Dev, { fromNavbar: 'true' })} className="text-xs font-black uppercase text-slate-500 hover:text-indigo-600 transition-colors">Dev</button>
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
              <button onClick={() => navigateTo(AppView.Upload, { fromNavbar: 'true' })} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}><Upload size={16} /> Subir</button>
            )}
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100 hover:bg-slate-200 transition-colors">{currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" alt="Avatar" /> : <UserIcon size={18} />}<span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span></button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b"><span className="text-xl font-black uppercase tracking-tighter">MENÚ</span><button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button></div>
            <div className="flex-1 p-6 space-y-6">
              <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><LayoutGrid size={20} /> Explorar</button>
              <button onClick={() => navigateTo(AppView.Blog)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><Newspaper size={20} /> Blog</button>
              <button onClick={() => navigateTo(AppView.TopDocentes)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><Trophy size={20} /> Ranking</button>
              <button onClick={() => navigateTo(AppView.Dev, { fromNavbar: 'true' })} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><LayoutGrid size={20} /> Dev</button>
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                <button onClick={() => navigateTo(AppView.Upload, { fromNavbar: 'true' })} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><Upload size={20} /> Subir Material</button>
              )}
              <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><UserCircle size={20} /> Mi Cuenta</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
