
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Upload, Star, Download, Info, User as UserIcon, Menu, X, FileUp, 
  FileText, PlayCircle, Book, ArrowLeft, Settings, Save, UserCircle, 
  Code, FileBox, Eye, Filter, ChevronRight, LayoutGrid,
  GraduationCap, Globe, BrainCircuit, Layers, BookOpen, ExternalLink,
  Focus, FileCode, Maximize, Trophy, Medal, Users, TrendingUp,
  Loader2, AlertCircle, Monitor, CheckCircle2, Instagram, Linkedin, 
  Share2, Camera, LogOut, Mail, Link as LinkIcon, RefreshCw, Image as ImageIcon, Music, Lock, EyeOff, Minimize,
  Twitter, AtSign, Send, MessageCircle, Trash2, Edit3, ShieldAlert, KeyRound,
  Layers3, Maximize2, Inbox, Copy, Check, LogIn, Type, List, ListOrdered, Bold, Italic, Heading1, Heading2,
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Quote, Table as TableIcon, 
  Eraser, Hash, Palette, Indent, Outdent, Minus, Smile, Newspaper, ShieldCheck
} from 'lucide-react';
import { AppView, Resource, User as UserType, EducationalLevel, MainCategory, PrivateMessage } from './types';
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL } from './constants';
import { dbService, supabase } from './services/dbService';

import RichTextEditor from './components/RichTextEditor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ResourceDetail from './views/ResourceDetail';
import BlogView from './views/BlogView';
import { ExploreFilters } from './components/ExploreFilters';
import { UploadView } from './views/UploadView';
import { stripHtml, renderContentWithVideos } from './utils/helpers';

// --- CONSTANTES NEAE Y DESARROLLO ---
const NEAE_OPTIONS = ['Dislexia', 'TDAH', 'Autismo (TEA)', 'Trastorno Específico del Lenguaje (TEL)', 'Discapacidad Intelectual', 'Trastorno Grave del Desarrollo', 'Discapacidad Visual', 'Discapacidad Auditiva', 'Discapacidad física', 'Altas Capacidades Intelectuales', 'Educación Compensatoria', 'Trastornos Graves de Conducta'];
const DESARROLLO_AREAS = ['Cognitiva', 'comunicativa', 'social y emocional', 'psicomotor', 'motor'];

// --- SOLUCIÓN TÉCNICA TS7015 RADICAL ---
type SafeAny = any;

// --- CONSTANTES DEL BLOG ---
const BLOG_CATEGORIES = [
  'Todo', 
  'Dislexia', 
  'Autismo (TEA)', 
  'TEL', 
  'TDAH', 
  'Desarrollo Comunicativo-lingüítico', 
  'Desarrollo Cognitivo', 
  'Desarrollo Social', 
  'DUA', 
  'Pedagogía Terapéutica (PT)', 
  'Audición y Lenguaje (AL)'
];

// --- CONFIGURACIÓN TÉCNICA ---
const GTM_ID = 'GTM-PCMTTC42';

const SocialLink = ({ platform, handle }: { platform: 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'website', handle?: string }) => {
  if (!handle) return null;
  const platforms = {
    instagram: { icon: Instagram, color: 'hover:text-pink-600 hover:bg-pink-50', url: (h: string) => `https://instagram.com/${h}`, label: 'Instagram' },
    linkedin: { icon: Linkedin, color: 'hover:text-blue-700 hover:bg-blue-50', url: (h: string) => `https://linkedin.com/in/${h}`, label: 'LinkedIn' },
    tiktok: { icon: Music, color: 'hover:text-slate-900 hover:bg-slate-100', url: (h: string) => `https://tiktok.com/@${h}`, label: 'TikTok' },
    twitter: { icon: Twitter, color: 'hover:text-sky-500 hover:bg-sky-50', url: (h: string) => `https://twitter.com/${h}`, label: 'Twitter' },
    website: { icon: Globe, color: 'hover:text-emerald-600 hover:bg-emerald-50', url: (h: string) => h.startsWith('http') ? h : `https://${h}`, label: 'Web' }
  };
  const config = (platforms as SafeAny)[platform];
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

  // --- ESTADO DE COOKIES Y RGPD ---
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const [view, setView] = useState<AppView>(AppView.Home);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('PT-AL');
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>('Todo');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [filterNeae, setFilterNeae] = useState<string>('Todos');
  const [filterDesarrollo, setFilterDesarrollo] = useState<string>('Todos');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');

  const [formData, setFormData] = useState({
    title: '', summary: '', level: 'Infantil' as EducationalLevel, subject: 'Crecimiento en Armonía',
    courses: [] as string[], resourceType: 'Material Didáctico', 
    mainCategory: 'PT-AL' as MainCategory, uploadMethod: 'file' as 'file' | 'code',
    externalUrl: '', pastedCode: '', kind: 'material' as 'material' | 'blog',
    neae: '', desarrolloArea: '', thumbnailUrl: ''
  });

  const [profileForm, setProfileForm] = useState<UserType>({
    email: '', name: '', lastName: '', bio: '',
    instagram: '', linkedin: '', tiktok: '', twitter: '', website: ''
  });

  // --- LÓGICA DE GTM (PROTEGIDA) ---
  const initGTM = () => {
    if (typeof window === 'undefined' || (window as any).gtmInitialized || cookieConsent !== true) return;
    
    (function(w: any, d: any, s: any, l: any, i: any){
      w[l] = w[l] || [];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l='+l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      if (f && f.parentNode) f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
    
    (window as any).gtmInitialized = true;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedConsent = localStorage.getItem('nogalespt_cookie_consent');
    if (savedConsent === 'accepted') {
      setCookieConsent(true);
    } else if (savedConsent === 'rejected') {
      setCookieConsent(false);
    } else {
      setShowCookieBanner(true);
    }

    const handleOpenBanner = () => setShowCookieBanner(true);
    window.addEventListener('open-cookie-banner', handleOpenBanner);
    return () => window.removeEventListener('open-cookie-banner', handleOpenBanner);
  }, []);

  useEffect(() => {
    if (cookieConsent === true) {
      initGTM();
    }
  }, [cookieConsent]);

  const handleAcceptCookies = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nogalespt_cookie_consent', 'accepted');
    setCookieConsent(true);
    setShowCookieBanner(false);
  };

  const handleRejectCookies = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nogalespt_cookie_consent', 'rejected');
    setCookieConsent(false);
    setShowCookieBanner(false);
  };

  const [urlParamsState, setUrlParamsState] = useState<{isStandalone: boolean, standaloneId: string | null}>({
    isStandalone: false,
    standaloneId: null
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParamsState({
        isStandalone: params.get('standalone') === 'true',
        standaloneId: params.get('id')
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let initialLoadDone = false;

    const loadDataAndAuth = async (session: any) => {
      try {
        const [resData, usersData] = await Promise.all([
          dbService.getResources().catch(() => []),
          dbService.getUsers().catch(() => [])
        ]);
        
        if (!isMounted) return;
        
        setResources(resData || []);
        setUsers(usersData || []);

        if (session?.user) {
          const uEmail = session.user.email || '';
          let user = usersData.find(u => u.email === uEmail);
          
          if (!user) {
            user = {
              email: uEmail,
              name: session.user.user_metadata?.full_name || uEmail.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${uEmail}&background=random`
            };
            await dbService.saveUser(user);
            if (isMounted) {
              setUsers(prev => {
                if (!prev.find(u => u.email === uEmail)) {
                  return [...prev, user!];
                }
                return prev;
              });
            }
          }
          
          if (isMounted) {
            setCurrentUser(user);
            setProfileForm(user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
            }
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('nogalespt_current_user');
            }
          }
        }

        if (!initialLoadDone && typeof window !== 'undefined' && isMounted) {
          const params = new URLSearchParams(window.location.search);
          const viewParam = params.get('view') as AppView;
          const idParam = params.get('id');

          if (viewParam) {
            setView(viewParam);
            if (viewParam === AppView.Detail && idParam) {
              const found = resData.find((r: Resource) => r.id === idParam);
              if (found) setSelectedResource(found);
            }
          }
          initialLoadDone = true;
        }
      } catch (error) {
        console.error("Error cargando app:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        loadDataAndAuth(session);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nogalespt_current_user');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await dbService.signInWithGoogle();
    } catch (err: any) {
      setAuthError("Error al conectar con Google: " + err.message);
    }
  };

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte para compartir contenido.");
      setView(AppView.Account);
      return;
    }
    setView(newView);
    setIsMenuOpen(false);
    
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const searchParams = new URLSearchParams();
        searchParams.set('view', newView);
        if (params.id) searchParams.set('id', params.id);
        if (params.user) searchParams.set('user', params.user);
        if (params.category) searchParams.set('category', params.category);
        window.history.pushState({}, '', `?${searchParams.toString()}`);
      } catch (e) {
        console.warn("Navegación URL limitada.");
      }
    }

    if (![AppView.Upload, AppView.Profile, AppView.Detail].includes(newView)) {
      resetForm();
    }
  };

  const themeClasses = useMemo(() => {
    return activeCategory === 'General'
      ? { bg: 'bg-emerald-600', text: 'text-emerald-600', softBg: 'bg-emerald-50', softText: 'text-emerald-700' }
      : { bg: 'bg-indigo-600', text: 'text-indigo-600', softBg: 'bg-indigo-50', softText: 'text-indigo-700' };
  }, [activeCategory]);

  const activeProfile = useMemo(() => users.find(u => u.email === viewingUserEmail), [users, viewingUserEmail]);
  const profileResources = useMemo(() => resources.filter(r => r.email === viewingUserEmail), [resources, viewingUserEmail]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let title = "NOGALESPT - Repositorio Educativo Colaborativo";
    let description = "Materiales de calidad, interactivos y adaptados para maestros de PT y AL en Andalucía. Repositorio docente colaborativo.";
    let image = "https://nogalespt.com/logo.png";

    if (view === AppView.Detail && selectedResource) {
      title = `${selectedResource.title} | NogalesPT`;
      description = stripHtml(selectedResource.summary);
      if (selectedResource.thumbnail) image = selectedResource.thumbnail;
    } else if (view === AppView.Blog) {
      title = activeBlogCategory === 'Todo' ? "Blog Educativo | NOGALESPT" : `Estrategias sobre ${activeBlogCategory} | NOGALESPT`;
    }

    document.title = title;
    
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('title', title);
    updateMeta('description', description);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    
    if (typeof window !== 'undefined') {
      updateMeta('og:url', window.location.href, 'property');
    }
  }, [view, selectedResource, activeBlogCategory, activeCategory]);

  const cleanGoogleDriveUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    }
    return url;
  };



  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const handleCourseToggle = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course) ? prev.courses.filter(c => c !== course) : [...prev.courses, course]
    }));
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResourceId(resource.id);
    setFormData({
      title: resource.title,
      summary: resource.summary,
      level: resource.level,
      subject: resource.subject,
      courses: resource.courses,
      resourceType: resource.resourceType,
      mainCategory: resource.mainCategory,
      uploadMethod: resource.pastedCode ? 'code' : 'file',
      externalUrl: resource.contentUrl || '',
      pastedCode: resource.pastedCode || '',
      kind: resource.kind || 'material',
      neae: resource.neae || '',
      desarrolloArea: resource.desarrolloArea || '',
      thumbnailUrl: resource.thumbnail && !resource.thumbnail.includes('picsum.photos') ? resource.thumbnail : ''
    });
    navigateTo(AppView.Upload);
  };

  const handleDeleteResource = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm("¿Eliminar definitivamente?")) return;
    try {
      await dbService.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      setSelectedResource(null);
      navigateTo(AppView.Explore);
    } catch (err) { console.error(err); }
  };

  const teacherRankings = useMemo(() => {
    const rankings: Record<string, any[]> = {};
    const levels: string[] = ['Infantil', 'Primaria', 'Secundaria', 'Bachillerato', 'PT-AL'];
    
    levels.forEach(level => {
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
      if (res.kind === 'blog') return false; 
      const matchesCategory = res.mainCategory === activeCategory;
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === 'Todos' || res.level === filterLevel;
      const matchesNeae = filterNeae === 'Todos' || res.neae === filterNeae;
      const matchesDesarrollo = filterDesarrollo === 'Todos' || res.desarrolloArea === filterDesarrollo;
      return matchesCategory && matchesSearch && matchesLevel && matchesNeae && matchesDesarrollo;
    });
  }, [resources, activeCategory, searchQuery, filterLevel, filterNeae, filterDesarrollo]);

  const filteredBlogPosts = useMemo(() => {
    return resources.filter(res => {
      if (res.kind !== 'blog') return false;
      const matchesCategory = activeBlogCategory === 'Todo' || res.subject === activeBlogCategory;
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [resources, activeBlogCategory, searchQuery]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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
        thumbnail: formData.thumbnailUrl.trim() !== '' ? formData.thumbnailUrl.trim() : `https://picsum.photos/seed/${Date.now()}/600/400`,
        contentUrl: cleanUrl || '',
        pastedCode: formData.uploadMethod === 'code' ? formData.pastedCode : undefined,
        kind: formData.kind,
        neae: activeCategory === 'PT-AL' && formData.kind === 'material' ? formData.neae : undefined,
        desarrolloArea: activeCategory === 'PT-AL' && formData.kind === 'material' ? formData.desarrolloArea : undefined
      };
      await dbService.saveResource(newRes);
      setResources(prev => editingResourceId ? prev.map(r => r.id === editingResourceId ? newRes : r) : [newRes, ...prev]);
      if (typeof window !== 'undefined') window.alert("Contenido guardado.");
      navigateTo(formData.kind === 'blog' ? AppView.Blog : AppView.Explore);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setCurrentUser(user);
      setProfileForm(user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
      }
    } else { setAuthError("Credenciales incorrectas."); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email === loginEmail)) { setAuthError("Ya registrado."); return; }
    const newUser: UserType = {
      email: loginEmail, name: registerName, password: loginPassword,
      avatar: `https://ui-avatars.com/api/?name=${registerName}&background=random`
    };
    await dbService.saveUser(newUser);
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setProfileForm(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nogalespt_current_user', JSON.stringify(newUser));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profileForm };
    await dbService.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nogalespt_current_user', JSON.stringify(updatedUser));
      window.alert("Perfil actualizado");
    }
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormData({
      title: '', summary: '', level: 'Infantil', 
      subject: (SUBJECTS_BY_LEVEL as SafeAny)['Infantil'][0], 
      courses: [], resourceType: 'Material Didáctico', 
      mainCategory: activeCategory, uploadMethod: 'file', externalUrl: '', pastedCode: '', kind: 'material',
      neae: '', desarrolloArea: '', thumbnailUrl: ''
    });
  };

  const handleMaximize = () => {
    if (!selectedResource || typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}?standalone=true&id=${selectedResource.id}`;
    window.open(url, '_blank');
  };

  const handleBlogCategoryClick = (cat: string) => {
    setActiveBlogCategory(cat);
    navigateTo(AppView.Blog, { category: cat });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-6"><div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">NOGALES<span className="text-indigo-600">PT</span></h2></div>;

  if (urlParamsState.isStandalone && urlParamsState.standaloneId) {
    const res = resources.find(r => r.id === urlParamsState.standaloneId);
    if (!res) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Recurso no encontrado</div>;
    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-hidden">
        <iframe src={res.pastedCode ? '' : res.contentUrl} srcDoc={res.pastedCode} className="w-full h-full border-none" title={res.title} />
        <button onClick={() => {if(typeof window !== 'undefined') window.close()}} className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-105 transition-all text-slate-900 border border-slate-200"><X size={24} /></button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {copySuccess && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in"><Check size={18} /> <span className="text-xs font-black uppercase">Enlace copiado</span></div>}

      <Navbar 
        navigateTo={navigateTo} 
        themeClasses={themeClasses} 
        currentUser={currentUser} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      {view !== AppView.Blog && view !== AppView.Account && view !== AppView.TopDocentes && (
        <div className="bg-white border-b border-slate-200 sticky top-16 z-[40]">
          <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
            <button onClick={() => { setActiveCategory('General'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 transition-all ${activeCategory === 'General' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><BookOpen size={16} /> General</button>
            <button onClick={() => { setActiveCategory('PT-AL'); navigateTo(AppView.Explore); }} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase border-b-2 transition-all ${activeCategory === 'PT-AL' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><BrainCircuit size={16} /> PT y AL</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {view === AppView.Home && (
          <div className="py-24 text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05]">Repositorio <span className={themeClasses.text}>Colaborativo</span> para Docentes</h1>
            <p className="text-lg text-slate-500 font-medium">Materiales de calidad, interactivos y adaptados para maestros de PT y AL.</p>
            <button onClick={() => navigateTo(AppView.Explore)} className={`${themeClasses.bg} text-white px-10 py-5 rounded-2xl font-black shadow-xl uppercase text-xs mx-auto hover:scale-105 transition-transform`}>Explorar Ahora</button>
          </div>
        )}

        {view === AppView.Blog && (
          <BlogView 
            filteredBlogPosts={filteredBlogPosts}
            activeBlogCategory={activeBlogCategory}
            handleBlogCategoryClick={handleBlogCategoryClick}
            setSelectedResource={setSelectedResource}
            navigateTo={navigateTo}
            BLOG_CATEGORIES={BLOG_CATEGORIES}
            stripHtml={stripHtml}
          />
        )}

        {view === AppView.Explore && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <ExploreFilters
              activeCategory={activeCategory}
              themeClasses={themeClasses}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterLevel={filterLevel}
              setFilterLevel={setFilterLevel}
              filterNeae={filterNeae}
              setFilterNeae={setFilterNeae}
              filterDesarrollo={filterDesarrollo}
              setFilterDesarrollo={setFilterDesarrollo}
              SUBJECTS_BY_LEVEL={SUBJECTS_BY_LEVEL}
              NEAE_OPTIONS={NEAE_OPTIONS}
              DESARROLLO_AREAS={DESARROLLO_AREAS}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredResources.map(res => (
                <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-[24px] border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col">
                  <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-105" /></div>
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
          <div className="space-y-12 animate-in fade-in duration-500">
            <header className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Muro de <span className={themeClasses.text}>Excelencia</span></h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Maestros que más aportan</p>
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
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Volver</button>
            <div className="bg-white p-8 md:p-16 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 items-center md:items-start">
              <img src={activeProfile.avatar || `https://ui-avatars.com/api/?name=${activeProfile.name}`} className="w-40 h-40 md:w-60 md:h-60 rounded-[48px] object-cover border-8 border-slate-50 shadow-2xl" />
              <div className="flex-1 space-y-6 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">{activeProfile.name} {activeProfile.lastName || ''}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2"><Mail size={16} className={themeClasses.text}/> {activeProfile.email}</p>
                {activeProfile.bio && <p className="text-lg text-slate-600 leading-relaxed font-medium">{activeProfile.bio}</p>}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <SocialLink platform="instagram" handle={activeProfile.instagram} /><SocialLink platform="linkedin" handle={activeProfile.linkedin} /><SocialLink platform="tiktok" handle={activeProfile.tiktok} /><SocialLink platform="twitter" handle={activeProfile.twitter} /><SocialLink platform="website" handle={activeProfile.website} />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 uppercase">Contenido de este <span className={themeClasses.text}>Docente</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileResources.map(res => (
                  <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl group cursor-pointer flex flex-col">
                    <div className="h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-800 text-sm mb-2 truncate group-hover:text-indigo-600 transition-colors">{res.title}</h4>
                      <div className="mt-auto flex items-center justify-between">
                        <div className={`text-[10px] font-black ${themeClasses.text} uppercase`}>{res.subject}</div>
                        {res.kind === 'blog' && <Newspaper size={12} className="text-slate-300" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.Account && (
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
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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
        )}

        {view === AppView.Upload && currentUser && (
          <UploadView
            editingResourceId={editingResourceId}
            themeClasses={themeClasses}
            handleUpload={handleUpload}
            formData={formData}
            setFormData={setFormData}
            SUBJECTS_BY_LEVEL={SUBJECTS_BY_LEVEL}
            BLOG_CATEGORIES={BLOG_CATEGORIES}
            activeCategory={activeCategory}
            NEAE_OPTIONS={NEAE_OPTIONS}
            DESARROLLO_AREAS={DESARROLLO_AREAS}
            COURSES_BY_LEVEL={COURSES_BY_LEVEL}
            handleCourseToggle={handleCourseToggle}
            isUploading={isUploading}
          />
        )}

        {view === AppView.Detail && selectedResource && (
          <ResourceDetail 
            selectedResource={selectedResource}
            currentUser={currentUser}
            users={users}
            themeClasses={themeClasses}
            cookieConsent={cookieConsent}
            navigateTo={navigateTo}
            handleEditResource={handleEditResource}
            handleDeleteResource={handleDeleteResource}
            copyToClipboard={copyToClipboard}
            setViewingUserEmail={setViewingUserEmail}
            handleMaximize={handleMaximize}
            renderContentWithVideos={renderContentWithVideos}
          />
        )}
      </main>

      <Footer themeClasses={themeClasses} />

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-8 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-7xl mx-auto bg-slate-900 text-white rounded-[32px] p-6 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-800 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md bg-slate-900/95">
            <div className="bg-indigo-600/20 p-4 rounded-3xl text-indigo-400">
              <ShieldCheck size={40} />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h4 className="text-lg font-black uppercase tracking-tight">Tu privacidad es fundamental</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia docente, analizar el tráfico y mostrar contenido multimedia.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button onClick={handleRejectCookies} className="px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95">Rechazar</button>
              <button onClick={handleAcceptCookies} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95">Aceptar Cookies</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
