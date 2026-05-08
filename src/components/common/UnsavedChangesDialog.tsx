import React from 'react';
import { AlertTriangle } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { cn } from '@/utils/helpers';
import { UnsavedChangesDialogProps } from '@/types';


export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // Intentionally a no-op: only the explicit buttons resolve this dialog.
        // Allowing onOpenChange to call onCancel would cause blocker.reset() to
        // fire when the dialog closes after the user clicks "Leave Page",
        // cancelling the navigation that was just approved.
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        {/* Use DialogPrimitive.Content directly to avoid the auto-rendered X close button */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg',
            className,
          )}
          // Prevent Escape key from closing the dialog without an explicit choice
          onEscapeKeyDown={(e) => e.preventDefault()}
          // Prevent clicking outside from closing
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-destructive">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {t(TranslationKey.UNSAVED_CHANGES_TITLE)}
            </h2>
            <p className="text-sm text-muted-foreground pt-1">
              {t(TranslationKey.UNSAVED_CHANGES_DESCRIPTION)}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onCancel}>
              {t(TranslationKey.STAY_ON_PAGE)}
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              {t(TranslationKey.LEAVE_PAGE)}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

