import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data);
      toastSuccess(t(TranslationKey.SIGNUP_SUCCESS_TITLE), t(TranslationKey.SIGNUP_SUCCESS_REDIRECT_MESSAGE));
      navigate('/login');
    } catch (err: unknown) {
      toastError(t(TranslationKey.SIGNUP_FAILED_TITLE), t(TranslationKey.SIGNUP_FAILED_MESSAGE));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">{t(TranslationKey.CREATE_ACCOUNT)}</CardTitle>
          <CardDescription className="text-center">
            {t(TranslationKey.ENTER_INFO)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Form errors */}
            <Input
              id="name"
              type="text"
              label={t(TranslationKey.NAME)}
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
              disabled={isLoading}
            />

            <Input
              id="email"
              type="email"
              label={t(TranslationKey.EMAIL)}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
            />

            <div className="space-y-2">
              <Label htmlFor="password">{t(TranslationKey.PASSWORD)}</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                visible={showPasswords.password}
                onVisibilityChange={(visible) =>
                  setShowPasswords((prev) => ({ ...prev, password: visible }))
                }
                disabled={isLoading}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t(TranslationKey.CONFIRM_PASSWORD)}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                visible={showPasswords.confirm}
                onVisibilityChange={(visible) =>
                  setShowPasswords((prev) => ({ ...prev, confirm: visible }))
                }
                disabled={isLoading}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {t(TranslationKey.CREATING_ACCOUNT)}
                </>
              ) : (
                t(TranslationKey.SIGN_UP)
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t(TranslationKey.ALREADY_HAVE_ACCOUNT)}{' '}
              <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                {t(TranslationKey.LOGIN)}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
