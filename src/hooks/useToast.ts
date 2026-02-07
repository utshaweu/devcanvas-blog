import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '@/types';
import { generateId } from '@/utils/helpers';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    description?: string,
    duration = 5000,
  ) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      type,
      title,
      description,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('success', title, description, duration);
  }, [addToast]);

  const error = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('error', title, description, duration);
  }, [addToast]);

  const warning = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('warning', title, description, duration);
  }, [addToast]);

  const info = useCallback((title: string, description?: string, duration?: number) => {
    return addToast('info', title, description, duration);
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
