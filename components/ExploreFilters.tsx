import React from 'react';
import { Search } from 'lucide-react';

interface ExploreFiltersProps {
  activeCategory: string;
  themeClasses: { text: string; bg: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterLevel: string;
  setFilterLevel: (level: string) => void;
  filterNeae: string;
  setFilterNeae: (neae: string) => void;
  filterDesarrollo: string;
  setFilterDesarrollo: (area: string) => void;
  SUBJECTS_BY_LEVEL: Record<string, string[]>;
  NEAE_OPTIONS: string[];
  DESARROLLO_AREAS: string[];
}

export const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  activeCategory,
  themeClasses,
  searchQuery,
  setSearchQuery,
  filterLevel,
  setFilterLevel,
  filterNeae,
  setFilterNeae,
  filterDesarrollo,
  setFilterDesarrollo,
  SUBJECTS_BY_LEVEL,
  NEAE_OPTIONS,
  DESARROLLO_AREAS
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-black text-slate-900 uppercase">Explorar <span className={themeClasses.text}>{activeCategory}</span></h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar material..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 font-bold shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* BARRA DE FILTRADO HORIZONTAL */}
      <div className="flex flex-wrap items-center gap-4 py-2 px-1 border-y border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Nivel:</span>
          <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-600 outline-none" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="Todos">Todos los niveles</option>
            {Object.keys(SUBJECTS_BY_LEVEL).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {activeCategory === 'PT-AL' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">NEAE:</span>
              <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-600 outline-none" value={filterNeae} onChange={(e) => setFilterNeae(e.target.value)}>
                <option value="Todos">Cualquier NEAE</option>
                {NEAE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Área:</span>
              <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-slate-600 outline-none" value={filterDesarrollo} onChange={(e) => setFilterDesarrollo(e.target.value)}>
                <option value="Todos">Cualquier Área</option>
                {DESARROLLO_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
          </>
        )}
      </div>
    </>
  );
};
