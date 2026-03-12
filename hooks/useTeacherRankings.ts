import { useMemo } from 'react';
import { Resource, User } from '../types';

export const useTeacherRankings = (resources: Resource[], users: User[]) => {
  return useMemo(() => {
    const rankings: Record<string, any[]> = {};
    const levels: string[] = ['Infantil', 'Primaria', 'Secundaria', 'Bachillerato', 'PT-AL'];
    
    levels.forEach(level => {
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
};
