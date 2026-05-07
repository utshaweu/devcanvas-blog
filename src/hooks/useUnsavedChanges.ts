import { useCallback, useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import type { Location } from 'react-router-dom';

interface UseUnsavedChangesReturn {
  /** Whether the confirmation dialog should be shown */
  showDialog: boolean;
  /** Call to allow the blocked navigation to proceed */
  confirmNavigation: () => void;
  /** Call to cancel the blocked navigation and stay on the page */
  cancelNavigation: () => void;
  /**
   * Call this synchronously before any programmatic navigation that should
   * bypass the dirty check (e.g. right after a successful form submit).
   */
  allowNavigation: () => void;
}

/**
 * Reusable hook that blocks ALL in-app navigation (Link clicks, navigate(),
 * browser back/forward) and browser close/reload when there are unsaved changes.
 *
 * Requires a data router (createBrowserRouter / RouterProvider).
 *
 * Usage:
 *   const { showDialog, confirmNavigation, cancelNavigation, allowNavigation } =
 *     useUnsavedChanges(isDirty);
 */
export function useUnsavedChanges(isDirty: boolean): UseUnsavedChangesReturn {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // One-shot bypass flag — set before programmatic navigation after a save.
  const bypassRef = useRef(false);

  // Block browser close / page reload.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && !bypassRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Block all React Router in-app navigation.
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: Location; nextLocation: Location }) =>
        isDirtyRef.current &&
        !bypassRef.current &&
        (currentLocation.pathname !== nextLocation.pathname ||
          currentLocation.search !== nextLocation.search),
      [],
    ),
  );

  const confirmNavigation = useCallback(() => {
    blocker.proceed?.();
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

  const allowNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return {
    showDialog: blocker.state === 'blocked',
    confirmNavigation,
    cancelNavigation,
    allowNavigation,
  };
}

