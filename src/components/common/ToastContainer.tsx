import React from 'react';
import { useGlobalToast } from '@/contexts/ToastContext';
import { ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalToast();

  return (
    <>
      <ToastViewport className="toast-viewport w-auto right-4 bottom-6 top-auto" />
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.type}
          open={true}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
          className="toast-root animate-in w-auto max-w-xs"
        >
          <div className="flex-1 flex flex-col">
            <ToastTitle className="toast-title">{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription className="toast-description">{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose className="toast-close" />
          <div
            aria-hidden
            className="toast-progress"
            style={{ ['--toast-duration' as string]: `${toast.duration ?? 5000}ms` } as React.CSSProperties}
          />
        </Toast>
      ))}
    </>
  );
};

export default ToastContainer;
