import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      await resetPassword(data.email);
      setSuccess(true);
      toastSuccess(
        t(TranslationKey.RESET_EMAIL_SENT_TITLE),
        t(TranslationKey.RESET_EMAIL_SENT_MESSAGE)
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t(TranslationKey.RESET_PASSWORD_FAILED_MESSAGE);
      toastError(t(TranslationKey.RESET_PASSWORD_FAILED_TITLE), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t(TranslationKey.RESET_PASSWORD)}</CardTitle>
          <CardDescription className="text-center">
            {t(TranslationKey.ENTER_EMAIL_RESET)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  {t(TranslationKey.RESET_EMAIL_SENT_MESSAGE)}
                </p>
              </div>
              <div className="text-center">
                <Link to="/login" className="text-accent hover:text-accent-hover font-medium text-sm">
                  {t(TranslationKey.BACK_TO_LOGIN)}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email">{t(TranslationKey.EMAIL_ADDRESS)}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t(TranslationKey.SENDING_RESET_LINK)}
                  </>
                ) : (
                  t(TranslationKey.SEND_RESET_LINK)
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {t(TranslationKey.REMEMBER_PASSWORD)}{' '}
                <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                  {t(TranslationKey.LOGIN)}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
