import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshSession,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
  } = useAuthStore();

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    refreshSession,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useGuestOnly(redirectTo = '/dashboard') {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}
