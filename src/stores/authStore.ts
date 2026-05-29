import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User, AuthSession, LoginCredentials, SignupCredentials } from '@/types';

let authSubscription: { unsubscribe: () => void } | null = null;
let initializePromise: Promise<void> | null = null;
let isInitialized = false;

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

const getFallbackName = (email: string): string => {
  const [localPart] = email.split('@');
  return localPart || 'User';
};

const resolveProfileName = (authUser: SupabaseAuthUser, fallbackName?: string): string => {
  const metadataName =
    typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name.trim() : '';
  if (metadataName) return metadataName;

  const trimmedFallback = fallbackName?.trim();
  if (trimmedFallback) return trimmedFallback;

  if (authUser.email) {
    return getFallbackName(authUser.email);
  }

  return 'User';
};

const getOrCreateUserProfile = async (
  authUser: SupabaseAuthUser,
  fallbackName?: string
): Promise<User> => {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existingUser) return existingUser;

  if (!authUser.email) {
    throw new Error('Authenticated user email is missing.');
  }

  const { data: createdUser, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email,
      name: resolveProfileName(authUser, fallbackName),
    })
    .select()
    .single();

  if (insertError) {
    // In parallel auth flows, another request may insert first.
    if (insertError.code === '23505') {
      const { data: raceWinnerUser, error: raceFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (raceFetchError) throw raceFetchError;
      return raceWinnerUser;
    }

    throw insertError;
  }

  return createdUser;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
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
            const userData = await getOrCreateUserProfile(data.user);

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
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to login',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      loginWithOAuth: async (provider: 'google' | 'github') => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
            },
          });
          if (error) throw error;
          // Redirect is handled by Supabase — loading state stays true until navigation
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : `Failed to sign in with ${provider}`,
            isLoading: false,
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
            options: {
              data: {
                name: credentials.name,
              },
            },
          });

          if (error) throw error;

          if (data.user && data.session) {
            await getOrCreateUserProfile(data.user, credentials.name);
          }

          set({
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to signup',
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
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to logout',
            isLoading: false,
          });
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          if (data.session) {
            const userData = await getOrCreateUserProfile(data.session.user);

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
        } catch (error: unknown) {
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
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to send reset password email',
            isLoading: false,
          });
          throw error;
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;

          set({ isLoading: false });
        } catch (error: unknown) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update password',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        if (isInitialized) {
          return;
        }

        if (initializePromise) {
          return initializePromise;
        }

        initializePromise = (async () => {
          set({ isLoading: true, error: null });
          const { refreshSession } = get();
          await refreshSession();

          if (authSubscription) {
            authSubscription.unsubscribe();
          }

          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              void get().refreshSession();
              return;
            }

            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
          });

          authSubscription = data.subscription;
          isInitialized = true;
          set({ isLoading: false });
        })().finally(() => {
          initializePromise = null;
        });

        return initializePromise;
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
