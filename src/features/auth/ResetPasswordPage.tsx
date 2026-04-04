import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useGlobalToast } from '@/contexts/ToastContext';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { success: toastSuccess, error: toastError } = useGlobalToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Check if we have a valid recovery token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (!accessToken || type !== 'recovery') {
      setIsValidToken(false);
    }
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await updatePassword(data.password);
      toastSuccess(
        t(TranslationKey.PASSWORD_UPDATED_SUCCESS),
        t(TranslationKey.PASSWORD_UPDATED_SUCCESS)
      );
      // Redirect to login after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t(TranslationKey.PASSWORD_UPDATE_FAILED_MESSAGE);
      toastError(t(TranslationKey.PASSWORD_UPDATE_FAILED_TITLE), errorMessage);
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">{t(TranslationKey.INVALID_LINK_TITLE)}</CardTitle>
            <CardDescription className="text-center">
              {t(TranslationKey.INVALID_LINK_BODY)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">
                  {t(TranslationKey.INVALID_LINK_BODY)}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/forgot-password')} 
                className="w-full"
              >
                {t(TranslationKey.REQUEST_NEW_LINK)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t(TranslationKey.RESET_PASSWORD)}</CardTitle>
          <CardDescription className="text-center">
            {t(TranslationKey.ENTER_NEW_PASSWORD)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t(TranslationKey.NEW_PASSWORD)}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t(TranslationKey.CONFIRM_NEW_PASSWORD)}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  );
};
