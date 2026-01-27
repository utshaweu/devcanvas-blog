import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, AuthSession, LoginCredentials, SignupCredentials } from '@/types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) throw error;

          if (data.user && data.session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (userError) throw userError;

            set({
              user: userData,
              session: {
                user: userData,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at || null,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to login',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) throw error;

          if (data.user) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: credentials.email,
                name: credentials.name,
              });

            if (insertError) throw insertError;

            set({
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to signup',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to logout',
            isLoading: false,
          });
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          if (data.session) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (userError) throw userError;

            set({
              user: userData,
              session: {
                user: userData,
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at || null,
              },
              isAuthenticated: true,
            });
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          }
        } catch (error: any) {
          console.error('Failed to refresh session:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;

          set({
            user: data,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        const { refreshSession } = get();
        await refreshSession();

        // Set up auth state change listener
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            refreshSession();
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          }
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
