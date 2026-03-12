import { useEffect } from 'react';
import { AppView, Resource, MainCategory } from '../types';

export const useSeoManager = (
  view: AppView,
  selectedResource: Resource | null,
  activeBlogCategory: string,
  activeCategory: MainCategory,
  stripHtml: (html: string) => string
) => {
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
  }, [view, selectedResource, activeBlogCategory, activeCategory, stripHtml]);
};
