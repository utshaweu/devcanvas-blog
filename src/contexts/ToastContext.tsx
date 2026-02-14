import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/useToast';
import type { Toast } from '@/types';

interface ToastContextType {
  toasts: Toast[];
  success: (title: string, description?: string, duration?: number) => string;
  error: (title: string, description?: string, duration?: number) => string;
  warning: (title: string, description?: string, duration?: number) => string;
  info: (title: string, description?: string, duration?: number) => string;
  clearAll: () => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const GlobalToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, success, error, warning, info, clearAll, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, clearAll, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};