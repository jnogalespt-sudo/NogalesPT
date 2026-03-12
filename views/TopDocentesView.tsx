import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { AppView } from '../types';

interface TopDocentesViewProps {
  teacherRankings: Record<string, any[]>;
  themeClasses: any;
  setViewingUserEmail: (email: string) => void;
  navigateTo: (view: AppView, params?: any) => void;
}

export const TopDocentesView: React.FC<TopDocentesViewProps> = ({
  teacherRankings,
  themeClasses,
  setViewingUserEmail,
  navigateTo
}) => {
  return (
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
  );
};
