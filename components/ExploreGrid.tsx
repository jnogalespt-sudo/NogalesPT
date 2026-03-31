import React from 'react';
import { Star } from 'lucide-react';
import { Resource, AppView } from '../types';

interface ExploreGridProps {
  filteredResources: Resource[];
  themeClasses: any;
  setSelectedResource: (resource: Resource | null) => void;
  navigateTo: (view: AppView, params?: any) => void;
  stripHtml: (html: string) => string;
  isLoading?: boolean;
  hasMoreResources?: boolean;
  isLoadingMore?: boolean;
  handleLoadMore?: () => void;
}

export const ExploreGrid: React.FC<ExploreGridProps> = ({
  filteredResources,
  themeClasses,
  setSelectedResource,
  navigateTo,
  stripHtml,
  isLoading,
  hasMoreResources,
  isLoadingMore,
  handleLoadMore
}) => {
  if (isLoading) {
    return (
      <div className="flex py-24 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
      
      {hasMoreResources && handleLoadMore && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 ${
              isLoadingMore 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : `${themeClasses.bg} text-white shadow-xl hover:scale-105`
            }`}
          >
            {isLoadingMore ? 'Cargando...' : 'Cargar más recursos'}
          </button>
        </div>
      )}
    </div>
  );
};
