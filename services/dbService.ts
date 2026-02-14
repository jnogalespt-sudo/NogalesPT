import { createClient } from '@supabase/supabase-js';
import { Resource, User, PrivateMessage } from '../types';
import { INITIAL_RESOURCES, INITIAL_USERS } from '../constants';

const SUPABASE_URL = 'https://qdovmzzniofuodutkbza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb3ZtenpuaW9mdW9kdXRrYnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODMzNzIsImV4cCI6MjA4MzM1OTM3Mn0.-qvr_s_AIueO1Q2o5axtqwiOkxrno9h0-wUlM0MhtnA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const dbService = {
  // --- Autenticación ---
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // --- Recursos ---
  async getResources(): Promise<Resource[]> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('data')
        .order('created_at', { ascending: false });

      if (data && !error) {
        return data.map(r => r.data as Resource);
      }
    } catch (e) {
      console.error('Supabase fetch error:', e);
    }

    const saved = localStorage.getItem('nogalespt_resources');
    try {
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  },

  async saveResource(resource: Resource): Promise<void> {
    try {
      await supabase
        .from('resources')
        .upsert({ id: resource.id, data: resource });
    } catch (e) {
      console.error('Supabase save error:', e);
    }
    
    localStorage.removeItem('nogalespt_resources'); // Forzar recarga de cache
  },

  async deleteResource(id: string): Promise<void> {
    try {
      await supabase.from('resources').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete error:', e);
    }
  },

  // --- Usuarios ---
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('data');
      if (data && !error) {
        return data.map(u => u.data as User);
      }
    } catch (e) {
      console.error('Supabase users error:', e);
    }

    const saved = localStorage.getItem('nogalespt_users');
    try {
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await supabase
        .from('users')
        .upsert({ email: user.email, data: user });
    } catch (e) {
      console.error('Supabase user save error:', e);
    }
    const users = await this.getUsers();
    const index = users.findIndex(u => u.email === user.email);
    const updatedUsers = index > -1 ? [...users] : [...users, user];
    if (index > -1) updatedUsers[index] = user;
    localStorage.setItem('nogalespt_users', JSON.stringify(updatedUsers));
  },

  async getMessages(): Promise<PrivateMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('data')
        .order('timestamp', { ascending: true });
      if (data && !error) {
        return data.map(m => m.data as PrivateMessage);
      }
    } catch (e) {
      console.error('Supabase messages error:', e);
    }

    const saved = localStorage.getItem('nogalespt_messages');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveMessage(message: PrivateMessage): Promise<void> {
    try {
      await supabase
        .from('messages')
        .insert({ id: message.id, data: message, timestamp: message.timestamp });
    } catch (e) {
      console.error('Supabase message save error:', e);
    }
  }
};