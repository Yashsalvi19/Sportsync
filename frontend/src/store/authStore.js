import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isInitialized: false,

  // Set auth state manually
  setAuth: (user, session) => {
    set({ user, session, isInitialized: true });
  },

  // Logout via Supabase
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  // Initialize listener
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ 
      session, 
      user: session?.user || null, 
      isInitialized: true 
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        session, 
        user: session?.user || null 
      });
    });
  }
}));
