import { useState, useCallback, useRef } from 'react';
import type { Toast, ToastType } from '@/types';
import { generateId } from '@/utils/helpers';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Track all pending auto-dismiss timers so they can be cancelled individually
  // (removeToast) or all at once (clearAll), preventing stale state updates.
  const timerMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Cancel the auto-dismiss timer for this toast if it is still pending.
    const timerId = timerMapRef.current.get(id);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerMapRef.current.delete(id);
    }
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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
      const timerId = setTimeout(() => {
        timerMapRef.current.delete(id);
        removeToast(id);
      }, duration);
      timerMapRef.current.set(id, timerId);
    }

    return id;
  }, [removeToast]);

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
    // Cancel every pending auto-dismiss timer before clearing the list.
    timerMapRef.current.forEach((timerId) => clearTimeout(timerId));
    timerMapRef.current.clear();
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
