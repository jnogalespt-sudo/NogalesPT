
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Upload, Star, Download, Info, User as UserIcon, Menu, X, FileUp, 
  FileText, PlayCircle, Book, ArrowLeft, Settings, Save, UserCircle, 
  Code, FileBox, Eye, Filter, ChevronRight, LayoutGrid,
  GraduationCap, Globe, BrainCircuit, Layers, BookOpen, ExternalLink,
  Focus, FileCode, Maximize, Trophy, Medal, Users, TrendingUp,
  Loader2, AlertCircle, Monitor, CheckCircle2, Instagram, Linkedin, 
  Share2, Camera, LogOut, Mail, Link as LinkIcon, RefreshCw, Image as ImageIcon, Music, Lock, EyeOff, Minimize,
  Twitter, AtSign, Send, MessageCircle, Trash2, Edit3, ShieldAlert, KeyRound, Zap,
  Layers3, Maximize2, Inbox, Copy, Check, LogIn, Type, List, ListOrdered, Bold, Italic, Heading1, Heading2
} from 'lucide-react';
import { AppView, Resource, User as UserType, EducationalLevel, MainCategory, PrivateMessage } from './types';
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL } from './constants';
import { dbService } from './services/dbService';

// --- UTILIDADES ---
const stripHtml = (html: string) => {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// --- COMPONENTES AUXILIARES ---
const RichTextEditor = ({ value, onChange, themeClasses }: { value: string, onChange: (val: string) => void, themeClasses: any }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    const url = prompt("Introduce la URL del enlace:");
    if (url) execCommand("createLink", url);
  };

  return (
    <div className="w-full border-2 border-slate-100 rounded-[24px] overflow-hidden bg-white focus-within:border-indigo-500/30 transition-all shadow-inner">
      <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-1">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors"><Italic size={16} /></button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-white rounded-lg text-slate-600 font-black text-xs">H1</button>
        <button type="button" onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-white rounded-lg text-slate-600 font-black text-xs">H2</button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg text-slate-600"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-white rounded-lg text-slate-600"><ListOrdered size={16} /></button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={handleLink} className="p-2 hover:bg-white rounded-lg text-slate-600"><LinkIcon size={16} /></button>
        <button type="button" onClick={() => execCommand('removeFormat')} className="p-2 hover:bg-white rounded-lg text-red-400"><X size={16} /></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable 
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[180px] outline-none prose prose-sm max-w-none text-slate-700 font-medium bg-white"
      />
    </div>
  );
};

const SocialLink = ({ platform, handle }: { platform: 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'website', handle?: string }) => {
  if (!handle) return null;
  const platforms = {
    instagram: { icon: Instagram, color: 'hover:text-pink-600 hover:bg-pink-50', url: (h: string) => `https://instagram.com/${h}`, label: 'Instagram' },
    linkedin: { icon: Linkedin, color: 'hover:text-blue-700 hover:bg-blue-50', url: (h: string) => `https://linkedin.com/in/${h}`, label: 'LinkedIn' },
    tiktok: { icon: Music, color: 'hover:text-slate-900 hover:bg-slate-100', url: (h: string) => `https://tiktok.com/@${h}`, label: 'TikTok' },
    twitter: { icon: Twitter, color: 'hover:text-sky-500 hover:bg-sky-50', url: (h: string) => `https://twitter.com/${h}`, label: 'Twitter' },
    website: { icon: Globe, color: 'hover:text-emerald-600 hover:bg-emerald-50', url: (h: string) => h.startsWith('http') ? h : `https://${h}`, label: 'Web' }
  };
  const config = platforms[platform as keyof typeof platforms];
  if (!config) return null;
  return (
    <a href={config.url(handle)} target="_blank" rel="noopener noreferrer" title={config.label} className={`p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all text-slate-400 ${config.color} hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center`}>
      <config.icon size={18} />
    </a>
  );
};

const App: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [view, setView] = useState<AppView>(AppView.Home);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('PT-AL');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [filterCourse, setFilterCourse] = useState<string>('Todos');
  const [filterSubject, setFilterSubject] = useState<string>('Todas');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const resourceContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', summary: '', level: 'Infantil' as EducationalLevel, subject: 'Crecimiento en Armonía',
    courses: [] as string[], resourceType: 'Material Didáctico', 
    mainCategory: 'PT-AL' as MainCategory, uploadMethod: 'file' as 'file' | 'code',
    externalUrl: '', pastedCode: ''
  });

  const [profileForm, setProfileForm] = useState<UserType>({
    email: '', name: '', lastName: '', bio: '',
    instagram: '', linkedin: '', tiktok: '', twitter: '', website: ''
  });

  // --- Manejo de modo Standalone para compartir ---
  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = urlParams.get('standalone') === 'true';
  const standaloneId = urlParams.get('id');

  const themeClasses = useMemo(() => {
    return activeCategory === 'General'
      ? { bg: 'bg-emerald-600', text: 'text-emerald-600', softBg: 'bg-emerald-50', softText: 'text-emerald-700' }
      : { bg: 'bg-indigo-600', text: 'text-indigo-600', softBg: 'bg-indigo-50', softText: 'text-indigo-700' };
  }, [activeCategory]);

  const cleanGoogleDriveUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    }
    return url;
  };

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte para compartir recursos.");
      setView(AppView.Account);
      return;
    }
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (newView !== AppView.Upload && newView !== AppView.Profile && newView !== AppView.Detail) {
      resetForm();
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const [resData, usersData] = await Promise.all([
          dbService.getResources().catch(() => []),
          dbService.getUsers().catch(() => [])
        ]);
        setResources(resData || []);
        setUsers(usersData || []);
        const stored = localStorage.getItem('nogalespt_current_user');
        if (stored) {
          const parsedUser = JSON.parse(stored);
          if (parsedUser) {
            setCurrentUser(parsedUser);
            setProfileForm(parsedUser);
          }
        }
      } catch (error) { console.error("Error cargando app:", error); } finally { setIsLoading(false); }
    };
    initApp();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCourseToggle = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course) ? prev.courses.filter(c => c !== course) : [...prev.courses, course]
    }));
  };

  const teacherRankings = useMemo(() => {
    const levels: EducationalLevel[] = ['Infantil', 'Primaria', 'Secundaria', 'Bachillerato'];
    const rankings: Record<string, any[]> = {};
    
    [...levels, 'PT-AL'].forEach(level => {
      const levelTeachers: Record<string, any> = {};
      const levelResources = resources.filter(r => 
        level === 'PT-AL' ? r.mainCategory === 'PT-AL' : r.level === level && r.mainCategory === 'General'
      );
      
      levelResources.forEach(res => {
        const user = users.find(u => u.email === res.email) || { 
          email: res.email, 
          name: res.authorName || 'Docente', 
          avatar: `https://ui-avatars.com/api/?name=${res.authorName || 'Docente'}&background=random` 
        };
        if (!levelTeachers[res.email]) levelTeachers[res.email] = { user, count: 0, totalRating: 0, ratedResourcesCount: 0 };
        levelTeachers[res.email].count += 1;
        levelTeachers[res.email].totalRating += res.rating || 0;
        levelTeachers[res.email].ratedResourcesCount += 1;
      });
      
      rankings[level] = Object.values(levelTeachers).map((t: any) => {
        const avg = t.ratedResourcesCount > 0 ? t.totalRating / t.ratedResourcesCount : 0;
        const score = (t.count * 10) + (avg * 5);
        return { ...t, avgRating: avg, score };
      }).sort((a, b) => b.score - a.score).slice(0, 5);
    });
    return rankings;
  }, [resources, users]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesCategory = res.mainCategory === activeCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = res.title.toLowerCase().includes(lowerQuery) || res.authorName.toLowerCase().includes(lowerQuery);
      const matchesLevel = filterLevel === 'Todos' || res.level === filterLevel;
      const matchesCourse = filterCourse === 'Todos' || res.courses.includes(filterCourse);
      const matchesSubject = filterSubject === 'Todas' || res.subject === filterSubject;
      return matchesCategory && matchesSearch && matchesLevel && matchesCourse && matchesSubject;
    });
  }, [resources, activeCategory, searchQuery, filterLevel, filterCourse, filterSubject]);

  const activeProfile = useMemo(() => {
    return users.find(u => u.email === viewingUserEmail);
  }, [users, viewingUserEmail]);

  const profileResources = useMemo(() => {
    return resources.filter(r => r.email === viewingUserEmail);
  }, [resources, viewingUserEmail]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (formData.courses.length === 0) return alert("Debes seleccionar al menos un curso destinatario.");
    setIsUploading(true);
    try {
      const cleanUrl = formData.uploadMethod === 'file' ? cleanGoogleDriveUrl(formData.externalUrl) : undefined;
      const newRes: Resource = {
        id: editingResourceId || Date.now().toString(),
        title: formData.title,
        authorName: currentUser.name,
        email: currentUser.email,
        summary: formData.summary,
        level: formData.level,
        subject: formData.subject,
        courses: formData.courses,
        resourceType: formData.resourceType,
        fileType: formData.uploadMethod === 'code' ? 'html' : 'pdf',
        mainCategory: activeCategory,
        rating: editingResourceId ? resources.find(r => r.id === editingResourceId)?.rating || 0 : 0,
        uploadDate: new Date().toLocaleDateString(),
        thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`,
        contentUrl: cleanUrl || '',
        pastedCode: formData.uploadMethod === 'code' ? formData.pastedCode : undefined
      };
      await dbService.saveResource(newRes);
      setResources(prev => editingResourceId ? prev.map(r => r.id === editingResourceId ? newRes : r) : [newRes, ...prev]);
      alert("¡Material compartido con la comunidad!");
      navigateTo(AppView.Explore);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      setProfileForm(user);
      localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
      navigateTo(AppView.Home);
    } else {
      setAuthError("Credenciales incorrectas.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profileForm };
    await dbService.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem('nogalespt_current_user', JSON.stringify(updatedUser));
    alert("Perfil actualizado");
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormData({
      title: '', summary: '', level: 'Infantil', 
      subject: 'Crecimiento en Armonía', courses: [], resourceType: 'Material Didáctico', 
      mainCategory: activeCategory, uploadMethod: 'file', externalUrl: '', pastedCode: ''
    });
  };

  // --- Manejo del botón de maximizar ---
  // AHORA ESTÁ ESTANDARIZADO PARA TODOS LOS DISPOSITIVOS (IGUAL QUE MÓVIL)
  const handleMaximize = () => {
    if (!selectedResource) return;
    // Abre siempre en una pestaña funcional y compartible
    const url = `${window.location.origin}${window.location.pathname}?standalone=true&id=${selectedResource.id}`;
    window.open(url, '_blank');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-6">
    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">NOGALES<span className="text-indigo-600">PT</span></h2>
  </div>;

  // --- Vista Standalone (Solo el recurso a pantalla completa) ---
  if (isStandalone && standaloneId) {
    const res = resources.find(r => r.id === standaloneId);
    if (!res) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Recurso no encontrado</div>;
    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-hidden">
        <iframe 
          src={res.pastedCode ? '' : res.contentUrl} 
          srcDoc={res.pastedCode} 
          className="w-full h-full border-none" 
          title={res.title} 
        />
        <button 
          onClick={() => window.close()} 
          className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-105 transition-all text-slate-900 border border-slate-200"
        >
          <X size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {copySuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Check size={18} /> <span className="text-xs font-black uppercase">Enlace copiado</span>
        </div>
      )}

      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[50] h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(AppView.Home)}>
            <div className={`${themeClasses.bg} p-2 rounded-xl text-white`}><GraduationCap size={20} /></div>
            <span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(AppView.Explore)} className="text-xs font-black uppercase text-slate-500">Explorar</button>
            <button onClick={() => navigateTo(AppView.TopDocentes)} className="text-xs font-black uppercase text-slate-500">Ranking</button>
            <button onClick={() => navigateTo(AppView.Upload)} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2`}><Upload size={16} /> Subir</button>
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100">
              {currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={18} />}
              <span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span>
            </button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b">
              <span className="text-xl font-black uppercase tracking-tighter">MENÚ</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600 transition-colors">
                <LayoutGrid size={20} /> Explorar
              </button>
              <button onClick={() => navigateTo(AppView.TopDocentes)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600 transition-colors">
                <Trophy size={20} /> Ranking
              </button>
              <button onClick={() => navigateTo(AppView.Upload)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600 transition-colors">
                <Upload size={20} /> Subir Material
              </button>
              <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600 transition-colors">
                <UserCircle size={20} /> Mi Cuenta
              </button>
            </div>
            <div className="p-8 border-t bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className={`${themeClasses.bg} p-2 rounded-xl text-white`}><GraduationCap size={20} /></div>
                 <span className="text-sm font-black uppercase tracking-tighter text-slate-900">NOGALES<span className={themeClasses.text}>PT</span></span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-[40]">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory('General')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'General' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-slate-400 border-transparent'}`}><BookOpen size={16} /> General</button>
          <button onClick={() => setActiveCategory('PT-AL')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'PT-AL' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-slate-400 border-transparent'}`}><BrainCircuit size={16} /> PT y AL</button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {view === AppView.Home && (
          <div className="py-24 text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05]">Repositorio <span className={themeClasses.text}>Colaborativo</span> para Docentes</h1>
            <p className="text-lg text-slate-500 font-medium">Materiales de calidad, interactivos y adaptados para maestros de PT y AL.</p>
            <button onClick={() => navigateTo(AppView.Explore)} className={`${themeClasses.bg} text-white px-10 py-5 rounded-2xl font-black shadow-xl uppercase text-xs mx-auto`}>Explorar Ahora</button>
          </div>
        )}

        {view === AppView.Explore && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Explorar <span className={themeClasses.text}>{activeCategory}</span></h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar por título o autor..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 font-bold shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map(res => (
                <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail); }} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col">
                  <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className={`text-[10px] font-black ${themeClasses.text} uppercase mb-2`}>{res.subject}</div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2">{res.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">{stripHtml(res.summary)}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>{res.authorName}</span>
                      <div className="flex items-center gap-1 text-amber-500"><Star size={14} fill="currentColor" /> {res.rating}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === AppView.TopDocentes && (
          <div className="space-y-12">
            <header className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Muro de <span className={themeClasses.text}>Excelencia</span></h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Maestros que más aportan a la comunidad</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Object.entries(teacherRankings) as [string, any[]][]).map(([level, teachers]) => (
                <div key={level} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`${themeClasses.bg} p-2 rounded-xl text-white shadow-md`}><Trophy size={18} /></div>
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">{level}</h3>
                  </div>
                  <div className="space-y-6">
                    {teachers.map((teacher, idx) => (
                      <div key={teacher.user.email} className="flex items-center gap-4 cursor-pointer group" onClick={() => { setViewingUserEmail(teacher.user.email); navigateTo(AppView.Profile); }}>
                        <img src={teacher.user.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{teacher.user.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{teacher.count} recursos</p>
                        </div>
                        <div className="text-amber-500 font-black text-xs flex items-center gap-1"><Star size={14} fill="currentColor"/> {teacher.avgRating.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === AppView.Upload && currentUser && (
          <div className="max-w-4xl mx-auto">
             <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 md:p-12">
                <header className="mb-10 text-center">
                  <h2 className="text-3xl font-black text-slate-900 uppercase">Compartir <span className={themeClasses.text}>Material</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-2">Nivel actual: {activeCategory}</p>
                </header>
                <form onSubmit={handleUpload} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Título del Recurso</label>
                        <input required type="text" placeholder="Ej: Adaptación Curricular Matemáticas..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Resumen Pedagógico</label>
                        <RichTextEditor value={formData.summary} onChange={(val) => setFormData({...formData, summary: val})} themeClasses={themeClasses} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Nivel y Asignatura</label>
                        <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold mb-4" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationalLevel, courses: []})}>
                          {Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                          {SUBJECTS_BY_LEVEL[formData.level]?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Cursos Destinatarios (Selección Múltiple)</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl">
                          {COURSES_BY_LEVEL[formData.level]?.map(course => (
                            <button
                              key={course}
                              type="button"
                              onClick={() => handleCourseToggle(course)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                                formData.courses.includes(course)
                                  ? `${themeClasses.bg} border-transparent text-white shadow-md scale-105`
                                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              {course}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-8">
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Enlace PDF/Drive</button>
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Incrustar HTML</button>
                    </div>
                    {formData.uploadMethod === 'file' ? (
                      <div className="relative">
                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input type="url" placeholder="https://drive.google.com/..." className="w-full pl-14 pr-6 py-6 rounded-2xl bg-slate-800 border-2 border-slate-700 font-bold text-white focus:border-indigo-500 transition-colors" value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} />
                      </div>
                    ) : (
                      <textarea placeholder="Pega tu código HTML aquí..." className="w-full p-6 rounded-2xl bg-slate-800 border-none font-mono text-sm text-indigo-300 h-48" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                    )}
                  </div>
                  <button type="submit" disabled={isUploading} className={`${themeClasses.bg} w-full py-6 rounded-[28px] text-white font-black uppercase text-sm shadow-2xl tracking-widest hover:scale-[1.02] transition-transform`}>
                    {isUploading ? <Loader2 className="animate-spin inline mr-2" /> : <CheckCircle2 className="inline mr-2" />} 
                    {editingResourceId ? 'Guardar Cambios' : 'Compartir ahora'}
                  </button>
                </form>
             </div>
          </div>
        )}

        {view === AppView.Profile && activeProfile && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"><ArrowLeft size={18}/> Volver</button>
            <div className="bg-white p-8 md:p-16 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 items-center md:items-start">
              <img src={activeProfile.avatar || `https://ui-avatars.com/api/?name=${activeProfile.name}&background=random`} className="w-40 h-40 md:w-60 md:h-60 rounded-[48px] object-cover border-8 border-slate-50 shadow-2xl" />
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{activeProfile.name} {activeProfile.lastName}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><Mail size={16} className={themeClasses.text}/> {activeProfile.email}</p>
                </div>
                {activeProfile.bio && <p className="text-lg text-slate-600 leading-relaxed font-medium">{activeProfile.bio}</p>}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <SocialLink platform="instagram" handle={activeProfile.instagram} />
                  <SocialLink platform="linkedin" handle={activeProfile.linkedin} />
                  <SocialLink platform="tiktok" handle={activeProfile.tiktok} />
                  <SocialLink platform="twitter" handle={activeProfile.twitter} />
                  <SocialLink platform="website" handle={activeProfile.website} />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Materiales de este <span className={themeClasses.text}>Docente</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileResources.map(res => (
                  <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail); }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                    <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                    <div className="p-5"><h4 className="font-bold text-slate-800 text-sm mb-2 truncate">{res.title}</h4><div className={`text-[10px] font-black ${themeClasses.text} uppercase`}>{res.subject}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.Account && (
          <div className="max-w-5xl mx-auto py-12">
            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Área de <span className={themeClasses.text}>Docentes</span></h2>
                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Email institucional" />
                  <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Contraseña" />
                  {authError && <p className="text-red-500 text-[10px] font-black uppercase ml-4">{authError}</p>}
                  <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-2xl text-white font-black uppercase text-xs shadow-xl tracking-widest`}>Acceder al centro</button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                  <img src={currentUser.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900">{currentUser.name} {currentUser.lastName}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUser.email}</p>
                  </div>
                  <button onClick={() => { setCurrentUser(null); localStorage.removeItem('nogalespt_current_user'); navigateTo(AppView.Home); }} className="p-5 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={24} /></button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest flex items-center gap-2"><UserCircle size={18} className={themeClasses.text}/> Mi Perfil Docente</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Nombre" />
                        <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Apellidos" />
                      </div>
                      <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold h-32" placeholder="Biografía pedagógica..." />
                      <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-3xl text-white font-black uppercase text-xs tracking-widest shadow-xl`}><Save size={18} className="inline mr-2"/> Guardar Perfil</button>
                    </form>
                  </div>
                  <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><Share2 size={18} className={themeClasses.text}/> Presencia Digital</h3>
                    <div className="space-y-5">
                      <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm" placeholder="Usuario Instagram" /></div>
                      <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.linkedin} onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm" placeholder="Usuario LinkedIn" /></div>
                      <div className="relative"><Music className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.tiktok} onChange={e => setProfileForm({...profileForm, tiktok: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm" placeholder="Usuario TikTok" /></div>
                      <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm" placeholder="URL Web Personal" /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === AppView.Detail && selectedResource && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Volver</button>
              <button onClick={() => { if(selectedResource) { const url = `${window.location.origin}/?view=detail&id=${selectedResource.id}`; copyToClipboard(url); }}} className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm">Compartir</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div ref={resourceContainerRef} className="aspect-video bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative">
                  <iframe src={selectedResource.pastedCode ? '' : selectedResource.contentUrl} srcDoc={selectedResource.pastedCode} className="w-full h-full border-none bg-white" title={selectedResource.title} />
                  <button onClick={handleMaximize} className="absolute bottom-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition-all">
                    <Maximize2 size={24} />
                  </button>
                </div>
                <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100">
                  <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight">{selectedResource.title}</h1>
                  <div className="text-slate-600 leading-relaxed text-lg prose prose-indigo max-w-none mb-12" dangerouslySetInnerHTML={{ __html: selectedResource.summary }} />
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-5 py-2.5 ${themeClasses.softBg} ${themeClasses.softText} rounded-full text-[10px] font-black uppercase tracking-widest`}>{selectedResource.subject}</span>
                    <span className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedResource.level}</span>
                    {selectedResource.courses.map(c => <span key={c} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">{c}</span>)}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 text-center space-y-8">
                  <div className="cursor-pointer group" onClick={() => { setViewingUserEmail(selectedResource.email); navigateTo(AppView.Profile); }}>
                    <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-28 h-28 rounded-[36px] mx-auto shadow-xl object-cover group-hover:scale-105 transition-transform" />
                    <h3 className="font-black text-slate-900 text-xl mt-6 group-hover:text-indigo-600 transition-colors">{selectedResource.authorName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Autoría verificada</p>
                  </div>
                  <div className="flex flex-col gap-4 border-t border-slate-50 pt-8">
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={async () => {
                          const resToRate = resources.find(r => r.id === selectedResource.id);
                          if (!resToRate) return;
                          const currentCount = resToRate.ratingCount || 1;
                          const currentRating = resToRate.rating || 0;
                          const updatedRating = ((currentRating * currentCount) + v) / (currentCount + 1);
                          const updatedResource: Resource = { ...resToRate, rating: Number(updatedRating.toFixed(1)), ratingCount: currentCount + 1 };
                          setResources(prev => prev.map(r => r.id === selectedResource.id ? updatedResource : r));
                          setSelectedResource(updatedResource);
                          await dbService.saveResource(updatedResource);
                        }} className="text-slate-100 hover:text-amber-500 transition-colors">
                          <Star size={28} fill={v <= Math.round(selectedResource.rating) ? 'currentColor' : 'none'} className={v <= Math.round(selectedResource.rating) ? 'text-amber-500' : 'text-slate-200'} />
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Valora este material</p>
                  </div>
                  <a href={selectedResource.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-colors">Ver Original Externo</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap size={32} className={themeClasses.text} /><span className="text-2xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">© 2025 • Repositorio Docente Colaborativo de Andalucía</p>
          <div className="flex justify-center gap-6 pt-4">
             <Globe size={18} className="text-slate-300" />
             <Zap size={18} className="text-slate-300" />
             <ShieldAlert size={18} className="text-slate-300" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
