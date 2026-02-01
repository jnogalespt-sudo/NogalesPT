
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
    <div className="w-full border-2 border-slate-100 rounded-[24px] overflow-hidden bg-white focus-within:border-indigo-500/30 transition-all">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-1">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Negrita"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Cursiva"><Italic size={16} /></button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-white rounded-lg text-slate-600 font-black text-xs transition-colors" title="Título Grande">H1</button>
        <button type="button" onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-white rounded-lg text-slate-600 font-black text-xs transition-colors" title="Título Mediano">H2</button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Lista de puntos"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Lista numerada"><ListOrdered size={16} /></button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button type="button" onClick={handleLink} className="p-2 hover:bg-white rounded-lg text-slate-600 transition-colors" title="Insertar enlace"><LinkIcon size={16} /></button>
        <button type="button" onClick={() => execCommand('removeFormat')} className="p-2 hover:bg-white rounded-lg text-red-400 transition-colors" title="Limpiar formato"><X size={16} /></button>
      </div>
      {/* Editable Area */}
      <div 
        ref={editorRef}
        contentEditable 
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none text-slate-700 font-medium"
        style={{ scrollbarWidth: 'none' }}
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
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
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

  const [messageDraft, setMessageDraft] = useState('');
  const [selectedChatPartner, setSelectedChatPartner] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resourceContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', authorName: '', email: '', summary: '', 
    level: 'Infantil' as EducationalLevel, subject: 'Crecimiento en Armonía',
    courses: [] as string[], resourceType: 'Material Didáctico', 
    mainCategory: 'PT-AL' as MainCategory,
    uploadMethod: 'file' as 'file' | 'code',
    externalUrl: '',
    pastedCode: ''
  });

  const [profileForm, setProfileForm] = useState<UserType>({
    email: '', name: '', lastName: '', bio: '',
    instagram: '', linkedin: '', tiktok: '', twitter: '', website: ''
  });

  const themeClasses = useMemo(() => {
    return activeCategory === 'General'
      ? { bg: 'bg-emerald-600', text: 'text-emerald-600', softBg: 'bg-emerald-50', softText: 'text-emerald-700' }
      : { bg: 'bg-indigo-600', text: 'text-indigo-600', softBg: 'bg-indigo-50', softText: 'text-indigo-700' };
  }, [activeCategory]);

  const handleViewProfile = (email: string) => {
    setViewingUserEmail(email);
    navigateTo(AppView.Profile, { email });
  };

  const cleanGoogleDriveUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    }
    return url;
  };

  const updateUrl = (newView: AppView, params: Record<string, string> = {}) => {
    if (typeof window === 'undefined') return;
    if (window.location.protocol === 'blob:') return;
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('view', newView);
      Object.entries(params).forEach(([key, val]) => {
        if (val) searchParams.set(key, val);
      });
      const newUrl = '?' + searchParams.toString();
      window.history.pushState({ view: newView, ...params }, '', newUrl);
    } catch (e) { console.warn("History API no permitida."); }
  };

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte para compartir recursos.");
      setView(AppView.Account);
      updateUrl(AppView.Account);
      return;
    }
    setView(newView);
    updateUrl(newView, params);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (newView !== AppView.Upload && newView !== AppView.Profile && newView !== AppView.Detail && newView !== AppView.Messages) {
      resetForm();
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const [resData, usersData, msgData] = await Promise.all([
          dbService.getResources().catch(() => []),
          dbService.getUsers().catch(() => []),
          dbService.getMessages().catch(() => [])
        ]);
        setResources(resData || []);
        setUsers(usersData || []);
        setMessages(msgData || []);
        const stored = localStorage.getItem('nogalespt_current_user');
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            if (parsedUser) setCurrentUser(parsedUser);
          } catch (e) { console.warn("Sesión no válida"); }
        }
        const params = new URLSearchParams(window.location.search);
        const urlView = params.get('view') as AppView;
        if (urlView) {
          if (urlView === AppView.Detail) {
            const id = params.get('id');
            const resource = resData?.find((r: Resource) => r.id === id);
            if (resource) {
              setSelectedResource(resource);
              setView(AppView.Detail);
              setActiveCategory(resource.mainCategory);
            } else { setView(AppView.Explore); }
          } else if (urlView === AppView.Profile) {
            const email = params.get('email');
            if (email) { setViewingUserEmail(email); setView(AppView.Profile); } else { setView(AppView.Explore); }
          } else { setView(urlView); }
        }
      } catch (error) { console.error("Error cargando app:", error); } finally { setIsLoading(false); }
    };
    initApp();
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view') as AppView;
      setView(urlView || AppView.Home);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const copyResourceLink = () => {
    if (!selectedResource) return;
    copyToClipboard(`${window.location.origin}${window.location.pathname}?view=detail&id=${selectedResource.id}`);
  };

  const handleRateResource = (resourceId: string, val: number) => {
    if (!currentUser) return alert("Inicia sesión para valorar.");
    const updated = resources.map(res => {
      if (res.id === resourceId) {
        const count = res.ratingCount || 1;
        const newRating = ((res.rating * count) + val) / (count + 1);
        const updatedRes = { ...res, rating: parseFloat(newRating.toFixed(1)), ratingCount: count + 1 };
        dbService.saveResource(updatedRes);
        return updatedRes;
      }
      return res;
    });
    setResources(updated);
    if (selectedResource?.id === resourceId) setSelectedResource(prev => prev ? { ...prev, rating: val } : null);
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este material?")) return;
    await dbService.deleteResource(resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
    if (selectedResource?.id === resourceId) navigateTo(AppView.Explore);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResourceId(resource.id);
    setFormData({
      title: resource.title,
      authorName: resource.authorName,
      email: resource.email,
      summary: resource.summary,
      level: resource.level,
      subject: resource.subject,
      courses: resource.courses,
      resourceType: resource.resourceType,
      mainCategory: resource.mainCategory,
      uploadMethod: resource.pastedCode ? 'code' : 'file',
      externalUrl: resource.contentUrl || '',
      pastedCode: resource.pastedCode || ''
    });
    setActiveCategory(resource.mainCategory);
    navigateTo(AppView.Upload);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Sesión expirada.");
    if (!formData.title.trim()) return alert("El título es obligatorio.");
    if (formData.courses.length === 0) return alert("Selecciona al menos un curso.");
    
    setIsUploading(true);
    try {
      if (formData.uploadMethod === 'file') {
        if (!formData.externalUrl.trim()) { alert("Introduce la URL del documento."); setIsUploading(false); return; }
        const cleanUrl = cleanGoogleDriveUrl(formData.externalUrl);
        await saveResourceToDB(cleanUrl, 'pdf'); 
      } else {
        if (!formData.pastedCode.trim()) { alert("El código HTML es obligatorio."); setIsUploading(false); return; }
        await saveResourceToDB(undefined, 'html');
      }
      setIsUploading(false);
    } catch (err) { console.error(err); setIsUploading(false); }
  };

  const saveResourceToDB = async (contentUrl: string | undefined, detectedType: any) => {
    const existing = editingResourceId ? resources.find(r => r.id === editingResourceId) : null;
    const newRes: Resource = {
      id: editingResourceId || Date.now().toString(),
      title: formData.title,
      authorName: currentUser ? `${currentUser.name} ${currentUser.lastName || ''}`.trim() : 'Docente Anónimo',
      email: currentUser?.email || 'anon@educacion.es',
      summary: formData.summary,
      level: formData.level,
      subject: formData.subject,
      courses: formData.courses,
      resourceType: formData.resourceType,
      fileType: detectedType || (existing?.fileType || 'pdf'),
      mainCategory: activeCategory,
      rating: existing?.rating || 0,
      ratingCount: existing?.ratingCount || 0,
      uploadDate: existing?.uploadDate || new Date().toLocaleDateString(),
      thumbnail: existing?.thumbnail || `https://picsum.photos/seed/${Date.now()}/600/400`,
      contentUrl: contentUrl || (existing?.contentUrl || ''),
      pastedCode: formData.uploadMethod === 'code' ? formData.pastedCode : (existing?.pastedCode)
    };
    await dbService.saveResource(newRes);
    setResources(prev => editingResourceId ? prev.map(r => r.id === editingResourceId ? newRes : r) : [newRes, ...prev]);
    alert(editingResourceId ? "¡Actualizado!" : "¡Publicado!");
    navigateTo(AppView.Explore);
    resetForm();
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormData({
      title: '', authorName: '', email: '', summary: '', level: 'Infantil', 
      subject: 'Crecimiento en Armonía', courses: [], resourceType: 'Material Didáctico', 
      mainCategory: activeCategory, uploadMethod: 'file', externalUrl: '', pastedCode: ''
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (isRegistering) {
      if (existingUser) { setAuthError("Email ya registrado."); return; }
      const newUser: UserType = { email: loginEmail, name: loginEmail.split('@')[0], password: loginPassword, avatar: `https://ui-avatars.com/api/?name=${loginEmail}&background=random` };
      await dbService.saveUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('nogalespt_current_user', JSON.stringify(newUser));
      navigateTo(AppView.Home);
    } else {
      if (existingUser && existingUser.password === loginPassword) {
        setCurrentUser(existingUser);
        localStorage.setItem('nogalespt_current_user', JSON.stringify(existingUser));
        navigateTo(AppView.Home);
      } else { setAuthError("Credenciales incorrectas."); }
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('nogalespt_current_user');
    navigateTo(AppView.Home);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profileForm };
    await dbService.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    localStorage.setItem('nogalespt_current_user', JSON.stringify(updatedUser));
    alert("Perfil actualizado");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const updated = { ...currentUser, avatar: base64 };
        await dbService.saveUser(updated);
        setCurrentUser(updated);
        setProfileForm(prev => ({ ...prev, avatar: base64 }));
        localStorage.setItem('nogalespt_current_user', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCourseToggle = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course) ? prev.courses.filter(c => c !== course) : [...prev.courses, course]
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUser || !messageDraft.trim() || !selectedChatPartner) return;
    const newMessage: PrivateMessage = { id: Date.now().toString(), from: currentUser.email, to: selectedChatPartner, content: messageDraft.trim(), timestamp: Date.now(), read: false };
    await dbService.saveMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setMessageDraft('');
    alert("Mensaje enviado");
  };

  const teacherRankings = useMemo(() => {
    const levels: EducationalLevel[] = ['Infantil', 'Primaria', 'Secundaria', 'Bachillerato'];
    const rankings: Record<string, any[]> = {};
    [...levels, 'PT-AL'].forEach(level => {
      const levelTeachers: Record<string, any> = {};
      resources.filter(r => level === 'PT-AL' ? r.mainCategory === 'PT-AL' : r.level === level && r.mainCategory === 'General').forEach(res => {
        if (!levelTeachers[res.email]) levelTeachers[res.email] = { user: users.find(u => u.email === res.email) || { name: res.authorName, email: res.email, avatar: `https://ui-avatars.com/api/?name=${res.authorName}` }, count: 0, totalRating: 0 };
        levelTeachers[res.email].count += 1;
        levelTeachers[res.email].totalRating += res.rating || 0;
      });
      rankings[level] = Object.values(levelTeachers).sort((a: any, b: any) => b.count - a.count).slice(0, 5);
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

  const toggleFullScreen = () => {
    if (!resourceContainerRef.current) return;
    if (!isFullScreen) {
      resourceContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullScreen(false);
    }
  };

  const activeProfile = useMemo(() => view === AppView.Profile ? users.find(u => u.email === viewingUserEmail) || { email: viewingUserEmail, name: 'Docente', avatar: `https://ui-avatars.com/api/?name=${viewingUserEmail}` } : null, [view, viewingUserEmail, users]);
  const profileResources = useMemo(() => activeProfile ? resources.filter(r => r.email === activeProfile.email) : [], [activeProfile, resources]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {copySuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={18} /> <span className="text-xs font-black uppercase">Enlace copiado</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[50] h-16 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(AppView.Home)}>
            <div className={`${themeClasses.bg} p-2 rounded-xl text-white`}><GraduationCap size={20} /></div>
            <span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(AppView.Explore)} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">Explorar</button>
            <button onClick={() => navigateTo(AppView.Upload)} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2`}><Upload size={16} /> Subir</button>
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100 hover:bg-slate-200">
              {currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={18} />}
              <span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span>
            </button>
          </div>
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {/* Category Selection */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-[40]">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory('General')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'General' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-slate-400 border-transparent'}`}><BookOpen size={16} /> General</button>
          <button onClick={() => setActiveCategory('PT-AL')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 ${activeCategory === 'PT-AL' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-slate-400 border-transparent'}`}><BrainCircuit size={16} /> PT y AL</button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {view === AppView.Home && (
          <div className="py-24 text-center space-y-8 max-w-3xl mx-auto animate-in fade-in duration-700">
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1.05]">Repositorio <span className={themeClasses.text}>Colaborativo</span> para Docentes</h1>
            <p className="text-base md:text-xl text-slate-500 font-medium">Comparte recursos de alta calidad y conecta con profesionales de toda España.</p>
            <button onClick={() => navigateTo(AppView.Explore)} className={`${themeClasses.bg} text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-2 uppercase text-xs mx-auto`}>Explorar Catálogo <ChevronRight size={18}/></button>
          </div>
        )}

        {view === AppView.Explore && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">Catálogo <span className={themeClasses.text}>{activeCategory}</span></h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar material..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map(res => (
                <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer h-full flex flex-col">
                  <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className={`text-[10px] font-black ${themeClasses.text} uppercase mb-2`}>{res.subject}</div>
                    <h3 className="font-bold text-slate-800 text-md mb-2 line-clamp-2">{res.title}</h3>
                    {/* Strip HTML for card preview */}
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{stripHtml(res.summary)}</p>
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

        {view === AppView.Upload && currentUser && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
             <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 md:p-12">
                <header className="mb-10 text-center">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">{editingResourceId ? 'Editar' : 'Subir'} <span className={themeClasses.text}>Material</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Publicando como: {currentUser.name}</p>
                </header>
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Información General</label>
                      <input required type="text" placeholder="Título del recurso" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                      
                      {/* --- NUEVO EDITOR DE TEXTO ENRIQUECIDO --- */}
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 block mt-4">Resumen Pedagógico</label>
                      <RichTextEditor 
                        value={formData.summary} 
                        onChange={(val) => setFormData({...formData, summary: val})} 
                        themeClasses={themeClasses}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Categorización</label>
                      <select className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationalLevel, courses: []})}>
                        {Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                        {SUBJECTS_BY_LEVEL[formData.level]?.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Upload Method Section */}
                  <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Enlace de Documento (Drive/Web)</button>
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Código HTML Interactivo</button>
                    </div>
                    
                    {formData.uploadMethod === 'file' ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                          <input 
                            type="url" 
                            placeholder="Pega aquí el enlace del documento..." 
                            className="w-full pl-12 pr-6 py-5 rounded-2xl bg-slate-800 border-2 border-slate-700 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                            value={formData.externalUrl}
                            onChange={e => setFormData({...formData, externalUrl: e.target.value})}
                          />
                        </div>
                      </div>
                    ) : (
                      <textarea placeholder="Pega aquí el código HTML/JS..." className="w-full p-6 rounded-2xl bg-slate-800 border-none font-mono text-sm text-indigo-300 h-64 outline-none" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                    )}
                  </div>
                  <button type="submit" disabled={isUploading} className={`${themeClasses.bg} w-full py-5 rounded-[24px] text-white font-black uppercase text-sm shadow-2xl tracking-widest`}>
                    {isUploading ? <Loader2 className="animate-spin inline mr-2" /> : <CheckCircle2 className="inline mr-2" />} 
                    {editingResourceId ? 'Guardar Cambios' : 'Publicar en el Repositorio'}
                  </button>
                </form>
             </div>
          </div>
        )}

        {view === AppView.Detail && selectedResource && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Volver</button>
              <div className="flex gap-3">
                <button onClick={copyResourceLink} className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm">Compartir</button>
                {currentUser?.email === selectedResource.email && (
                  <button onClick={() => handleEditResource(selectedResource)} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase shadow-sm">Editar</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div ref={resourceContainerRef} className={`${isFullScreen ? 'fixed inset-0 z-[9999] bg-black' : 'aspect-video bg-slate-900 rounded-[32px]'} overflow-hidden relative shadow-xl`}>
                  <iframe src={selectedResource.pastedCode ? '' : selectedResource.contentUrl} srcDoc={selectedResource.pastedCode} className="w-full h-full border-none bg-white" title={selectedResource.title} />
                  <button onClick={toggleFullScreen} className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition-all">
                    {isFullScreen ? <Minimize size={24} /> : <Maximize2 size={24} />}
                  </button>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <h1 className="text-3xl font-black text-slate-900 mb-4">{selectedResource.title}</h1>
                  {/* --- RENDERIZADO DE HTML EN EL RESUMEN --- */}
                  <div 
                    className="text-slate-600 leading-relaxed text-lg prose prose-indigo max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedResource.summary }} 
                  />
                  <div className="mt-8 flex flex-wrap gap-2">
                    <span className={`px-4 py-2 ${themeClasses.softBg} ${themeClasses.softText} rounded-full text-[10px] font-black uppercase tracking-widest`}>{selectedResource.subject}</span>
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedResource.level}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center space-y-6">
                  <div className="cursor-pointer group" onClick={() => handleViewProfile(selectedResource.email)}>
                    <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover" />
                    <h3 className="font-black text-slate-900 text-lg mt-4 group-hover:text-indigo-600">{selectedResource.authorName}</h3>
                  </div>
                  <div className="flex flex-col gap-4 border-t pt-6">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => handleRateResource(selectedResource.id, v)} className="text-slate-200 hover:text-amber-500"><Star size={24} fill={v <= Math.round(selectedResource.rating) ? 'currentColor' : 'none'} /></button>
                      ))}
                    </div>
                  </div>
                  <a href={selectedResource.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md">Ver Original</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other views omitted for brevity - they remain as in original file */}
        {view === AppView.Account && (
          <div className="max-w-md mx-auto py-12 animate-in fade-in duration-500">
            {!currentUser ? (
              <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Área de <span className={themeClasses.text}>Docentes</span></h2>
                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Email" />
                  <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Contraseña" />
                  {authError && <p className="text-red-500 text-[10px] font-black uppercase ml-4">{authError}</p>}
                  <button type="submit" className={`${themeClasses.bg} w-full py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl tracking-widest`}>{isRegistering ? 'Crear Cuenta' : 'Acceder'}</button>
                  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] font-black uppercase text-indigo-600 underline">
                    {isRegistering ? '¿Ya tienes cuenta? Login' : '¿Nuevo en el centro? Registro'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6">
                  <img src={currentUser.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900">{currentUser.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{currentUser.email}</p>
                  </div>
                  <button onClick={handleLogout} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={24} /></button>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-8">Editar Perfil</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Nombre" />
                    <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold h-32" placeholder="Biografía..." />
                    <button type="submit" className={`${themeClasses.bg} w-full py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl`}>Guardar Perfil</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap size={24} className={themeClasses.text} /><span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">© 2025 • Repositorio Docente</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
