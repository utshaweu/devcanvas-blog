import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FileUpload } from '@/components/ui/file-upload';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { User, Mail, FileText, Loader2, ImageIcon } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Remove email from updates as it shouldn't be updated, and add updated_at
      const { ...updates } = data;
      await updateProfile({ ...updates, updated_at: new Date().toISOString() });
      toastSuccess(
        t(TranslationKey.PROFILE_UPDATED_TITLE),
        t(TranslationKey.PROFILE_UPDATED_MESSAGE)
      );
    } catch (err: unknown) {
      toastError(
        t(TranslationKey.PROFILE_UPDATE_FAILED_TITLE),
        err instanceof Error ? err.message : t(TranslationKey.PROFILE_UPDATE_FAILED_MESSAGE)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground font-medium">{t(TranslationKey.LOADING_PROFILE)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary via-background to-muted/20 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-scale-down border-4 border-accent shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center border-4 border-accent shadow-lg">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-background shadow-md">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {t(TranslationKey.MY_PROFILE)}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t(TranslationKey.MANAGE_PROFILE_INFO)}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Profile Form Card */}
        <Card className="shadow-xl border-border/50 backdrop-blur-sm bg-background/95">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              {t(TranslationKey.PROFILE_INFORMATION)}
            </CardTitle>
            <CardDescription>
              {t(TranslationKey.UPDATE_PROFILE_DESCRIPTION)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  {t(TranslationKey.NAME)}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t(TranslationKey.ENTER_NAME_PLACEHOLDER)}
                  error={errors.name?.message}
                  {...register('name')}
                  disabled={isLoading}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  containerClassName="!space-y-0"
                />
              </div>

              {/* Email Field (Disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {t(TranslationKey.EMAIL)}
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={true}
                  className="h-11 bg-muted/50 cursor-not-allowed opacity-70"
                  containerClassName="!space-y-0"
                />
                <p className="text-xs text-muted-foreground">
                  {t(TranslationKey.EMAIL_CANNOT_BE_CHANGED)}
                </p>
              </div>

              {/* Avatar Upload Field - File upload with progress */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-accent" />
                  {t(TranslationKey.UPLOAD_AVATAR)}
                </Label>
                <Controller
                  name="avatar_url"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange('')}
                      bucket="avatars"
                      path={user?.id}
                      accept="image/*"
                      maxSize={0.1}
                      disabled={isLoading}
                      label={t(TranslationKey.UPLOAD_AVATAR)}
                      showPreview={true}
                      errors={errors.avatar_url?.message}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {t(TranslationKey.UPLOAD_AVATAR_HINT)}
                </p>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  {t(TranslationKey.BIO)}
                </Label>
                <Textarea
                  id="bio"
                  placeholder={t(TranslationKey.BIO_PLACEHOLDER)}
                  error={errors.bio?.message}
                  {...register('bio')}
                  disabled={isLoading}
                  className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-accent/20"
                  maxLength={500}
                  containerClassName="!space-y-0"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {t(TranslationKey.BIO_MAX_LENGTH)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                <Button
                  type="submit"
                  disabled={isLoading || !isDirty}
                  className="flex-1 h-11 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-primary font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t(TranslationKey.UPDATING_PROFILE)}
                    </>
                  ) : (
                    t(TranslationKey.SAVE_CHANGES)
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="mt-6 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t(TranslationKey.ACCOUNT_CREATED)}</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">{t(TranslationKey.LAST_UPDATED)}</span>
                <span className="font-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
