import React from 'react';
import { ArrowLeft, Edit3, Trash2, Maximize2, Newspaper } from 'lucide-react';
import { AppView, Resource, User as UserType } from '../types';

interface ResourceDetailProps {
  selectedResource: Resource | null;
  currentUser: UserType | null;
  users: UserType[];
  themeClasses: { bg: string; text: string; softBg: string; softText: string };
  cookieConsent: boolean | null;
  navigateTo: (view: AppView, params?: Record<string, string>) => void;
  handleEditResource: (resource: Resource) => void;
  handleDeleteResource: (id: string) => void;
  copyToClipboard: (text: string) => void;
  setViewingUserEmail: (email: string | null) => void;
  handleMaximize: () => void;
  renderContentWithVideos: (content: string, consent: boolean | null) => string;
  isLoading?: boolean;
}

const ResourceDetail: React.FC<ResourceDetailProps> = ({
  selectedResource,
  currentUser,
  users,
  themeClasses,
  cookieConsent,
  navigateTo,
  handleEditResource,
  handleDeleteResource,
  copyToClipboard,
  setViewingUserEmail,
  handleMaximize,
  renderContentWithVideos,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex py-24 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedResource) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto text-slate-400">
          <Newspaper size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Recurso no encontrado</h2>
          <p className="text-slate-500 font-medium">El material que buscas no existe o ha sido eliminado.</p>
        </div>
        <button 
          onClick={() => navigateTo(AppView.Explore)}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Volver al repositorio
        </button>
      </div>
    );
  }

  return (
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
          <button onClick={() => { if(typeof window !== 'undefined') copyToClipboard(window.location.href)}} className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-sm hover:bg-slate-50 transition-colors">Compartir</button>
        </div>
      </div>

      {selectedResource.kind === 'blog' ? (
        <article className="max-w-[850px] mx-auto bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <div className="h-[450px] w-full relative">
            <img src={selectedResource.thumbnail} className="w-full h-full object-cover" alt={selectedResource.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12 md:p-20">
              <div className="space-y-6">
                <span className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg">{selectedResource.subject}</span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">{selectedResource.title}</h1>
              </div>
            </div>
          </div>
          
          <div className="p-12 md:p-20">
            <div className="flex items-center gap-4 mb-16 pb-12 border-b border-slate-50">
              <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-16 h-16 rounded-[22px] shadow-xl object-cover border-4 border-white" alt={selectedResource.authorName} />
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{selectedResource.authorName}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedResource.uploadDate}</p>
              </div>
            </div>
            
            <div className="text-slate-700 leading-[1.8] text-xl prose prose-indigo max-w-none prose-img:rounded-[32px] prose-img:shadow-2xl" dangerouslySetInnerHTML={{ __html: renderContentWithVideos(selectedResource.summary, cookieConsent) }} />
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
                {selectedResource.neae && <span className="px-5 py-2.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedResource.neae}</span>}
                {selectedResource.desarrolloArea && <span className="px-5 py-2.5 bg-sky-50 text-sky-700 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedResource.desarrolloArea}</span>}
              </div>
            </div>

            {(selectedResource.pastedCode || (selectedResource.contentUrl && selectedResource.contentUrl.trim() !== '')) && (
              <div className="aspect-video bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative border-4 border-white ring-1 ring-slate-200">
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
                <img src={users.find(u => u.email === selectedResource.email)?.avatar || `https://ui-avatars.com/api/?name=${selectedResource.authorName}`} className="w-28 h-28 rounded-[36px] mx-auto shadow-xl object-cover border-4 border-slate-50 group-hover:scale-105 transition-transform" alt={selectedResource.authorName} />
                <h3 className="font-black text-slate-900 text-xl mt-6 group-hover:text-indigo-600 transition-colors">{selectedResource.authorName}</h3>
              </div>
              <a href={selectedResource.contentUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-slate-800 transition-colors active:scale-95">Ver Original Externo</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;
