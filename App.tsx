
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
  Eraser, Hash, Type as TypeIcon, Palette, Indent, Outdent, Minus, Smile, Newspaper, ShieldCheck
} from 'lucide-react';
import { AppView, Resource, User as UserType, EducationalLevel, MainCategory, PrivateMessage } from './types';
import { SUBJECTS_BY_LEVEL, COURSES_BY_LEVEL } from './constants';
import { dbService } from './services/dbService';

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

// --- UTILIDADES ---
const stripHtml = (html: string) => {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const renderContentWithVideos = (content: string, consent: boolean | null) => {
  if (!content) return "";
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)/g;
  
  return content.replace(youtubeRegex, (match, videoId) => {
    if (consent !== true) {
      return `
        <div class="my-8 aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-slate-100 border-4 border-white flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div class="p-4 bg-slate-200 rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <div>
            <p class="text-sm font-black text-slate-800 uppercase tracking-tight">Contenido bloqueado por privacidad</p>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acepta las cookies para ver este vídeo de YouTube</p>
          </div>
          <button onclick="window.dispatchEvent(new CustomEvent('open-cookie-banner'))" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all">Gestionar Cookies</button>
        </div>
      `;
    }

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

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleTable = () => {
    const table = `<table style="width:100%; border: 1px solid #cbd5e1; border-collapse: collapse; margin: 10px 0;">
      <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 1</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 2</td></tr>
      <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 3</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 4</td></tr>
    </table><p><br></p>`;
    exec("insertHTML", table);
  };

  const handleImage = () => {
    const imageUrl = prompt('URL de la imagen:');
    if (!imageUrl) return;

    const linkUrl = prompt('URL de enlace opcional (deja vacío si no deseas enlace):');
    const width = prompt('Ancho deseado (ej. 100%, 500px):', '100%');

    let imgHtml = `<img src="${imageUrl}" 
      style="width: ${width || '100%'}; max-width: 100%; height: auto; display: inline-block; vertical-align: middle; margin: 10px 0; border-radius: 8px; resize: both; overflow: hidden; cursor: pointer; border: 2px solid transparent;" 
      class="editor-resizable-img" 
      alt="Imagen insertada" />`;

    if (linkUrl && linkUrl.trim() !== '') {
      imgHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`;
    }

    exec("insertHTML", imgHtml + '<p><br></p>');
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-all hover:bg-slate-200 border border-transparent hover:border-slate-300 ${
        active ? 'bg-slate-200 shadow-inner' : 'text-slate-700'
      }`}
    >
      <Icon size={15} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="w-full flex flex-col border border-slate-300 rounded-[12px] bg-[#fdfdfd] shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
      <style>{`
        .editor-resizable-img:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .editor-resizable-img {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
      
      <div className="bg-[#f0f2f5] border-b border-slate-300 p-1.5 flex flex-wrap items-center gap-1">
        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('bold')} icon={Bold} title="Negrita" />
          <ToolbarButton onClick={() => exec('italic')} icon={Italic} title="Cursiva" />
          <ToolbarButton onClick={() => exec('underline')} icon={Underline} title="Subrayado" />
          <ToolbarButton onClick={() => exec('strikeThrough')} icon={Strikethrough} title="Tachado" />
          <ToolbarButton onClick={() => exec('removeFormat')} icon={Eraser} title="Limpiar formato (Tx)" />
        </div>
        
        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={List} title="Viñetas" />
          <ToolbarButton onClick={() => exec('insertOrderedList')} icon={ListOrdered} title="Lista numerada" />
          <ToolbarButton onClick={() => exec('outdent')} icon={Outdent} title="Reducir sangría" />
          <ToolbarButton onClick={() => exec('indent')} icon={Indent} title="Aumentar sangría" />
          <ToolbarButton onClick={() => exec('formatBlock', 'blockquote')} icon={Quote} title="Cita" />
        </div>

        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Izquierda" />
          <ToolbarButton onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Centro" />
          <ToolbarButton onClick={() => exec('justifyRight')} icon={AlignRight} title="Derecha" />
          <ToolbarButton onClick={() => exec('justifyFull')} icon={AlignJustify} title="Justificado" />
        </div>

        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={() => {const url = prompt('URL:'); if(url) exec('createLink', url)}} icon={LinkIcon} title="Enlace" />
          <ToolbarButton onClick={handleImage} icon={ImageIcon} title="Insertar Imagen Avanzada" />
          <ToolbarButton onClick={handleTable} icon={TableIcon} title="Tabla" />
          <ToolbarButton onClick={() => exec('insertHorizontalRule')} icon={Minus} title="Línea horizontal" />
          <button 
            type="button" 
            onClick={() => colorInputRef.current?.click()}
            className="p-1.5 rounded transition-all hover:bg-slate-200 border border-transparent text-indigo-600 flex flex-col items-center gap-0"
            title="Color de fuente"
          >
            <Palette size={15} strokeWidth={2.5} />
            <div className="w-full h-0.5 bg-indigo-600 mt-0.5 rounded-full" />
            <input ref={colorInputRef} type="color" className="hidden" onChange={(e) => exec('foreColor', e.target.value)} />
          </button>
        </div>
      </div>

      <div className="bg-[#f0f2f5] border-b border-slate-300 p-1.5 flex flex-wrap items-center gap-3">
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('formatBlock', e.target.value)} defaultValue="p">
          <option value="p">Formato (Párrafo)</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="pre">Código fuente</option>
        </select>
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('fontName', e.target.value)} defaultValue="Inherit">
          <option value="">Fuente (Predeterminada)</option>
          <option value="Arial">Arial</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Impact">Impact</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('fontSize', e.target.value)} defaultValue="3">
          <option value="1">Tamaño (1 - Mini)</option>
          <option value="2">2 - Pequeño</option>
          <option value="3">3 - Normal</option>
          <option value="4">4 - Grande</option>
          <option value="5">5 - Muy Grande</option>
          <option value="6">6 - Extra Grande</option>
          <option value="7">7 - Gigante</option>
        </select>
      </div>

      <div ref={editorRef} contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} className="p-8 min-h-[300px] outline-none prose prose-slate max-w-none text-slate-800 font-medium bg-white selection:bg-indigo-100" />
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1 flex justify-end">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Editor Nogales PRO v2.1</span>
      </div>
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

  // --- ESTADO DE COOKIES Y RGPD ---
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  const [view, setView] = useState<AppView>(AppView.Home);
  const [activeCategory, setActiveCategory] = useState<MainCategory>('PT-AL');
  const [activeBlogCategory, setActiveBlogCategory] = useState<string>('Todo');
  
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState('');

  const resourceContainerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '', summary: '', level: 'Infantil' as EducationalLevel, subject: 'Crecimiento en Armonía',
    courses: [] as string[], resourceType: 'Material Didáctico', 
    mainCategory: 'PT-AL' as MainCategory, uploadMethod: 'file' as 'file' | 'code',
    externalUrl: '', pastedCode: '', kind: 'material' as 'material' | 'blog'
  });

  const [profileForm, setProfileForm] = useState<UserType>({
    email: '', name: '', lastName: '', bio: '',
    instagram: '', linkedin: '', tiktok: '', twitter: '', website: ''
  });

  // --- LÓGICA DE GTM ---
  const initGTM = () => {
    if (typeof window === 'undefined' || (window as any).gtmInitialized) return;
    
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s) as HTMLScriptElement,dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode?.insertBefore(j,f);
    })(window,document,'script','dataLayer', GTM_ID);
    
    (window as any).gtmInitialized = true;
  };

  // --- GESTIÓN DE COOKIES ---
  useEffect(() => {
    const savedConsent = localStorage.getItem('nogalespt_cookie_consent');
    if (savedConsent === 'accepted') {
      setCookieConsent(true);
      initGTM();
    } else if (savedConsent === 'rejected') {
      setCookieConsent(false);
    } else {
      setShowCookieBanner(true);
    }

    // Listener para abrir banner desde el placeholder de YouTube
    const handleOpenBanner = () => setShowCookieBanner(true);
    window.addEventListener('open-cookie-banner', handleOpenBanner);
    return () => window.removeEventListener('open-cookie-banner', handleOpenBanner);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('nogalespt_cookie_consent', 'accepted');
    setCookieConsent(true);
    setShowCookieBanner(false);
    initGTM();
  };

  const handleRejectCookies = () => {
    localStorage.setItem('nogalespt_cookie_consent', 'rejected');
    setCookieConsent(false);
    setShowCookieBanner(false);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = urlParams.get('standalone') === 'true';
  const standaloneId = urlParams.get('id');

  const navigateTo = (newView: AppView, params: Record<string, string> = {}) => {
    if (newView === AppView.Upload && !currentUser) {
      setAuthError("Debes registrarte para compartir contenido.");
      setView(AppView.Account);
      return;
    }
    setView(newView);
    setIsMenuOpen(false);
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
    let title = "Repositorio Colaborativo para Docentes | NOGALESPT";
    let description = "Materiales de calidad, interactivos y adaptados para maestros de PT y AL en Andalucía.";

    if (view === AppView.Detail && selectedResource) {
      title = `${selectedResource.title} | ${selectedResource.kind === 'blog' ? 'Blog' : 'Material'} NOGALESPT`;
      description = stripHtml(selectedResource.summary).substring(0, 160) + "...";
    } else if (view === AppView.Blog) {
      if (activeBlogCategory === 'Todo') {
        title = "Blog Educativo: Estrategias y Recursos de PT y AL | NOGALESPT";
        description = "Explora nuestro blog educativo con las mejores estrategias y recursos especializados en PT y AL para docentes.";
      } else {
        title = `Artículos y Estrategias sobre ${activeBlogCategory} | NOGALESPT`;
        description = `Descubre artículos, estrategias y recursos especializados sobre ${activeBlogCategory} en el blog de NOGALESPT para maestros y profesionales de la educación especial.`;
      }
    } else if (view === AppView.Explore) {
      title = `Explorar Recursos de ${activeCategory} | NOGALESPT`;
      description = `Busca y filtra entre materiales educativos de ${activeCategory} adaptados por la comunidad docente.`;
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

    updateMeta('description', description);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:url', window.location.href, 'property');

  }, [view, selectedResource, activeBlogCategory, activeCategory]);

  const cleanGoogleDriveUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    }
    return url;
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

        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view') as AppView;
        const idParam = params.get('id');
        const catParam = params.get('category');

        if (viewParam === AppView.Blog) {
          if (catParam && BLOG_CATEGORIES.includes(catParam)) {
            setActiveBlogCategory(catParam);
          }
          setView(AppView.Blog);
        } else {
          if (catParam && (catParam === 'General' || catParam === 'PT-AL')) {
            setActiveCategory(catParam as MainCategory);
          }
          if (viewParam) {
            setView(viewParam);
            if (viewParam === AppView.Detail && idParam) {
              const found = resData.find((r: Resource) => r.id === idParam);
              if (found) setSelectedResource(found);
            }
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
      kind: resource.kind || 'material'
    });
    navigateTo(AppView.Upload);
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("¿Eliminar definitivamente?")) return;
    try {
      await dbService.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
      setSelectedResource(null);
      navigateTo(AppView.Explore);
    } catch (err) { console.error(err); }
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
      if (res.kind === 'blog') return false; 
      const matchesCategory = res.mainCategory === activeCategory;
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === 'Todos' || res.level === filterLevel;
      return matchesCategory && matchesSearch && matchesLevel;
    });
  }, [resources, activeCategory, searchQuery, filterLevel]);

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
        thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`,
        contentUrl: cleanUrl || '',
        pastedCode: formData.uploadMethod === 'code' ? formData.pastedCode : undefined,
        kind: formData.kind
      };
      await dbService.saveResource(newRes);
      setResources(prev => editingResourceId ? prev.map(r => r.id === editingResourceId ? newRes : r) : [newRes, ...prev]);
      alert("Contenido guardado.");
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
      localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
      navigateTo(AppView.Home);
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
    localStorage.setItem('nogalespt_current_user', JSON.stringify(newUser));
    navigateTo(AppView.Home);
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
      mainCategory: activeCategory, uploadMethod: 'file', externalUrl: '', pastedCode: '', kind: 'material'
    });
  };

  const handleMaximize = () => {
    if (!selectedResource) return;
    const url = `${window.location.origin}${window.location.pathname}?standalone=true&id=${selectedResource.id}`;
    window.open(url, '_blank');
  };

  const handleBlogCategoryClick = (cat: string) => {
    setActiveBlogCategory(cat);
    navigateTo(AppView.Blog, { category: cat });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-6"><div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div><h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">NOGALES<span className="text-indigo-600">PT</span></h2></div>;

  if (isStandalone && standaloneId) {
    const res = resources.find(r => r.id === standaloneId);
    if (!res) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-slate-400">Recurso no encontrado</div>;
    return (
      <div className="fixed inset-0 bg-white z-[9999] overflow-hidden">
        <iframe src={res.pastedCode ? '' : res.contentUrl} srcDoc={res.pastedCode} className="w-full h-full border-none" title={res.title} />
        <button onClick={() => window.close()} className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-105 transition-all text-slate-900 border border-slate-200"><X size={24} /></button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {copySuccess && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in"><Check size={18} /> <span className="text-xs font-black uppercase">Enlace copiado</span></div>}

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
            <button onClick={() => navigateTo(AppView.Upload)} className={`${themeClasses.bg} text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}><Upload size={16} /> Subir</button>
            <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-2 p-1.5 pr-4 rounded-full border bg-slate-100 hover:bg-slate-200 transition-colors">{currentUser?.avatar ? <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover" /> : <UserIcon size={18} />}<span className="text-[10px] font-black uppercase">{currentUser ? currentUser.name : 'Mi Cuenta'}</span></button>
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
              <button onClick={() => navigateTo(AppView.Upload)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><Upload size={20} /> Subir Material</button>
              <button onClick={() => navigateTo(AppView.Account)} className="flex items-center gap-4 w-full text-left font-black uppercase text-slate-600 hover:text-indigo-600"><UserCircle size={20} /> Mi Cuenta</button>
            </div>
          </div>
        </div>
      )}

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
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 uppercase">Blog <span className="text-indigo-600">Educativo</span></h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Estrategias y reflexiones para el aula</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {BLOG_CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => handleBlogCategoryClick(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${activeBlogCategory === cat ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogPosts.map(post => (
                <div key={post.id} onClick={() => { setSelectedResource(post); navigateTo(AppView.Detail, { id: post.id }); }} className="bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group cursor-pointer flex flex-col h-full shadow-sm">
                  <div className="h-56 overflow-hidden relative">
                    <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black uppercase text-indigo-600 shadow-sm">{post.subject}</div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow space-y-4">
                    <h3 className="font-black text-slate-800 text-xl leading-tight group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{stripHtml(post.summary)}</p>
                    <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {post.authorName.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{post.authorName}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase">{post.uploadDate}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredBlogPosts.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[40px] space-y-4">
                  <Newspaper className="mx-auto text-slate-200" size={64} />
                  <p className="text-slate-400 font-black uppercase text-xs">No hay artículos en esta categoría aún.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === AppView.Explore && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <h2 className="text-3xl font-black text-slate-900 uppercase">Explorar <span className={themeClasses.text}>{activeCategory}</span></h2>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar material..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 font-bold shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
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
                  <button onClick={() => { setCurrentUser(null); localStorage.removeItem('nogalespt_current_user'); navigateTo(AppView.Home); }} className="p-5 bg-red-50 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-md"><LogOut size={24} /></button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest flex items-center gap-2"><UserCircle size={18} className={themeClasses.text}/> Configuración de Perfil</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Nombre" />
                        <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold focus:ring-2 focus:ring-indigo-100 outline-none" placeholder="Apellidos" />
                      </div>
                      <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold h-32 focus:ring-2 focus:ring-indigo-100 outline-none resize-none" placeholder="Breve biografía..." />
                      <button type="submit" className={`${themeClasses.bg} w-full py-5 rounded-3xl text-white font-black uppercase text-xs tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2`}><Save size={18}/> Guardar Cambios</button>
                    </form>
                  </div>
                  <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2"><Share2 size={18} className={themeClasses.text}/> Presencia Social</h3>
                    <div className="space-y-5">
                      <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-pink-100" placeholder="Instagram (sin @)" /></div>
                      <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-100" placeholder="Web / Portfolio" /></div>
                      <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input type="text" value={profileForm.linkedin} onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})} className="w-full p-5 pl-12 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="LinkedIn" /></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === AppView.Upload && currentUser && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 md:p-12">
              <h2 className="text-3xl font-black text-slate-900 uppercase text-center mb-10">{editingResourceId ? 'Editar' : 'Crear'} <span className={themeClasses.text}>Contenido Docente</span></h2>
              <form onSubmit={handleUpload} className="space-y-10">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto">
                  <button type="button" onClick={() => setFormData({...formData, kind: 'material', subject: SUBJECTS_BY_LEVEL[formData.level][0]})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.kind === 'material' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Material Didáctico</button>
                  <button type="button" onClick={() => setFormData({...formData, kind: 'blog', subject: BLOG_CATEGORIES[1]})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.kind === 'blog' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Artículo de Blog</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <input required type="text" placeholder="Escribe un título impactante..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contenido principal ({formData.kind === 'blog' ? 'Cuerpo del post' : 'Descripción'})</label>
                      <RichTextEditor value={formData.summary} onChange={(val) => setFormData({...formData, summary: val})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    {formData.kind === 'material' ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nivel Educativo</label>
                          <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationalLevel, courses: [], subject: SUBJECTS_BY_LEVEL[e.target.value as EducationalLevel][0]})}>{Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}</select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Materia / Área</label>
                          <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>{SUBJECTS_BY_LEVEL[formData.level]?.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cursos Relacionados</label>
                          <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">{COURSES_BY_LEVEL[formData.level]?.map(course => (<button key={course} type="button" onClick={() => handleCourseToggle(course)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${formData.courses.includes(course) ? `${themeClasses.bg} border-transparent text-white shadow-md` : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}>{course}</button>))}</div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoría del Blog</label>
                        <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                          {BLOG_CATEGORIES.filter(c => c !== 'Todo').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                          <p className="text-[11px] font-bold text-indigo-700 leading-relaxed"><Info size={14} className="inline mr-1 mb-0.5" /> Los artículos del blog se centran en estrategias pedagógicas y reflexión docente, diferenciándose de los materiales descargables.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {formData.kind === 'material' && (
                  <div className="bg-slate-900 rounded-[32px] p-8 space-y-8 animate-in zoom-in duration-300">
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>Enlace Externo</button>
                      <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>Interactivo HTML</button>
                    </div>
                    {formData.uploadMethod === 'file' ? (
                      <input type="url" placeholder="Pega la URL del recurso (Google Drive, PDF, Genially, etc)..." className="w-full p-6 rounded-2xl bg-slate-800 border-none text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} />
                    ) : (
                      <textarea placeholder="Pega aquí el código HTML para embeber tu material interactivo..." className="w-full p-6 rounded-2xl bg-slate-800 border-none font-mono text-sm text-indigo-300 h-48 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                    )}
                  </div>
                )}
                
                <button type="submit" disabled={isUploading} className={`${themeClasses.bg} w-full py-6 rounded-[28px] text-white font-black uppercase text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50`}>
                  {isUploading ? <Loader2 className="animate-spin inline mr-2" /> : <CheckCircle2 className="inline mr-2" />} 
                  {editingResourceId ? 'Actualizar' : 'Publicar'} {formData.kind === 'blog' ? 'Artículo' : 'Material'}
                </button>
              </form>
            </div>
          </div>
        )}

        {view === AppView.Detail && selectedResource && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => navigateTo(selectedResource.kind === 'blog' ? AppView.Blog : AppView.Explore)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                <ArrowLeft size={18}/> Volver al {selectedResource.kind === 'blog' ? 'Blog' : 'Repositorio'}
              </button>
              <div className="flex items-center gap-3">
                {currentUser?.email === selectedResource.email && (
                  <>
                    <button onClick={() => handleEditResource(selectedResource)} className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors"><Edit3 size={14} /> Editar</button>
                    <button onClick={() => handleDeleteResource(selectedResource.id)} className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /> Eliminar</button>
                  </>
                )}
                <button onClick={() => copyToClipboard(window.location.href)} className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-colors">Compartir</button>
              </div>
            </div>

            {selectedResource.kind === 'blog' ? (
              <article className="max-w-[850px] mx-auto bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                <div className="h-[450px] w-full relative">
                  <img src={selectedResource.thumbnail} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12 md:p-20">
                    <div className="space-y-6">
                      <span className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg">{selectedResource.subject}</span>
                      <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">{selectedResource.title}</h1>
                    </div>
                  </div>
                </div>
                
                <div className="p-12 md:p-20">
                  <div className="flex items-center gap-4 mb-16 pb-12 border-b border-slate-50">
                    <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-16 h-16 rounded-[22px] shadow-xl object-cover border-4 border-white" />
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{selectedResource.authorName}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedResource.uploadDate}</p>
                    </div>
                  </div>
                  
                  <div className="text-slate-700 leading-[1.8] text-xl prose prose-indigo max-w-none prose-img:rounded-[32px] prose-img:shadow-2xl prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-slate-900 prose-blockquote:border-indigo-600 prose-blockquote:bg-indigo-50/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:font-bold prose-blockquote:text-indigo-900 prose-li:font-medium" dangerouslySetInnerHTML={{ __html: renderContentWithVideos(selectedResource.summary, cookieConsent) }} />
                  
                  <div className="mt-24 pt-16 border-t border-slate-50 flex flex-col items-center gap-8 bg-slate-50/50 rounded-[40px] p-12">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Valora este conocimiento</p>
                    <div className="flex justify-center gap-4">
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
                        }} className="text-slate-200 hover:text-amber-500 transition-all hover:scale-125 transform">
                          <Star size={48} fill={v <= Math.round(selectedResource.rating) ? 'currentColor' : 'none'} className={v <= Math.round(selectedResource.rating) ? 'text-amber-500 drop-shadow-lg' : 'text-slate-200'} />
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">({selectedResource.rating} / 5 basado en su impacto pedagógico)</p>
                  </div>
                </div>
              </article>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-10 md:p-14 rounded-[48px] shadow-sm border border-slate-100">
                    <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight">{selectedResource.title}</h1>
                    <div className="text-slate-600 leading-relaxed text-lg prose prose-indigo max-w-none mb-12" dangerouslySetInnerHTML={{ __html: renderContentWithVideos(selectedResource.summary, cookieConsent) }} />
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-5 py-2.5 ${themeClasses.softBg} ${themeClasses.softText} rounded-full text-[10px] font-black uppercase tracking-widest`}>{selectedResource.subject}</span>
                      <span className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedResource.level}</span>
                    </div>
                  </div>

                  {(selectedResource.pastedCode || (selectedResource.contentUrl && selectedResource.contentUrl.trim() !== '')) && (
                    <div ref={resourceContainerRef} className="aspect-video bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative border-4 border-white ring-1 ring-slate-200">
                      <iframe 
                        src={selectedResource.pastedCode ? '' : selectedResource.contentUrl} 
                        srcDoc={selectedResource.pastedCode} 
                        className="w-full h-full border-none bg-white" 
                        title={selectedResource.title} 
                      />
                      <button onClick={handleMaximize} className="absolute bottom-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl hover:scale-110 transition-all text-slate-900 active:scale-95">
                        <Maximize2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-8">
                  <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 text-center space-y-8 sticky top-24">
                    <div className="cursor-pointer group" onClick={() => { setViewingUserEmail(selectedResource.email); navigateTo(AppView.Profile, { user: selectedResource.email }); }}>
                      <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-28 h-28 rounded-[36px] mx-auto shadow-xl object-cover border-4 border-slate-50 group-hover:scale-105 transition-transform" />
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valora el material</p>
                    </div>
                    <a href={selectedResource.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-colors active:scale-95">Ver Original Externo</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16 mt-24 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap size={32} className={themeClasses.text} />
          <span className="text-2xl font-black uppercase tracking-tighter">NOGALES<span className={themeClasses.text}>PT</span></span>
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">© 2025 • Blog y Repositorio Docente Colaborativo para Andalucía</p>
      </footer>

      {/* --- BANNER DE COOKIES (RGPD) --- */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-8 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-7xl mx-auto bg-slate-900 text-white rounded-[32px] p-6 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-800 flex flex-col md:flex-row items-center gap-8 backdrop-blur-md bg-slate-900/95">
            <div className="bg-indigo-600/20 p-4 rounded-3xl text-indigo-400">
              <ShieldCheck size={40} />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h4 className="text-lg font-black uppercase tracking-tight">Tu privacidad es fundamental</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                Utilizamos cookies propias y de terceros (como Google Tag Manager) para mejorar tu experiencia docente, analizar el tráfico y mostrar contenido multimedia de YouTube. Al aceptar, permites que NOGALESPT sea más inteligente para ti.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button 
                onClick={handleRejectCookies}
                className="px-8 py-4 bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 active:scale-95"
              >
                Rechazar
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all active:scale-95"
              >
                Aceptar Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
