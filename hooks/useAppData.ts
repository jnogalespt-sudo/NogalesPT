import { useEffect } from 'react';
import { Resource, User as UserType } from '../types';
import { dbService, supabase } from '../services/dbService';

export function useAppData(
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>,
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType | null>>,
  setProfileForm: React.Dispatch<React.SetStateAction<UserType>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedResource: React.Dispatch<React.SetStateAction<Resource | null>>,
  isStandalone: boolean = false
) {
  useEffect(() => {
    if (isStandalone) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let authCallId = 0;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const idParam = params.get('id');
      
      if (view === 'detail' && idParam) {
        dbService.getResourceById(idParam).then((resource: Resource | null) => {
          if (isMounted && resource) {
            setSelectedResource(resource);
            setIsLoading(false);
          }
        }).catch((e: any) => {
          console.warn("Error cargando recurso prioritario:", e);
        });
      }
    }

    const loadDataAndAuth = async (session: any) => {
      const currentCallId = ++authCallId;
      try {
        if (typeof window !== 'undefined') {
          const cachedResources = localStorage.getItem('nogalespt_cached_resources');
          if (cachedResources) {
            try {
              const parsed = JSON.parse(cachedResources);
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (isMounted) {
                  setResources(parsed);
                  const isOAuthRedirect = window.location.hash.includes('access_token');
                  if (!isOAuthRedirect) {
                    setIsLoading(false);
                  }
                }
              }
            } catch (e) {
              console.warn('Error parsing cached resources', e);
            }
          }
        }

        const fetchAuthAndUsers = async () => {
          try {
            const usersData = await dbService.getUsers().catch(() => []);
            if (!isMounted || currentCallId !== authCallId) return;
            setUsers(usersData || []);

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const activeSession = currentSession || session;

            if (!isMounted || currentCallId !== authCallId) return;

            if (activeSession?.user) {
              const uEmail = activeSession.user.email || '';
              let user = usersData.find((u: UserType) => u.email === uEmail);
              
              if (user) {
                if (user.email === 'nogales1994@gmail.com') {
                  user.role = 'superadmin';
                }
              } else {
                user = {
                  email: uEmail,
                  name: activeSession.user.user_metadata?.full_name || uEmail?.split('@')?.[0] || '',
                  avatar: activeSession.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${uEmail}&background=random`,
                  role: uEmail === 'nogales1994@gmail.com' ? 'superadmin' : 'user'
                };
                await dbService.saveUser(user);
                if (isMounted && currentCallId === authCallId) {
                  setUsers(prev => {
                    if (!prev.find((u: UserType) => u.email === uEmail)) {
                      return [...prev, user!];
                    }
                    return prev;
                  });
                }
              }
              
              if (isMounted && currentCallId === authCallId) {
                setCurrentUser(user);
                setProfileForm(user);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('nogalespt_current_user', JSON.stringify(user));
                }
              }
            } else {
              if (isMounted && currentCallId === authCallId) {
                setCurrentUser(null);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('nogalespt_current_user');
                }
              }
            }
          } catch (error) {
            console.error("Error en fetchAuthAndUsers:", error);
          }
        };

        const fetchResources = async () => {
          try {
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              const view = params.get('view');
              if (view === 'detail' || view === 'explore' || view === 'dev' || view === 'blog') {
                if (isMounted && currentCallId === authCallId) {
                  setIsLoading(false);
                }
                return;
              }
            }

            const resData = await dbService.getResources().catch(() => []);
            if (!isMounted || currentCallId !== authCallId) return;
            const finalResources = resData || [];
            setResources(finalResources);

            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('nogalespt_cached_resources', JSON.stringify(finalResources));
              } catch (e) {}
            }
          } catch (error) {
            console.error("Error en fetchResources:", error);
          } finally {
            if (isMounted && currentCallId === authCallId) {
              setIsLoading(false);
            }
          }
        };

        await fetchAuthAndUsers();
        await fetchResources();

      } catch (error) {
        console.error("Error cargando app:", error);
        if (isMounted && currentCallId === authCallId) {
          setIsLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (isMounted) {
        loadDataAndAuth(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (isMounted) {
          loadDataAndAuth(session);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('nogalespt_current_user');
          }
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isStandalone]);
}
