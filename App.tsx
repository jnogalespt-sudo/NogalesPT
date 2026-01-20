
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Upload, Star, Download, Info, User as UserIcon, Menu, X, FileUp, 
  FileText, PlayCircle, Book, ArrowLeft, Settings, Save, UserCircle, 
  Code, FileBox, Eye, Sparkles, Filter, ChevronRight, LayoutGrid,
  GraduationCap, Globe, BrainCircuit, Layers, BookOpen, ExternalLink,
  Focus, FileCode, Maximize, Trophy, Medal, Users, TrendingUp,
  Loader2, AlertCircle, Monitor, CheckCircle2, Instagram, Linkedin, 
  Share2, Camera, LogOut, Mail, Link as LinkIcon, RefreshCw, Image as ImageIcon, Music, Lock, EyeOff, Minimize,
  Twitter, AtSign, Send, MessageCircle, Trash2, Edit3, ShieldAlert, KeyRound, Zap,
  Layers3, Maximize2, Inbox, Copy, Check, LogIn
} from 'lucide-react';
import { AppView, Resource, User as UserType, EducationalLevel, MainCategory, PrivateMessage } from './types';
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL } from './constants';
import { dbService, supabase } from './services/dbService';

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
  const [activeCategory, setActiveCategory] = useState<MainCategory>('General');
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resourceContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', authorName: '', email: '', summary: '', 
    level: 'Infantil' as EducationalLevel, subject: 'Crecimiento en Armonía',
    courses: [] as string[], resourceType: 'Material Didáctico', 
    mainCategory: 'General' as MainCategory,
    uploadMethod: 'file' as 'file' | 'code',
    fileName: '', fileBlob: null as File | null,
    pastedCode: ''
  });

  const [profileForm, setProfileForm] = useState<UserType>({
    email: '', name: '', lastName: '', bio: '',
    instagram: '', linkedin: '', tiktok: '', twitter: '', website: ''
  });

  const updateUrl = (newView: AppView, params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.set('view', newView);
    Object.entries(params).forEach(([key, val]) => {
      if (val) searchParams.set(key, val);
    });
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({ view: newView, ...params }, '', newUrl);
  };

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    // Protección de ruta para Upload
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte o iniciar sesión para compartir recursos.");
      setView(AppView.Account);
      updateUrl(AppView.Account);
      setIsMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        const parsedUser = stored ? JSON.parse(stored) : null;
        if (parsedUser) setCurrentUser(parsedUser);

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
            } else {
              setView(AppView.Explore);
            }
          } else if (urlView === AppView.Profile) {
            const email = params.get('email');
            if (email) {
              setViewingUserEmail(email);
              setView(AppView.Profile);
            } else {
              setView(AppView.Explore);
            }
          } else if (urlView === AppView.Upload && !parsedUser) {
            setView(AppView.Account);
            setAuthError("Identifícate para subir materiales.");
          } else {
            setView(urlView);
          }
        }
      } catch (error) {
        console.error("Error inicializando:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();

    const handlePopState = (event: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view') as AppView;
      if (urlView) {
        setView(urlView);
      } else {
        setView(AppView.Home);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (view === AppView.Detail && selectedResource) {
      document.title = `${selectedResource.title} | NOGALESPT`;
    } else if (view === AppView.Profile && viewingUserEmail) {
      const user = users.find(u => u.email === viewingUserEmail);
      document.title = user ? `${user.name} | NOGALESPT` : 'Docente | NOGALESPT';
    } else {
      document.title = 'NOGALESPT - Repositorio Colaborativo';
    }
  }, [view, selectedResource, viewingUserEmail, users]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const copyResourceLink = () => {
    if (!selectedResource) return;
    const url = `${window.location.origin}${window.location.pathname}?view=detail&id=${selectedResource.id}`;
    copyToClipboard(url);
  };

  const copyProfileLink = (email: string) => {
    const url = `${window.location.origin}${window.location.pathname}?view=profile&email=${email}`;
    copyToClipboard(url);
  };

  useEffect(() => {
    if (!editingResourceId) {
      setFormData(prev => ({ 
        ...prev, 
        mainCategory: activeCategory,
        authorName: currentUser ? `${currentUser.name} ${currentUser.lastName || ''}`.trim() : '',
        email: currentUser?.email || ''
      }));
    }
  }, [activeCategory, view, editingResourceId, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        email: currentUser.email,
        name: currentUser.name || '',
        lastName: currentUser.lastName || '',
        bio: currentUser.bio || '',
        instagram: currentUser.instagram || '',
        linkedin: currentUser.linkedin || '',
        tiktok: currentUser.tiktok || '',
        twitter: currentUser.twitter || '',
        website: currentUser.website || '',
        avatar: currentUser.avatar
      });
    }
  }, [currentUser]);

  const themeClasses = {
    bg: activeCategory === 'PT-AL' ? 'bg-indigo-600' : 'bg-emerald-600',
    text: activeCategory === 'PT-AL' ? 'text-indigo-600' : 'text-emerald-600',
    border: activeCategory === 'PT-AL' ? 'border-indigo-600' : 'border-emerald-600',
    ring: activeCategory === 'PT-AL' ? 'focus:ring-indigo-500/20' : 'focus:ring-emerald-500/20',
    softBg: activeCategory === 'PT-AL' ? 'bg-indigo-50' : 'bg-emerald-50',
    softText: activeCategory === 'PT-AL' ? 'text-indigo-700' : 'text-emerald-700',
  };

  const toggleFullScreen = () => {
    // Definimos "móvil o tablet" para incluir iPads (incluso en modo escritorio) y dispositivos de hasta 1024px
    const isMobileOrTablet = window.innerWidth <= 1024 || 
                             /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                             (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent));
    
    if (isMobileOrTablet && selectedResource) {
      if (selectedResource.pastedCode) {
        const blob = new Blob([selectedResource.pastedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) win.focus();
      } else if (selectedResource.contentUrl) {
        const win = window.open(selectedResource.contentUrl, '_blank');
        if (win) win.focus();
      }
      return;
    }

    const container = resourceContainerRef.current;
    if (!container) return;
    
    if (!isFullScreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
      setIsFullScreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullScreen(false);
      document.body.style.overflow = '';
    }
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
          name: res.authorName, 
          avatar: `https://ui-avatars.com/api/?name=${res.authorName}&background=random` 
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
      
      const matchesSearch = 
        res.title.toLowerCase().includes(lowerQuery) || 
        res.summary.toLowerCase().includes(lowerQuery) ||
        res.authorName.toLowerCase().includes(lowerQuery);
      
      const matchesLevel = filterLevel === 'Todos' || res.level === filterLevel;
      const matchesCourse = filterCourse === 'Todos' || res.courses.includes(filterCourse);
      const matchesSubject = filterSubject === 'Todas' || res.subject === filterSubject;
      
      return matchesCategory && matchesSearch && matchesLevel && matchesCourse && matchesSubject;
    });
  }, [resources, activeCategory, searchQuery, filterLevel, filterCourse, filterSubject]);

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
    if (selectedResource?.id === resourceId) {
      setSelectedResource(null);
      navigateTo(AppView.Explore);
    }
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
      fileName: resource.fileType === 'pdf' ? 'Archivo PDF cargado' : '',
      fileBlob: null,
      pastedCode: resource.pastedCode || ''
    });
    setActiveCategory(resource.mainCategory);
    navigateTo(AppView.Upload);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Sesión expirada. Por favor, vuelve a entrar.");
    if (!formData.title.trim()) return alert("El título es obligatorio.");
    if (formData.courses.length === 0) return alert("Selecciona al menos un curso destinatario.");
    
    setIsUploading(true);
    if (formData.uploadMethod === 'file') {
      if (formData.fileBlob) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64data = event.target?.result as string;
          await saveResourceToDB(base64data, 'pdf'); 
          setIsUploading(false);
        };
        reader.readAsDataURL(formData.fileBlob);
      } else if (editingResourceId) {
        await saveResourceToDB(undefined, undefined);
        setIsUploading(false);
      } else {
        alert("Selecciona un archivo PDF para publicar.");
        setIsUploading(false);
      }
    } else if (formData.uploadMethod === 'code') {
      if (!formData.pastedCode.trim()) { alert("El código HTML es obligatorio."); setIsUploading(false); return; }
      await saveResourceToDB(undefined, 'html');
      setIsUploading(false);
    }
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
    alert(editingResourceId ? "¡Material actualizado!" : "¡Material publicado!");
    if (editingResourceId) { setSelectedResource(newRes); navigateTo(AppView.Detail, { id: newRes.id }); } else { navigateTo(AppView.Explore); }
    resetForm();
  };

  const resetForm = () => {
    setEditingResourceId(null);
    setFormData({
      title: '', 
      authorName: currentUser ? `${currentUser.name} ${currentUser.lastName || ''}`.trim() : '', 
      email: currentUser?.email || '', 
      summary: '', 
      level: 'Infantil', 
      subject: 'Crecimiento en Armonía',
      courses: [], 
      resourceType: 'Material Didáctico', 
      mainCategory: activeCategory, 
      uploadMethod: 'file',
      fileName: '', 
      fileBlob: null, 
      pastedCode: ''
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const existingUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (isResettingPassword) {
      if (!existingUser) {
        setAuthError("No existe ninguna cuenta con este email.");
      } else {
        try {
          await dbService.resetPassword(loginEmail);
          setAuthSuccess("Se ha enviado un enlace de recuperación a tu email.");
          setIsResettingPassword(false);
        } catch (err) {
          setAuthError("Error al procesar la recuperación.");
        }
      }
      return;
    }

    if (isRegistering) {
      if (existingUser) { setAuthError("Este correo ya está registrado."); return; }
      const newUser: UserType = { 
        email: loginEmail, 
        name: loginEmail.split('@')[0], 
        password: loginPassword, 
        avatar: `https://ui-avatars.com/api/?name=${loginEmail}&background=random` 
      };
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
      } else {
        setAuthError("Credenciales incorrectas.");
      }
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
    alert("Perfil actualizado correctamente");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (passwordChange.current !== currentUser.password) {
      alert("La contraseña actual no es correcta.");
      return;
    }
    if (passwordChange.new !== passwordChange.confirm) {
      alert("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    const updatedUser = { ...currentUser, password: passwordChange.new };
    await dbService.saveUser(updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem('nogalespt_current_user', JSON.stringify(updatedUser));
    setPasswordChange({ current: '', new: '', confirm: '' });
    alert("¡Contraseña actualizada con éxito!");
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
        setUsers(prev => prev.map(u => u.email === updated.email ? updated : u));
        localStorage.setItem('nogalespt_current_user', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewProfile = (email: string) => {
    setViewingUserEmail(email);
    navigateTo(AppView.Profile, { email });
  };

  const handleCourseToggle = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course) 
        ? prev.courses.filter(c => c !== course) 
        : [...prev.courses, course]
    }));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUser || !messageDraft.trim() || !selectedChatPartner) return;

    const newMessage: PrivateMessage = {
      id: Date.now().toString(),
      from: currentUser.email,
      to: selectedChatPartner,
      content: messageDraft.trim(),
      timestamp: Date.now(),
      read: false
    };

    await dbService.saveMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setMessageDraft('');
    alert("Mensaje enviado correctamente");
  };

  const activeProfile = useMemo(() => {
    if (view === AppView.Profile && viewingUserEmail) {
      return users.find(u => u.email === viewingUserEmail) || {
        email: viewingUserEmail,
        name: resources.find(r => r.email === viewingUserEmail)?.authorName || 'Docente',
        avatar: `https://ui-avatars.com/api/?name=${viewingUserEmail}&background=random`
      };
    }
    return null;
  }, [view, viewingUserEmail, users, resources]);

  const profileResources = useMemo(() => {
    if (activeProfile) {
      return resources.filter(r => r.email === activeProfile.email);
    }
    return [];
  }, [activeProfile, resources]);

  const userConversations = useMemo(() => {
    if (!currentUser) return [];
    const chatPartners = new Set<string>();
    messages.forEach(m => {
      if (m.from === currentUser.email) chatPartners.add(m.to);
      if (m.to === currentUser.email) chatPartners.add(m.from);
    });

    return Array.from(chatPartners).map(email => {
      const partner = users.find(u => u.email === email) || { 
        email, 
        name: 'Docente', 
        avatar: `https://ui-avatars.com/api/?name=${email}` 
      };
      const lastMsg = messages
        .filter(m => (m.from === email && m.to === currentUser.email) || (m.from === currentUser.email && m.to === email))
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      return { partner, lastMsg };
    }).sort((a, b) => (b.lastMsg?.timestamp || 0) - (a.lastMsg?.timestamp || 0));
  }, [messages, currentUser, users]);

  const activeChatMessages = useMemo(() => {
    if (!currentUser || !selectedChatPartner) return [];
    return messages.filter(m => 
      (m.from === currentUser.email && m.to === selectedChatPartner) || 
      (m.from === selectedChatPartner && m.to === currentUser.email)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, currentUser, selectedChatPartner]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">NOGALES<span className="text-indigo-600">PT</span></h2>
      </div>
    );
  }

  // Helper para determinar si estamos en un dispositivo táctil (Móvil/Tablet/iPad)
  const isTouchDevice = window.innerWidth <= 1024 || 
                       /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {copySuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Enlace copiado al portapapeles</span>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[50] h-16 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo(AppView.Home)}>
            <div className={`${themeClasses.bg} p-2 rounded-xl text-white shadow-lg transition-transform group-hover:scale-110`}><GraduationCap size={20} /></div>
            <span className="text-xl font-black uppercase tracking-tighter text-slate-900">NOGALES<span className={themeClasses.text}>PT</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigateTo(AppView.Explore)} className={`text-xs font-black uppercase tracking-widest transition-colors ${view === AppView.Explore ? themeClasses.text : 'text-slate-500 hover:text-slate-900'}`}>Explorar</button>
            <button onClick={() => navigateTo(AppView.TopDocentes)} className={`text-xs font-black uppercase tracking-widest transition-colors ${view === AppView.TopDocentes ? themeClasses.text : 'text-slate-500 hover:text-slate-900'}`}>Ranking</button>
            {currentUser && (
              <button onClick={() => navigateTo(AppView.Messages)} className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${view === AppView.Messages ? themeClasses.text : 'text-slate-500 hover:text-slate-900'}`}>
                <MessageCircle size={16} /> Mensajes
              </button>
            )}
            <button onClick={() => navigateTo(AppView.Upload)} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all`}><Upload size={16} /> Subir</button>
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100 hover:bg-slate-200 transition-all">
              {currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" alt=""/> : <UserIcon size={18} className="ml-2" />}
              <span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span>
            </button>
          </div>
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl p-8 flex flex-col">
             <div className="flex items-center justify-between mb-12">
               <span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
             </div>
             <div className="space-y-4">
               <button onClick={() => navigateTo(AppView.Explore)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"><Search size={18} /> Explorar</button>
               <button onClick={() => navigateTo(AppView.TopDocentes)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"><Trophy size={18} /> Ranking</button>
               {currentUser && <button onClick={() => navigateTo(AppView.Messages)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"><MessageCircle size={18} /> Mensajes</button>}
               <button onClick={() => navigateTo(AppView.Upload)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"><Upload size={18} /> Subir</button>
               <button onClick={() => navigateTo(AppView.Account)} className="w-full p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"><UserIcon size={18} /> Perfil</button>
             </div>
          </div>
        </>
      )}

      <div className="bg-white border-b border-slate-200 sticky top-16 z-[40]">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory('General')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeCategory === 'General' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><BookOpen size={16} /> Educación General</button>
          <button onClick={() => setActiveCategory('PT-AL')} className={`flex-1 min-w-[180px] py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeCategory === 'PT-AL' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-slate-400 border-transparent hover:text-slate-600'}`}><BrainCircuit size={16} /> PT y AL</button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {view === AppView.Home && (
          <div className="py-24 text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">Repositorio <span className={themeClasses.text}>Colaborativo</span> para Docentes</h1>
            <p className="text-base md:text-xl text-slate-500 font-medium px-4">Comparte recursos de alta calidad y conecta con profesionales de toda Andalucía.</p>
            <button onClick={() => navigateTo(AppView.Explore)} className={`${themeClasses.bg} text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 uppercase text-xs md:text-sm mx-auto tracking-widest`}>Explorar Catálogo <ChevronRight size={18}/></button>
          </div>
        )}

        {view === AppView.Explore && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Catálogo <span className={themeClasses.text}>{activeCategory}</span></h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar título, resumen o autor..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-slate-400 mr-2">
                <Filter size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filtros:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filterLevel}
                    onChange={(e) => {
                      setFilterLevel(e.target.value);
                      setFilterCourse('Todos');
                      setFilterSubject('Todas');
                    }}
                  >
                    <option value="Todos">Todas las Etapas</option>
                    {Object.keys(SUBJECTS_BY_LEVEL).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Layers3 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    disabled={filterLevel === 'Todos'}
                  >
                    <option value="Todos">Todos los Cursos</option>
                    {filterLevel !== 'Todos' && COURSES_BY_LEVEL[filterLevel as EducationalLevel]?.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    disabled={filterLevel === 'Todos'}
                  >
                    <option value="Todas">Todas las Asignaturas</option>
                    {filterLevel !== 'Todos' && SUBJECTS_BY_LEVEL[filterLevel as EducationalLevel]?.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(filterLevel !== 'Todos' || filterCourse !== 'Todos' || filterSubject !== 'Todas' || searchQuery !== '') && (
                <button onClick={() => { setFilterLevel('Todos'); setFilterCourse('Todos'); setFilterSubject('Todas'); setSearchQuery(''); }} className="p-3 text-slate-400 hover:text-red-500 transition-colors" title="Limpiar Filtros"><RefreshCw size={20} /></button>
              )}
            </div>

            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredResources.map(res => (
                  <div 
                    key={res.id} 
                    onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} 
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1"
                  >
                    <div className="relative h-44 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /></div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className={`text-[10px] font-black ${themeClasses.text} uppercase mb-2`}>{res.subject}</div>
                      <h3 className="font-bold text-slate-800 text-md mb-2 line-clamp-2 leading-tight">{res.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{res.summary}</p>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span className="truncate mr-2 max-w-[120px]">{res.authorName}</span>
                        <div className="flex items-center gap-1 text-amber-500 whitespace-nowrap"><Star size={14} fill="currentColor" /> {res.rating}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400"><Search size={32} /></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Sin resultados</h3>
                <button onClick={() => { setFilterLevel('Todos'); setFilterCourse('Todos'); setFilterSubject('Todas'); setSearchQuery(''); }} className="text-indigo-600 font-black uppercase text-xs underline">Mostrar todo el catálogo</button>
              </div>
            )}
          </div>
        )}

        {view === AppView.Profile && activeProfile && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
            <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Volver</button>
            <div className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
              <img src={activeProfile.avatar || `https://ui-avatars.com/api/?name=${activeProfile.name}&background=random`} className="w-40 h-40 md:w-56 md:h-56 rounded-[48px] object-cover border-8 border-slate-50 shadow-2xl" alt=""/>
              <div className="flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{activeProfile.name} {activeProfile.lastName}</h2>
                    <button onClick={() => copyProfileLink(activeProfile.email)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all w-fit shadow-sm">
                      <Copy size={14} /> Copiar Perfil
                    </button>
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2"><AtSign size={16} className={themeClasses.text}/> {activeProfile.email}</p>
                </div>
                {activeProfile.bio && <p className="text-lg text-slate-600 leading-relaxed font-medium">{activeProfile.bio}</p>}
                
                {currentUser && currentUser.email !== activeProfile.email && (
                  <div className="pt-4 flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enviar Mensaje Directo</h4>
                    <div className="relative max-w-lg">
                      <textarea 
                        value={messageDraft}
                        onChange={e => setMessageDraft(e.target.value)}
                        placeholder={`Escribe a ${activeProfile.name}...`}
                        className="w-full p-4 pr-16 rounded-2xl bg-slate-50 border border-slate-100 font-medium text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                      <button 
                        onClick={() => { setSelectedChatPartner(activeProfile.email); handleSendMessage(); }}
                        className={`absolute bottom-3 right-3 p-3 ${themeClasses.bg} text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all`}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                )}

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
                  <div key={res.id} onClick={() => { setSelectedResource(res); navigateTo(AppView.Detail, { id: res.id }); }} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group cursor-pointer">
                    <div className="h-40 overflow-hidden"><img src={res.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" /></div>
                    <div className="p-4"><h4 className="font-bold text-slate-800 text-sm mb-2 truncate">{res.title}</h4><div className={`text-[10px] font-black ${themeClasses.text} uppercase`}>{res.subject}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.Messages && currentUser && (
          <div className="max-w-6xl mx-auto h-[75vh] flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Mensajes</h2>
                <Inbox size={20} className="text-slate-400" />
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                {userConversations.map(({ partner, lastMsg }) => (
                  <button 
                    key={partner.email} 
                    onClick={() => setSelectedChatPartner(partner.email)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${selectedChatPartner === partner.email ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}
                  >
                    <img src={partner.avatar || `https://ui-avatars.com/api/?name=${partner.name}`} className="w-12 h-12 rounded-full object-cover" alt="" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-slate-900 truncate">{partner.name}</span>
                        <span className="text-[9px] font-bold text-slate-400">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{lastMsg?.content || 'Sin mensajes'}</p>
                    </div>
                  </button>
                ))}
                {userConversations.length === 0 && (
                  <div className="py-20 text-center px-6">
                    <MessageCircle size={32} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No tienes conversaciones activas</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {selectedChatPartner ? (
                <>
                  <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleViewProfile(selectedChatPartner)}>
                      <img 
                        src={users.find(u => u.email === selectedChatPartner)?.avatar || `https://ui-avatars.com/api/?name=${selectedChatPartner}`} 
                        className="w-10 h-10 rounded-full object-cover" 
                        alt="" 
                      />
                      <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">
                          {users.find(u => u.email === selectedChatPartner)?.name || 'Docente'}
                        </h3>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">En línea</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                    {activeChatMessages.map((m, idx) => {
                      const isMe = m.from === currentUser.email;
                      const prevMsg = activeChatMessages[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.from !== m.from;

                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {showAvatar ? (
                              <img 
                                src={isMe ? currentUser.avatar : users.find(u => u.email === m.from)?.avatar || `https://ui-avatars.com/api/?name=${m.from}`} 
                                className="w-8 h-8 rounded-full self-end shadow-sm" 
                                alt="" 
                              />
                            ) : <div className="w-8" />}
                            <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'}`}>
                              {m.content}
                              <div className={`text-[8px] mt-1.5 opacity-60 font-black uppercase text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
                    <form onSubmit={handleSendMessage} className="relative">
                      <input 
                        type="text" 
                        value={messageDraft}
                        onChange={e => setMessageDraft(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full pl-6 pr-16 py-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      <button 
                        type="submit"
                        className={`absolute right-2 top-2 bottom-2 px-6 ${themeClasses.bg} text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center`}
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <MessageCircle size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Selecciona una conversación</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs">Haz clic en un contacto de la izquierda para comenzar a chatear o contacta con un docente desde su perfil.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === AppView.Account && (
          <div className="max-w-5xl mx-auto py-12">
            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center space-y-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Área de <span className={themeClasses.text}>Docentes</span></h2>
                
                {isResettingPassword ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-amber-50 p-4 rounded-2xl flex items-start gap-4 text-left border border-amber-100">
                      <ShieldAlert className="text-amber-600 mt-1" size={24} />
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-tight leading-relaxed">
                        Introduce tu email y si existe en nuestro repositorio te enviaremos instrucciones para restaurar tu contraseña.
                      </p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                      <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Email de tu cuenta" />
                      {authError && <p className="text-red-500 text-[10px] font-black uppercase ml-4">{authError}</p>}
                      <button type="submit" className={`${themeClasses.bg} w-full py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl tracking-widest`}>Recuperar Acceso</button>
                      <button type="button" onClick={() => { setIsResettingPassword(false); setAuthError(null); }} className="w-full text-[10px] font-black uppercase text-slate-400 text-center hover:text-slate-900">Volver al login</button>
                    </form>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                      <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-4 text-left border border-indigo-100 mb-4">
                        <Info className="text-indigo-600 mt-1" size={20} />
                        <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight leading-relaxed">
                          Es necesario estar registrado para poder compartir y subir recursos al repositorio.
                        </p>
                      </div>
                      <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Email" />
                      {!isRegistering && (
                        <div className="space-y-2">
                          <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Contraseña" />
                          <button type="button" onClick={() => setIsResettingPassword(true)} className="ml-2 text-[9px] font-black uppercase text-indigo-600/60 hover:text-indigo-600 transition-colors">¿Has olvidado tu contraseña?</button>
                        </div>
                      )}
                      {isRegistering && (
                         <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Crea una contraseña" />
                      )}
                      
                      {authError && <p className="text-red-500 text-[10px] font-black uppercase ml-4">{authError}</p>}
                      {authSuccess && <p className="text-emerald-500 text-[10px] font-black uppercase ml-4">{authSuccess}</p>}
                      
                      <button type="submit" className={`${themeClasses.bg} w-full py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl tracking-widest`}>{isRegistering ? 'Crear Cuenta' : 'Acceder'}</button>
                      
                      <div className="pt-4 flex flex-col gap-4 text-center">
                        <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }} className="text-[10px] font-black uppercase text-indigo-600 underline">
                          {isRegistering ? '¿Ya tienes cuenta? Login' : '¿Nuevo en el centro? Registro'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                    <img src={currentUser.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" alt=""/>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={32} />
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900">{currentUser.name} {currentUser.lastName}</h2>
                    <p className="text-slate-500 font-medium">Docente Colaborador NOGALESPT</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center justify-center md:justify-start gap-1"><Mail size={12}/> {currentUser.email}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => navigateTo(AppView.Messages)} className="p-5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <MessageCircle size={24} />
                    </button>
                    <button onClick={handleLogout} className="p-5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <LogOut size={24} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
                    <form onSubmit={handleUpdateProfile} className="space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <UserCircle size={18} className={themeClasses.text} /> Datos de Identidad
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Nombre" />
                              <input required type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Apellidos" />
                            </div>
                            <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold h-40 resize-none" placeholder="Escribe una breve biografía sobre tu trayectoria docente..." />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Share2 size={18} className={themeClasses.text} /> Marca Digital y Redes
                          </h3>
                          <div className="space-y-4">
                            <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Usuario Instagram" /></div>
                            <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.linkedin} onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})} className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none font-bold" placeholder="ID Perfil LinkedIn" /></div>
                            <div className="relative"><Music className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.tiktok} onChange={e => setProfileForm({...profileForm, tiktok: e.target.value})} className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Usuario TikTok" /></div>
                            <div className="relative"><Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.twitter} onChange={e => setProfileForm({...profileForm, twitter: e.target.value})} className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Usuario Twitter / X" /></div>
                            <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Sitio Web o Portfolio" /></div>
                          </div>
                        </div>
                      </div>
                      <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-[24px] text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl`}><Save size={20} className="inline mr-2"/> Guardar Cambios del Perfil</button>
                    </form>
                  </div>

                  <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col gap-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <KeyRound size={18} className={themeClasses.text} /> Seguridad de la Cuenta
                    </h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Contraseña Actual</label>
                        <input required type="password" value={passwordChange.current} onChange={e => setPasswordChange({...passwordChange, current: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nueva Contraseña</label>
                        <input required type="password" value={passwordChange.new} onChange={e => setPasswordChange({...passwordChange, new: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Mín. 6 caracteres" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Confirmar Nueva Contraseña</label>
                        <input required type="password" value={passwordChange.confirm} onChange={e => setPasswordChange({...passwordChange, confirm: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none" placeholder="Repite la contraseña" />
                      </div>
                      <button type="submit" className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors">Actualizar Contraseña</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === AppView.Upload && currentUser && (
          <div className="max-w-4xl mx-auto">
             <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-6 md:p-12">
                <header className="mb-10 text-center">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">{editingResourceId ? 'Editar' : 'Subir'} <span className={themeClasses.text}>Material</span></h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Publicando como: {currentUser.name}</p>
                </header>
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Información General</label>
                      <input required type="text" placeholder="Título" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                      <textarea required placeholder="Resumen..." className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold h-32 outline-none resize-none" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Categorización</label>
                      <select className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.level} onChange={e => {
                        const newLevel = e.target.value as EducationalLevel;
                        setFormData({...formData, level: newLevel, courses: []});
                      }}>
                        {Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                        {SUBJECTS_BY_LEVEL[formData.level]?.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Cursos Destinatarios</label>
                    <div className="flex flex-wrap gap-2">
                      {COURSES_BY_LEVEL[formData.level].map(course => (
                        <button 
                          key={course} 
                          type="button" 
                          onClick={() => handleCourseToggle(course)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.courses.includes(course) ? themeClasses.bg + ' text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                          {course}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Archivo PDF</button>
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Código HTML</button>
                    </div>
                    {formData.uploadMethod === 'file' ? (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center cursor-pointer group">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => setFormData({...formData, fileBlob: e.target.files?.[0] || null, fileName: e.target.files?.[0]?.name || ''})} />
                        <FileUp size={48} className="mx-auto mb-4 text-slate-600 group-hover:text-indigo-500" />
                        <p className="font-bold text-slate-400">{formData.fileName || 'Selecciona PDF'}</p>
                      </div>
                    ) : (
                      <textarea placeholder="Pega aquí el código HTML..." className="w-full p-6 rounded-2xl bg-slate-800 border-none font-mono text-sm text-indigo-300 h-64 outline-none" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                    )}
                  </div>
                  <button type="submit" disabled={isUploading} className={`${themeClasses.bg} w-full py-5 rounded-[24px] text-white font-black uppercase text-sm shadow-2xl`}>{isUploading ? <Loader2 className="animate-spin inline mr-2" /> : <CheckCircle2 className="inline mr-2" />} {editingResourceId ? 'Actualizar Material' : 'Publicar Material'}</button>
                </form>
             </div>
          </div>
        )}

        {view === AppView.Detail && selectedResource && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => navigateTo(AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Volver</button>
              <div className="flex gap-3">
                <button onClick={copyResourceLink} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-all">
                  <Copy size={16} /> Copiar Enlace
                </button>
                {currentUser?.email === selectedResource.email && (
                  <>
                    <button onClick={() => handleEditResource(selectedResource)} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase shadow-sm"><Edit3 size={16} className="inline mr-2"/> Editar</button>
                    <button onClick={() => handleDeleteResource(selectedResource.id)} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase shadow-sm"><Trash2 size={16} className="inline mr-2"/> Borrar</button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div ref={resourceContainerRef} className={`${isFullScreen ? 'fixed inset-0 z-[9999] bg-black rounded-none h-screen w-screen overflow-hidden' : 'aspect-video bg-slate-900 rounded-[32px]'} overflow-hidden relative flex items-center justify-center group/viewer transition-all shadow-xl`}>
                    {selectedResource.pastedCode ? (
                      <iframe srcDoc={selectedResource.pastedCode} className="w-full h-full border-none bg-white" sandbox="allow-scripts allow-same-origin" title={selectedResource.title} />
                    ) : (
                      <iframe src={selectedResource.contentUrl} className="w-full h-full border-none bg-white" title={selectedResource.title} />
                    )}
                    
                    {!isFullScreen && (
                      <button 
                        onClick={toggleFullScreen} 
                        className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-md text-black rounded-2xl opacity-100 md:opacity-0 md:group-hover/viewer:opacity-100 transition-all hover:bg-white active:scale-90 shadow-lg"
                      >
                        { isTouchDevice ? <ExternalLink size={24} /> : <Maximize2 size={24} /> }
                      </button>
                    )}

                    {isFullScreen && (
                      <button 
                        onClick={toggleFullScreen} 
                        className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md text-black rounded-full hover:bg-white active:scale-90 transition-all z-[10000] shadow-lg"
                      >
                        <X size={32} />
                      </button>
                    )}
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                  <h1 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{selectedResource.title}</h1>
                  <p className="text-slate-600 leading-relaxed mb-8 text-lg">{selectedResource.summary}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedResource.level}</span>
                    <span className={`px-4 py-2 ${themeClasses.softBg} rounded-full text-[10px] font-black ${themeClasses.softText} uppercase tracking-widest`}>{selectedResource.subject}</span>
                    {selectedResource.courses.map(c => <span key={c} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{c}</span>)}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center space-y-6">
                  <div className="cursor-pointer group" onClick={() => handleViewProfile(selectedResource.email)}>
                    <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}&background=random`} className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover" alt=""/>
                    <h3 className="font-black text-slate-900 text-lg mt-4 group-hover:text-indigo-600">{selectedResource.authorName}</h3>
                  </div>
                  <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => handleRateResource(selectedResource.id, v)} className="text-slate-200 hover:text-amber-500 transition-colors"><Star size={24} fill={v <= Math.round(selectedResource.rating) ? 'currentColor' : 'none'} /></button>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Valoración: {selectedResource.rating}/5</span>
                  </div>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all"><Download size={16} className="inline mr-2" /> Descargar Material</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === AppView.TopDocentes && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <header className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Muro de <span className={themeClasses.text}>Excelencia</span></h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(Object.entries(teacherRankings) as [string, any[]][]).map(([level, teachers]) => (
                <div key={level} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`${themeClasses.bg} p-2 rounded-xl text-white shadow-md`}><Trophy size={18} /></div>
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">{level}</h3>
                  </div>
                  <div className="space-y-6">
                    {teachers.map((teacher, idx) => (
                      <div key={teacher.user.email} className="flex items-center gap-4 cursor-pointer group" onClick={() => handleViewProfile(teacher.user.email)}>
                        <img src={teacher.user.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" alt=""/>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{teacher.user.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{teacher.count} recursos compartidos</p>
                        </div>
                        <div className="text-amber-500 font-black text-xs flex items-center gap-1"><Star size={14} fill="currentColor"/> {teacher.avgRating.toFixed(1)}</div>
                      </div>
                    ))}
                    {teachers.length === 0 && <p className="text-xs font-bold text-slate-400 uppercase text-center py-4 italic">Sin datos registrados aún</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap size={24} className={themeClasses.text} /><span className="text-xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">© 2025 • Repositorio Colaborativo • REA Andalucía</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
