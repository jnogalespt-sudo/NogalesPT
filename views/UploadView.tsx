import React from 'react';
import { Info, Loader2, CheckCircle2 } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { EducationalLevel } from '../types';

// We use any for SafeAny to avoid importing it if it's not exported, or we can just use any
type SafeAny = any;

interface UploadViewProps {
  editingResourceId: string | null;
  themeClasses: { text: string; bg: string };
  handleUpload: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  SUBJECTS_BY_LEVEL: Record<string, string[]>;
  BLOG_CATEGORIES: string[];
  activeCategory: string;
  NEAE_OPTIONS: string[];
  DESARROLLO_AREAS: string[];
  COURSES_BY_LEVEL: Record<string, string[]>;
  handleCourseToggle: (course: string) => void;
  isUploading: boolean;
}

export const UploadView: React.FC<UploadViewProps> = ({
  editingResourceId,
  themeClasses,
  handleUpload,
  formData,
  setFormData,
  SUBJECTS_BY_LEVEL,
  BLOG_CATEGORIES,
  activeCategory,
  NEAE_OPTIONS,
  DESARROLLO_AREAS,
  COURSES_BY_LEVEL,
  handleCourseToggle,
  isUploading
}) => {
  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 md:p-12">
        <h2 className="text-3xl font-black text-slate-900 uppercase text-center mb-10">{editingResourceId ? 'Editar' : 'Crear'} <span className={themeClasses.text}>Contenido Docente</span></h2>
        <form onSubmit={handleUpload} className="space-y-10">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto">
            <button type="button" onClick={() => setFormData({...formData, kind: 'material', subject: (SUBJECTS_BY_LEVEL as SafeAny)[formData.level as SafeAny][0]})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.kind === 'material' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Material Didáctico</button>
            <button type="button" onClick={() => setFormData({...formData, kind: 'blog', subject: BLOG_CATEGORIES[1]})} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.kind === 'blog' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Artículo de Blog</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <input required type="text" placeholder="Escribe un título impactante..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="url" placeholder="URL de la imagen de portada (opcional)..." className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
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
                    <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as EducationalLevel, courses: [], subject: (SUBJECTS_BY_LEVEL as SafeAny)[e.target.value as SafeAny][0]})}>{Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}</select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Materia / Área</label>
                    <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>{(SUBJECTS_BY_LEVEL as SafeAny)[formData.level as SafeAny]?.map((s: string) => <option key={s} value={s}>{s}</option>)}</select>
                  </div>

                  {/* SELECTORES PT-AL (PASO 3) */}
                  {activeCategory === 'PT-AL' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Necesidad Específica (NEAE)</label>
                        <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.neae} onChange={e => setFormData({...formData, neae: e.target.value})}>
                          <option value="">Ninguna seleccionada</option>
                          {NEAE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Área de Desarrollo</label>
                        <select className="w-full p-5 rounded-2xl bg-slate-50 border-none font-bold outline-none cursor-pointer" value={formData.desarrolloArea} onChange={e => setFormData({...formData, desarrolloArea: e.target.value})}>
                          <option value="">Ninguna seleccionada</option>
                          {DESARROLLO_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cursos Relacionados</label>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">{(COURSES_BY_LEVEL as SafeAny)[formData.level as SafeAny]?.map((course: string) => (<button key={course} type="button" onClick={() => handleCourseToggle(course)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${formData.courses.includes(course) ? `${themeClasses.bg} border-transparent text-white shadow-md` : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}>{course}</button>))}</div>
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
  );
};
