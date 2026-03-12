import React from 'react';
import { AppView, Resource } from '../types';

interface BlogViewProps {
  filteredBlogPosts: Resource[];
  activeBlogCategory: string;
  handleBlogCategoryClick: (cat: string) => void;
  setSelectedResource: (resource: Resource) => void;
  navigateTo: (view: AppView, params?: Record<string, string>) => void;
  BLOG_CATEGORIES: string[];
  stripHtml: (html: string) => string;
  isLoading?: boolean;
}

const BlogView: React.FC<BlogViewProps> = ({
  filteredBlogPosts,
  activeBlogCategory,
  handleBlogCategoryClick,
  setSelectedResource,
  navigateTo,
  BLOG_CATEGORIES,
  stripHtml,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex py-24 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
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
              <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
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
      </div>
    </div>
  );
};

export default BlogView;
