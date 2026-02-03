
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
  Layers3, Maximize2, Inbox, Copy, Check, LogIn, Type, List, ListOrdered, Bold, Italic, Heading1, Heading2,
  ShieldCheck, Shield
} from 'lucide-react';
import { AppView, Resource, User as UserType, EducationalLevel, MainCategory } from './types';
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL } from './constants';
import { dbService } from './services/dbService';

// --- UTILIDADES DE BLINDAJE ---

/**
 * Procesa el contenido HTML para evitar bloqueos del firewall escolar.
 * Detecta Base64 y reemplaza CDNs por librerías locales.
 */
const shieldHTML = (rawContent: string): string => {
  if (!rawContent) return "";
  let content = rawContent.trim();

  // 1. Detección Dual: ¿Es Base64?
  const looksLikeBase64 = !content.startsWith('<') && /^[A-Za-z0-9+/=]+$/.test(content.replace(/\s/g, ""));
  if (looksLikeBase64) {
    try {
      content = atob(content.replace(/\s/g, ""));
    } catch (e) {
      console.warn("Fallo al decodificar Base64");
    }
  }

  // 2. Inyección de Librerías Locales (Blindaje)
  // Reemplazar Tailwind CDN
  content = content.replace(/https:\/\/cdn\.tailwindcss\.com[^\s"']*/g, '/lib/tailwind-local.js');
  
  // Reemplazar Animate.css (captura variaciones de CDN)
  content = content.replace(/https?:\/\/.*animate(\.min)?\.css[^\s"']*/g, '/lib/animate-local.css');

  return content;
};

const renderContentWithVideos = (content: string) => {
  if (!content) return "";
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)/g;
  return content.replace(youtubeRegex, (_match, videoId) => {
    return `
      <div class="my-8 aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 border-4 border-white">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      </div>
    `;
  });
};

// --- COMPONENTES DEL VISOR ---

const ShieldedIframe = ({ content, url, title, className }: { content?: string, url?: string, title: string, className?: string }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (content) {
      const processed = shieldHTML(content);
      const blob = new Blob([processed], { type: 'text/html' });
      const newUrl = URL.createObjectURL(blob);
      setBlobUrl(newUrl);
      return () => URL.revokeObjectURL(newUrl);
    }
  }, [content]);

  return (
    <div className={`relative flex flex-col bg-slate-100 overflow-hidden ${className}`}>
      {/* Barra Superior de Conexión Segura */}
      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Conexión Segura Local</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-xs font-bold text-white/50 truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Blindado</span>
          </div>
          <Monitor size={14} className="text-white/10" />
        </div>
      </div>
      
      {/* Frame del Juego */}
      <div className="flex-1 relative bg-white">
        <iframe 
          src={blobUrl || url} 
          className="absolute inset-0 w-full h-full border-none" 
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, themeClasses }: { value: string, onChange: (val: string) => void, themeClasses: any }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);
  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
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
      </div>
      <div ref={editorRef} onInput={(e) => onChange(e.currentTarget.innerHTML)} contentEditable className="p-4 min-h-[180px] outline-none prose prose-sm max-w-none text-slate-700 font-medium bg-white" />
    </div>
  );
};

const SocialLink = ({ platform, handle }: { platform: string, handle?: string }) => {
  if (!handle) return null;
  const platforms: any = {
    instagram: { icon: Instagram, color: 'hover:text-pink-600 hover:bg-pink-50', url: (h: string) => `https://instagram.com/${h}` },
    linkedin: { icon: Linkedin, color: 'hover:text-blue-700 hover:bg-blue-50', url: (h: string) => `https://linkedin.com/in/${h}` },
    tiktok: { icon: Music, color: 'hover:text-slate-900 hover:bg-slate-100', url: (h: string) => `https://tiktok.com/@${h}` },
    twitter: { icon: Twitter, color: 'hover:text-sky-500 hover:bg-sky-50', url: (h: string) => `https://twitter.com/${h}` },
    website: { icon: Globe, color: 'hover:text-emerald-600 hover:bg-emerald-50', url: (h: string) => h.startsWith('http') ? h : `https://${h}` }
  };
  const config = platforms[platform];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <a href={config.url(handle)} target="_blank" rel="noopener noreferrer" className={`p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all text-slate-400 ${config.color} hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center`}>
      <Icon size={18} />
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
  
  const [view, setView] = useState<AppView>(AppView.Home);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('PT-AL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  const activeProfile = useMemo(() => users.find(u => u.email === viewingUserEmail), [users, viewingUserEmail]);
  const profileResources = useMemo(() => resources.filter(res => res.email === viewingUserEmail), [resources, viewingUserEmail]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');

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

  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = urlParams.get('standalone') === 'true';
  const standaloneId = urlParams.get('id');

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte para compartir recursos.");
      setView(AppView.Account);
      return;
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('view', newView);
      if (params.id) searchParams.set('id', params.id);
      if (params.user) searchParams.set('user', params.user);
      searchParams.set('category', activeCategory);
      window.history.pushState({}, '', `?${searchParams.toString()}`);
    } catch (e) { console.warn("Navegación limitada."); }
    if (newView !== AppView.Upload && newView !== AppView.Profile && newView !== AppView.Detail) {
      resetForm();
    }
  };

  const themeClasses = useMemo(() => {
    switch (activeCategory) {
      case 'General': return { bg: 'bg-emerald-600', text: 'text-emerald-600', softBg: 'bg-emerald-50', softText: 'text-emerald-700' };
      case 'PT-AL': return { bg: 'bg-indigo-600', text: 'text-indigo-600', softBg: 'bg-indigo-50', softText: 'text-indigo-700' };
      case 'Programas': return { bg: 'bg-amber-600', text: 'text-amber-600', softBg: 'bg-amber-50', softText: 'text-amber-700' };
      case 'Formacion': return { bg: 'bg-rose-600', text: 'text-rose-600', softBg: 'bg-rose-50', softText: 'text-rose-700' };
      default: return { bg: 'bg-indigo-600', text: 'text-indigo-600', softBg: 'bg-indigo-50', softText: 'text-indigo-700' };
    }
  }, [activeCategory]);

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
          email: res.email, name: res.authorName || 'Docente', 
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
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view') as AppView;
        const idParam = params.get('id');
        const userParam = params.get('user');
        const catParam = params.get('category') as MainCategory;
        if (catParam) setActiveCategory(catParam);
        if (viewParam) {
          setView(viewParam);
          if (viewParam === AppView.Detail && idParam) {
            const found = resData.find((r: Resource) => r.id === idParam);
            if (found) setSelectedResource(found);
          }
          if (viewParam === AppView.Profile && userParam) {
            setViewingUserEmail(userParam);
          }
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    initApp();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchesCategory = res.mainCategory === activeCategory;
      const lowerQuery = searchQuery.toLowerCase();
      return matchesCategory && (res.title.toLowerCase().includes(lowerQuery) || res.authorName.toLowerCase().includes(lowerQuery));
    });
  }, [resources, activeCategory, searchQuery]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUploading(true);
    try {
      const cleanUrl = formData.uploadMethod === 'file' ? formData.externalUrl : undefined;
      const newRes: Resource = {
        id: editingResourceId || Date.now().toString(),
        title: formData.title, authorName: currentUser.name, email: currentUser.email,
        summary: formData.summary, level: formData.level, subject: formData.subject,
        courses: formData.courses, resourceType: formData.resourceType,
        fileType: formData.uploadMethod === 'code' ? 'html' : 'pdf',
        mainCategory: formData.mainCategory, rating: 0,
        uploadDate: new Date().toLocaleDateString(),
        thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`,
        contentUrl: cleanUrl || '',
        pastedCode: formData.uploadMethod === 'code' ? formData.pastedCode : undefined
      };
      await dbService.saveResource(newRes);
      setResources(prev => [newRes, ...prev]);
      navigateTo(AppView.Explore);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const usersData = await dbService.getUsers();
      const user = usersData.find(u => u.email === loginEmail && u.password === loginPassword);
      if (user) {
        setCurrentUser(user);
        setProfileForm(user);
        localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
        navigateTo(AppView.Home);
      } else { setAuthError("Credenciales incorrectas."); }
    } catch (err) { setAuthError("Error de conexión."); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const newUser: UserType = {
        email: loginEmail, name: registerName, password: loginPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registerName)}&background=random`
      };
      await dbService.saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setProfileForm(newUser);
      localStorage.setItem('nogalespt_current_user', JSON.stringify(newUser));
      navigateTo(AppView.Home);
    } catch (err) { setAuthError("Error al registrar."); }
  };

  const resetForm = () => {
    setFormData({
      title: '', summary: '', level: 'Infantil', 
      subject: 'Crecimiento en Armonía', courses: [], resourceType: 'Material Didáctico', 
      mainCategory: activeCategory, uploadMethod: 'file', externalUrl: '', pastedCode: ''
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-16 h-16 border-4 border-t-indigo-600 rounded-full animate-spin"></div></div>;

  // VISOR STANDALONE (BLINDADO PANTALLA COMPLETA)
  if (isStandalone && standaloneId) {
    const res = resources.find(r => r.id === standaloneId);
    if (!res) return <div>Error</div>;
    return (
      <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col">
        <ShieldedIframe 
          content={res.pastedCode} 
          url={res.contentUrl} 
          title={res.title} 
          className="flex-1"
        />
        <button 
          onClick={() => window.close()} 
          className="absolute top-20 right-8 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl shadow-xl hover:scale-105 transition-all text-white border border-white/10 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
        >
          <X size={18} /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <nav className="bg-white border-b sticky top-0 z-[50] h-16 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo(AppView.Home)}>
            <div className={`${themeClasses.bg} p-2 rounded-xl text-white`}><GraduationCap size={20} /></div>
            <span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(AppView.Explore)} className="text-xs font-black uppercase text-slate-500">Explorar</button>
            <button onClick={() => navigateTo(AppView.TopDocentes)} className="text-xs font-black uppercase text-slate-500">Ranking</button>
            <button onClick={() => navigateTo(AppView.Upload)} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2`}><Upload size={16} /> Subir</button>
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100">{currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={18} />}<span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span></button>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b sticky top-16 z-[40]">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          <button onClick={() => { setActiveCategory('General'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[150px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'General' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-slate-400 border-transparent'}`}><BookOpen size={16} /> General</button>
          <button onClick={() => { setActiveCategory('PT-AL'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[150px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'PT-AL' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-slate-400 border-transparent'}`}><BrainCircuit size={16} /> PT y AL</button>
          <button onClick={() => { setActiveCategory('Programas'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[150px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'Programas' ? 'text-amber-600 border-amber-600 bg-amber-50' : 'text-slate-400 border-transparent'}`}><Layers size={16} /> Programas</button>
          <button onClick={() => { setActiveCategory('Formacion'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[150px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'Formacion' ? 'text-rose-600 border-rose-600 bg-rose-50' : 'text-slate-400 border-transparent'}`}><GraduationCap size={16} /> Formación</button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {view === AppView.Home && (
          <div className="py-24 text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05]">Repositorio <span className={themeClasses.text}>Colaborativo</span> para Docentes</h1>
            <p className="text-lg text-slate-500 font-medium">Materiales de calidad e interactivos para maestros de toda Andalucía.</p>
            <button onClick={() => navigateTo(AppView.Explore)} className={`${themeClasses.bg} text-white px-10 py-5 rounded-2xl font-black shadow-xl uppercase text-xs mx-auto`}>Explorar Ahora</button>
          </div>
        )}

        {view === AppView.Explore && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Explorar <span className={themeClasses.text}>{activeCategory}</span></h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map(res => (
                <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-[24px] border overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col">
                  <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover" alt={res.title} /></div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className={`text-[10px] font-black ${themeClasses.text} uppercase mb-2`}>{res.subject}</div>
                    <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2">{res.title}</h3>
                    <div className="mt-auto pt-4 border-t flex justify-between text-[10px] font-bold text-slate-400 uppercase">
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
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Object.entries(teacherRankings) as [string, any[]][]).map(([level, teachers]) => (
                <div key={level} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8"><div className={`${themeClasses.bg} p-2 rounded-xl text-white shadow-md`}><Trophy size={18} /></div><h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">{level}</h3></div>
                  <div className="space-y-6">
                    {teachers.map(teacher => (
                      <div key={teacher.user.email} className="flex items-center gap-4 cursor-pointer group" onClick={() => { setViewingUserEmail(teacher.user.email); navigateTo(AppView.Profile, { user: teacher.user.email }); }}>
                        <img src={teacher.user.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
                        <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-800 text-sm truncate">{teacher.user.name}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">{teacher.count} recursos</p></div>
                        <div className="text-amber-500 font-black text-xs flex items-center gap-1"><Star size={14} fill="currentColor"/> {teacher.avgRating.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === AppView.Profile && activeProfile && (
          <div className="max-w-6xl mx-auto space-y-12">
            <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"><ArrowLeft size={18}/> Volver</button>
            <div className="bg-white p-8 md:p-16 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 items-center md:items-start">
              <img src={activeProfile.avatar || `https://ui-avatars.com/api/?name=${activeProfile.name}`} className="w-40 h-40 md:w-60 md:h-60 rounded-[48px] object-cover border-8 border-slate-50 shadow-2xl" />
              <div className="flex-1 space-y-6 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">{activeProfile.name} {activeProfile.lastName || ''}</h2>
                <p className="text-slate-400 font-bold uppercase text-sm flex items-center justify-center md:justify-start gap-2"><Mail size={16} className={themeClasses.text}/> {activeProfile.email}</p>
                {activeProfile.bio && <p className="text-lg text-slate-600 leading-relaxed font-medium">{activeProfile.bio}</p>}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <SocialLink platform="instagram" handle={activeProfile.instagram} />
                  <SocialLink platform="linkedin" handle={activeProfile.linkedin} />
                  <SocialLink platform="tiktok" handle={activeProfile.tiktok} />
                  <SocialLink platform="website" handle={activeProfile.website} />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Materiales de este <span className={themeClasses.text}>Docente</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileResources.map(res => (
                  <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl group cursor-pointer flex flex-col">
                    <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110" /></div>
                    <div className="p-5 flex-1 flex flex-col"><h4 className="font-bold text-slate-800 text-sm mb-2 truncate">{res.title}</h4><div className={`mt-auto text-[10px] font-black ${themeClasses.text} uppercase`}>{res.subject}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.Detail && selectedResource && (
          <div className="space-y-8 pb-24">
            <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold"><ArrowLeft size={18}/> Volver</button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                {/* Visor Blindado en el Detalle */}
                <div className="aspect-video bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-white">
                  <ShieldedIframe 
                    content={selectedResource.pastedCode} 
                    url={selectedResource.contentUrl} 
                    title={selectedResource.title} 
                    className="w-full h-full"
                  />
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?standalone=true&id=${selectedResource.id}`;
                      window.open(url, '_blank');
                    }} 
                    className="absolute bottom-8 right-8 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg hover:scale-105 transition-all group"
                  >
                    <Maximize size={24} className="text-slate-900" />
                  </button>
                </div>
                <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border">
                  <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight">{selectedResource.title}</h1>
                  <div className="text-slate-600 leading-relaxed text-lg prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: renderContentWithVideos(selectedResource.summary) }} />
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-5 py-2.5 ${themeClasses.softBg} ${themeClasses.softText} rounded-xl text-[10px] font-black uppercase`}>{selectedResource.subject}</span>
                    <span className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase">{selectedResource.level}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[48px] shadow-sm border text-center space-y-8">
                  <div className="cursor-pointer group" onClick={() => { setViewingUserEmail(selectedResource.email); navigateTo(AppView.Profile, { user: selectedResource.email }); }}>
                    <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-28 h-28 rounded-[36px] mx-auto shadow-xl object-cover" alt={selectedResource.authorName} />
                    <h3 className="font-black text-slate-900 text-xl mt-6">{selectedResource.authorName}</h3>
                  </div>
                  <div className="flex flex-col gap-4 border-t pt-8">
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} className="text-slate-200 hover:text-amber-500"><Star size={28} fill={v <= Math.round(selectedResource.rating) ? 'currentColor' : 'none'} /></button>
                      ))}
                    </div>
                  </div>
                  <a href={selectedResource.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest">Fuente Externa</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === AppView.Account && (
          <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-2xl border text-center space-y-8 mt-12">
            {!currentUser ? (
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 text-left">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-center">Área de <span className={themeClasses.text}>Docentes</span></h2>
                {authError && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2"><AlertCircle size={16}/> {authError}</div>}
                {isRegistering && <input required type="text" placeholder="Tu nombre" className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={registerName} onChange={e => setRegisterName(e.target.value)} />}
                <input required type="email" placeholder="Email" className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <input required type="password" placeholder="Contraseña" className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-2xl text-white font-black uppercase text-xs shadow-xl`}>{isRegistering ? 'Registrarse' : 'Acceder'}</button>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>{isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</p>
              </form>
            ) : (
              <div className="space-y-6">
                <img src={currentUser.avatar} className="w-24 h-24 rounded-full mx-auto" alt={currentUser.name} />
                <h2 className="text-2xl font-black">{currentUser.name}</h2>
                <button onClick={() => { setCurrentUser(null); navigateTo(AppView.Home); }} className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-xs">Cerrar Sesión</button>
              </div>
            )}
          </div>
        )}

        {view === AppView.Upload && currentUser && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[40px] shadow-sm border p-8 md:p-12">
              <h2 className="text-3xl font-black text-slate-900 uppercase text-center mb-10">Compartir <span className={themeClasses.text}>Material</span></h2>
              <form onSubmit={handleUpload} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <input required type="text" placeholder="Título..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <RichTextEditor value={formData.summary} onChange={(val) => setFormData({...formData, summary: val})} themeClasses={themeClasses} />
                  </div>
                  <div className="space-y-6">
                    <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationalLevel})}>
                      {Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold" value={formData.mainCategory} onChange={e => setFormData({...formData, mainCategory: e.target.value as MainCategory})}>
                      <option value="General">General</option>
                      <option value="PT-AL">PT y AL</option>
                      <option value="Programas">Programas Específicos</option>
                      <option value="Formacion">Formación Docente</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-8 space-y-8">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Enlace</button>
                    <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>HTML / Base64</button>
                  </div>
                  {formData.uploadMethod === 'file' ? (
                    <input type="url" placeholder="URL..." className="w-full p-6 rounded-2xl bg-slate-800 border-none text-white" value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} />
                  ) : (
                    <textarea placeholder="Pega aquí el código HTML o tu cadena Base64..." className="w-full p-6 rounded-2xl bg-slate-800 border-none font-mono text-sm text-indigo-300 h-48" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                  )}
                </div>
                <button type="submit" disabled={isUploading} className={`${themeClasses.bg} w-full py-6 rounded-[28px] text-white font-black uppercase text-sm shadow-2xl tracking-widest`}>
                  {isUploading ? 'Procesando...' : 'Lanzar al Repositorio'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-16 mt-24 text-center">
        <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap size={32} className={themeClasses.text} /><span className="text-2xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">© 2025 • Repositorio Docente Colaborativo</p>
      </footer>
    </div>
  );
};

export default App;
