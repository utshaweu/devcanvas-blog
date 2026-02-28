import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  
  // Get success message from location state (e.g., after password reset)
  const successMessage = (location.state as { message?: string })?.message;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Show success message as toast if present
  useEffect(() => {
    if (successMessage) {
      toastSuccess(t(TranslationKey.LOGIN_SUCCESS_TITLE), successMessage);
    }
  }, [successMessage, toastSuccess, t]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toastSuccess(t(TranslationKey.LOGIN_SUCCESS_TITLE), t(TranslationKey.LOGIN_SUCCESS_MESSAGE));
      navigate('/dashboard');
    } catch (err: unknown) {
      toastError('Login failed', err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t(TranslationKey.WELCOME_BACK)}</CardTitle>
          <CardDescription className="text-center">
            {t(TranslationKey.ENTER_CREDENTIALS)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t(TranslationKey.EMAIL)}</Label>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t(TranslationKey.PASSWORD)}</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {t(TranslationKey.FORGOT_PASSWORD)}
                </Link>
              </div>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t(TranslationKey.LOGGING_IN)}
                </>
              ) : (
                t(TranslationKey.LOG_IN)
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t(TranslationKey.DONT_HAVE_ACCOUNT)}{' '}
              <Link to="/signup" className="text-accent hover:text-accent-hover font-medium">
                {t(TranslationKey.SIGN_UP)}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
