import React from 'react';
import { ArrowLeft, Mail, Instagram, Linkedin, Music, Twitter, Globe, Newspaper } from 'lucide-react';
import { User as UserType, Resource, AppView } from '../types';

type SafeAny = any;

const SocialLink = ({ platform, handle }: { platform: 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'website', handle?: string }) => {
  if (!handle) return null;
  const platforms = {
    instagram: { icon: Instagram, color: 'hover:text-pink-600 hover:bg-pink-50', url: (h: string) => `https://instagram.com/${h}`, label: 'Instagram' },
    linkedin: { icon: Linkedin, color: 'hover:text-blue-700 hover:bg-blue-50', url: (h: string) => `https://linkedin.com/in/${h}`, label: 'LinkedIn' },
    tiktok: { icon: Music, color: 'hover:text-slate-900 hover:bg-slate-100', url: (h: string) => `https://tiktok.com/@${h}`, label: 'TikTok' },
    twitter: { icon: Twitter, color: 'hover:text-sky-500 hover:bg-sky-50', url: (h: string) => `https://twitter.com/${h}`, label: 'Twitter' },
    website: { icon: Globe, color: 'hover:text-emerald-600 hover:bg-emerald-50', url: (h: string) => h.startsWith('http') ? h : `https://${h}`, label: 'Web' }
  };
  const config = (platforms as SafeAny)[platform];
  if (!config) return null;
  return (
    <a href={config.url(handle)} target="_blank" rel="noopener noreferrer" title={config.label} className={`p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm transition-all text-slate-400 ${config.color} hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center`}>
      <config.icon size={18} />
    </a>
  );
};

interface ProfileViewProps {
  activeProfile: UserType | null;
  profileResources: Resource[];
  themeClasses: any;
  navigateTo: (view: AppView, params?: any) => void;
  setSelectedResource: (resource: Resource | null) => void;
  isLoading?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  activeProfile,
  profileResources,
  themeClasses,
  navigateTo,
  setSelectedResource,
  isLoading
}) => {
  if (isLoading || !activeProfile) {
    return (
      <div className="flex py-24 items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
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
  );
};
