import React from 'react';
import { LogOut, UserCircle, Save, Share2, Instagram, Globe, Linkedin } from 'lucide-react';
import { User as UserType, AppView } from '../types';
import { dbService } from '../services/dbService';

interface AccountViewProps {
  currentUser: UserType | null;
  themeClasses: any;
  handleGoogleLogin: () => void;
  isRegistering: boolean;
  handleRegister: (e: React.FormEvent) => void;
  handleLogin: (e: React.FormEvent) => void;
  registerName: string;
  setRegisterName: (val: string) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  authError: string | null;
  setAuthError: (val: string | null) => void;
  setIsRegistering: (val: boolean) => void;
  setCurrentUser: (val: UserType | null) => void;
  navigateTo: (view: AppView) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  profileForm: UserType;
  setProfileForm: (val: UserType) => void;
  isLoading?: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  themeClasses,
  handleGoogleLogin,
  isRegistering,
  handleRegister,
  handleLogin,
  registerName,
  setRegisterName,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  authError,
  setAuthError,
  setIsRegistering,
  setCurrentUser,
  navigateTo,
  handleUpdateProfile,
  profileForm,
  setProfileForm,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex py-24 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      {!currentUser ? (
        <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in duration-300">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Área de <span className={themeClasses.text}>Docentes</span></h2>
          
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-3 hover:bg-slate-50 hover:shadow-md transition-all active:scale-95 group"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Entrar con Google</span>
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">o con email</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 text-left">
            {isRegistering && <input required type="text" value={registerName} onChange={e => setRegisterName(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Tu nombre" />}
            <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Email" />
            <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Contraseña" />
            {authError && <p className="text-red-500 text-[10px] font-black uppercase ml-4">{authError}</p>}
            <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-2xl text-white font-black uppercase text-xs shadow-xl tracking-widest hover:scale-105 active:scale-95 transition-all`}>{isRegistering ? 'Registrarse' : 'Acceder'}</button>
          </form>
          <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">{isRegistering ? '¿Ya tienes cuenta? Accede' : '¿No tienes cuenta? Regístrate'}</button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-slate-100 flex items-center gap-8">
            <img src={currentUser.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-xl" />
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-900">{currentUser.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUser.email}</p>
            </div>
            <button onClick={async () => { await dbService.signOut(); setCurrentUser(null); if(typeof window !== 'undefined') localStorage.removeItem('nogalespt_current_user'); navigateTo(AppView.Home); }} className="p-5 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md"><LogOut size={24} /></button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest flex items-center gap-2"><UserCircle size={18} className={themeClasses.text}/> Configuración de Perfil</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Nombre" />
                  <input type="text" value={profileForm.lastName || ''} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Apellidos" />
                </div>
                <textarea value={profileForm.bio || ''} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold h-32 focus:ring-2 focus:ring-indigo-100 outline-none resize-none" placeholder="Breve biografía..." />
                <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-3xl text-white font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2`}><Save size={18}/> Guardar Cambios</button>
              </form>
            </div>
            <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><Share2 size={18} className={themeClasses.text}/> Presencia Social</h3>
              <div className="space-y-5">
                <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.instagram || ''} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-pink-100" placeholder="Instagram (sin @)" /></div>
                <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.website || ''} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100" placeholder="Web / Portfolio" /></div>
                <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.linkedin || ''} onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="LinkedIn" /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
