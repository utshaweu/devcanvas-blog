import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirmation password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

interface UpdatePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdatePasswordDialog: React.FC<UpdatePasswordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { updatePassword } = useAuth();
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  // Reset form and validation errors when modal is closed
  useEffect(() => {
    if (!open) {
      reset();
      setShowPasswords({ current: false, new: false, confirm: false });
    }
  }, [open, reset]);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);

    try {
      await updatePassword(data.newPassword);
      toastSuccess(
        t(TranslationKey.PASSWORD_UPDATED_SUCCESS),
        t(TranslationKey.PASSWORD_CHANGED_MESSAGE)
      );
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t(TranslationKey.PASSWORD_UPDATE_FAILED_MESSAGE);
      toastError(
        t(TranslationKey.PASSWORD_UPDATE_FAILED_TITLE),
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <DialogTitle>{t(TranslationKey.CHANGE_PASSWORD)}</DialogTitle>
          </div>
          <DialogDescription>
            {t(TranslationKey.UPDATE_PASSWORD_DESCRIPTION)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            id="currentPassword"
            label={t(TranslationKey.CURRENT_PASSWORD)}
            placeholder="••••••••"
            visible={showPasswords.current}
            onVisibilityChange={(visible) =>
              setShowPasswords((prev) => ({ ...prev, current: visible }))
            }
            disabled={isLoading}
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <PasswordInput
            id="newPassword"
            label={t(TranslationKey.NEW_PASSWORD)}
            placeholder="••••••••"
            visible={showPasswords.new}
            onVisibilityChange={(visible) =>
              setShowPasswords((prev) => ({ ...prev, new: visible }))
            }
            disabled={isLoading}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <PasswordInput
            id="confirmPassword"
            label={t(TranslationKey.CONFIRM_NEW_PASSWORD)}
            placeholder="••••••••"
            visible={showPasswords.confirm}
            onVisibilityChange={(visible) =>
              setShowPasswords((prev) => ({ ...prev, confirm: visible }))
            }
            disabled={isLoading}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t(TranslationKey.UPDATING_PASSWORD)}
              </>
            ) : (
              t(TranslationKey.UPDATE_PASSWORD)
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
