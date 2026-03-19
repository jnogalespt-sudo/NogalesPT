import React, { useState, useMemo, useEffect } from 'react';
import { Code2, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Resource, AppView, User as UserType } from '../types';
import { ExploreGrid } from '../components/ExploreGrid';
import RichTextEditor from '../components/RichTextEditor';
import { dbService } from '../services/dbService';

interface DevViewProps {
  resources: Resource[];
  currentUser: UserType | null;
  themeClasses: { text: string; bg: string };
  setSelectedResource: (resource: Resource | null) => void;
  navigateTo: (view: AppView, params?: any) => void;
  stripHtml: (html: string) => string;
  isLoading?: boolean;
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  editingResourceId: string | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleUpload: (e: React.FormEvent) => Promise<void>;
  isUploading: boolean;
  initialShowForm?: boolean;
}

export const DevView: React.FC<DevViewProps> = ({
  resources,
  currentUser,
  themeClasses,
  setSelectedResource,
  navigateTo,
  stripHtml,
  isLoading,
  setResources,
  editingResourceId,
  formData,
  setFormData,
  handleUpload,
  isUploading,
  initialShowForm
}) => {
  const [showForm, setShowForm] = useState(!!editingResourceId || !!initialShowForm);

  // Update showForm when editingResourceId changes
  useEffect(() => {
    if (editingResourceId || initialShowForm) {
      setShowForm(true);
    }
  }, [editingResourceId, initialShowForm]);

  const devResources = useMemo(() => {
    return resources.filter(res => res.mainCategory === 'Dev');
  }, [resources]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Code2 size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Zona <span className="text-slate-500">Dev</span></h2>
            <p className="text-slate-500 font-medium text-sm">Proyectos interactivos y herramientas</p>
          </div>
        </div>
        
        {currentUser && (
          <button 
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                navigateTo(AppView.Dev, { fromNavbar: 'true' });
              } else {
                setFormData({ ...formData, mainCategory: 'Dev' });
                setShowForm(true);
              }
            }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
          >
            {showForm ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Subir Proyecto</>}
          </button>
        )}
      </div>

      {showForm && currentUser && (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 mb-12 animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black text-slate-900 uppercase mb-8">Nuevo Proyecto Dev</h3>
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <input required type="text" placeholder="Título del proyecto..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-slate-200 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <input type="url" placeholder="URL de la imagen de portada (opcional)..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-slate-200 transition-all" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Descripción</label>
                  <RichTextEditor value={formData.summary} onChange={(val: string) => setFormData({...formData, summary: val})} />
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-[24px] p-6 space-y-6">
                <div className="flex gap-4">
                  <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'code'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'code' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>Código HTML</button>
                  <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${formData.uploadMethod === 'file' ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>URL Externa</button>
                </div>
                
                {formData.uploadMethod === 'file' ? (
                  <input required type="url" placeholder="URL externa del proyecto..." className="w-full p-5 rounded-2xl bg-slate-800 border-none text-white font-bold outline-none focus:ring-2 focus:ring-slate-600 transition-all" value={formData.externalUrl} onChange={e => setFormData({...formData, externalUrl: e.target.value})} />
                ) : (
                  <textarea required placeholder="Pega aquí el código HTML..." className="w-full p-5 rounded-2xl bg-slate-800 border-none font-mono text-sm text-slate-300 h-48 outline-none focus:ring-2 focus:ring-slate-600 transition-all" value={formData.pastedCode} onChange={e => setFormData({...formData, pastedCode: e.target.value})} />
                )}
              </div>
            </div>
            
            <button type="submit" disabled={isUploading} className="w-full py-5 bg-slate-900 rounded-2xl text-white font-black uppercase text-sm shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
              {isUploading ? <Loader2 className="animate-spin inline mr-2" /> : <CheckCircle2 className="inline mr-2" />} 
              Publicar Proyecto
            </button>
          </form>
        </div>
      )}

      {devResources.length === 0 && !isLoading ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100">
          <Code2 size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-black text-slate-400 uppercase">Sin proyectos</h3>
          <p className="text-slate-400 font-medium mt-2">Aún no hay proyectos en la zona Dev.</p>
        </div>
      ) : (
        <ExploreGrid
          filteredResources={devResources}
          themeClasses={{ text: 'text-slate-500', bg: 'bg-slate-900' }}
          setSelectedResource={setSelectedResource}
          navigateTo={navigateTo}
          stripHtml={stripHtml}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
