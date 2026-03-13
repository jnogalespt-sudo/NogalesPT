
import React, { useState, useMemo, useRef, useEffect, Suspense, lazy } from 'react';
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
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL, NEAE_OPTIONS, DESARROLLO_AREAS, BLOG_CATEGORIES, GTM_ID, SafeAny } from './constants';
import { dbService, supabase } from './services/dbService';

import RichTextEditor from './components/RichTextEditor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
const ResourceDetail = lazy(() => import('./views/ResourceDetail'));
const BlogView = lazy(() => import('./views/BlogView'));
const ExploreFilters = lazy(() => import('./components/ExploreFilters').then(module => ({ default: module.ExploreFilters })));
const ExploreGrid = lazy(() => import('./components/ExploreGrid').then(module => ({ default: module.ExploreGrid })));
const UploadView = lazy(() => import('./views/UploadView').then(module => ({ default: module.UploadView })));
const AccountView = lazy(() => import('./views/AccountView').then(module => ({ default: module.AccountView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(module => ({ default: module.ProfileView })));
const TopDocentesView = lazy(() => import('./views/TopDocentesView').then(module => ({ default: module.TopDocentesView })));
import { stripHtml, renderContentWithVideos } from './utils/helpers';
import { useTeacherRankings } from './hooks/useTeacherRankings';
import { useSeoManager } from './hooks/useSeoManager';
import { useCookieManager } from './hooks/useCookieManager';

const getInitialView = (): AppView => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as AppView;
    if (viewParam && Object.values(AppView).includes(viewParam)) {
      return viewParam;
    }
  }
  return AppView.Home;
};

const getInitialUserEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === AppView.Profile) {
      return params.get('user');
    }
  }
  return null;
};

const getInitialBlogCategory = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === AppView.Blog) {
      return params.get('category') || 'Todo';
    }
  }
  return 'Todo';
};

const App: React.FC = () => {
  const { cookieConsent, showCookieBanner, handleAcceptCookies, handleRejectCookies } = useCookieManager();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [view, setView] = useState<AppView>(getInitialView());
  const [activeCategory, setActiveCategory] = useState<MainCategory>('PT-AL');
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>(getInitialBlogCategory());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('Todos');
  const [filterNeae, setFilterNeae] = useState<string>('Todos');
  const [filterDesarrollo, setFilterDesarrollo] = useState<string>('Todos');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(getInitialUserEmail());
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
        // 1. SWR: Load from cache first
        if (typeof window !== 'undefined') {
          const cachedResources = localStorage.getItem('nogalespt_cached_resources');
          if (cachedResources) {
            try {
              const parsed = JSON.parse(cachedResources);
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (isMounted) {
                  setResources(parsed);
                  setIsLoading(false); // Make UI usable instantly
                }
              }
            } catch (e) {
              console.warn('Error parsing cached resources', e);
            }
          }
        }

        // 2. Fetch fresh data
        const [resData, usersData] = await Promise.all([
          dbService.getResources().catch(() => []),
          dbService.getUsers().catch(() => [])
        ]);
        
        if (!isMounted) return;
        
        // 3. Update state with fresh data
        const finalResources = resData || [];
        setResources(finalResources);
        setUsers(usersData || []);

        // 4. Update cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('nogalespt_cached_resources', JSON.stringify(finalResources));
        }

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
            if (viewParam === AppView.Detail && idParam) {
              const found = finalResources.find((r: Resource) => r.id === idParam);
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

  const activeProfile = useMemo(() => users.find(u => u.email === viewingUserEmail) || null, [users, viewingUserEmail]);
  const profileResources = useMemo(() => resources.filter(r => r.email === viewingUserEmail), [resources, viewingUserEmail]);

  useSeoManager(view, selectedResource, activeBlogCategory, activeCategory, stripHtml);

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

  const teacherRankings = useTeacherRankings(resources, users);

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

  if (urlParamsState.isStandalone && urlParamsState.standaloneId) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      );
    }

    const res = resources.find(r => r.id === urlParamsState.standaloneId);

    if (!res) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 border border-slate-100">
            <Newspaper size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recurso no encontrado</h2>
            <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
              El material que intentas visualizar en pantalla completa no está disponible.
            </p>
          </div>
          <button 
            onClick={() => {if(typeof window !== 'undefined') window.close()}}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            Cerrar ventana
          </button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-hidden">
        <iframe 
          src={res.pastedCode ? '' : res.contentUrl} 
          srcDoc={res.pastedCode} 
          className="w-full h-full border-none" 
          title={res.title} 
        />
        <button 
          onClick={() => {if(typeof window !== 'undefined') window.close()}} 
          className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-105 transition-all text-slate-900 border border-slate-200 hover:bg-white"
        >
          <X size={24} />
        </button>
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
        <Suspense fallback={<div className="flex py-24 items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div></div>}>
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
              isLoading={isLoading}
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

              <ExploreGrid
                filteredResources={filteredResources}
                themeClasses={themeClasses}
                setSelectedResource={setSelectedResource}
                navigateTo={navigateTo}
                stripHtml={stripHtml}
                isLoading={isLoading}
              />
            </div>
          )}

          {view === AppView.TopDocentes && (
            <TopDocentesView
              teacherRankings={teacherRankings}
              themeClasses={themeClasses}
              setViewingUserEmail={setViewingUserEmail}
              navigateTo={navigateTo}
              isLoading={isLoading}
            />
          )}

          {view === AppView.Profile && (
            <ProfileView
              activeProfile={activeProfile}
              profileResources={profileResources}
              themeClasses={themeClasses}
              navigateTo={navigateTo}
              setSelectedResource={setSelectedResource}
              isLoading={isLoading}
            />
          )}

          {view === AppView.Account && (
            <AccountView
              currentUser={currentUser}
              themeClasses={themeClasses}
              handleGoogleLogin={handleGoogleLogin}
              isRegistering={isRegistering}
              handleRegister={handleRegister}
              handleLogin={handleLogin}
              registerName={registerName}
              setRegisterName={setRegisterName}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              authError={authError}
              setAuthError={setAuthError}
              setIsRegistering={setIsRegistering}
              setCurrentUser={setCurrentUser}
              navigateTo={navigateTo}
              handleUpdateProfile={handleUpdateProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              isLoading={isLoading}
            />
          )}

          {view === AppView.Upload && (currentUser || isLoading) && (
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
              isLoading={isLoading}
            />
          )}

          {view === AppView.Detail && (
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
              isLoading={isLoading}
            />
          )}
        </Suspense>
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
