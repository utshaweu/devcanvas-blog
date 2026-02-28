import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import type { CreatePostData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { generateSlug } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().optional(),
  featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category_id: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  published: z.boolean(),
});

type PostFormData = z.infer<typeof postSchema>;

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPost, categories, tags, fetchCategories, fetchTags } = useBlogStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
      category_id: '',
      tags: [],
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      setError(t(TranslationKey.MUST_BE_LOGGED_IN));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const postData: CreatePostData = {
        ...data,
        author_id: user.id,
      };
      
      const post = await createPost(postData);
      
      navigate(`/blog/${generateSlug(post.title)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t(TranslationKey.CREATE_NEW_POST)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">{t(TranslationKey.TITLE)}</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t(TranslationKey.ENTER_TITLE_PLACEHOLDER)}
                  {...register('title')}
                  disabled={isLoading}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">{t(TranslationKey.EXCERPT)}</Label>
                <Input
                  id="excerpt"
                  type="text"
                  placeholder={t(TranslationKey.EXCERPT_PLACEHOLDER)}
                  {...register('excerpt')}
                  disabled={isLoading}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image">{t(TranslationKey.FEATURED_IMAGE_URL)}</Label>
                <Input
                  id="featured_image"
                  type="url"
                  placeholder={t(TranslationKey.FEATURED_IMAGE_PLACEHOLDER)}
                  {...register('featured_image')}
                  disabled={isLoading}
                />
                {errors.featured_image && (
                  <p className="text-sm text-destructive">{errors.featured_image.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t(TranslationKey.CATEGORY)}
                      options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t(TranslationKey.SELECT_CATEGORY)}
                      error={errors.category_id?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label={t(TranslationKey.TAGS)}
                      options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t(TranslationKey.SELECT_TAGS)}
                      error={errors.tags?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t(TranslationKey.CONTENT)}</Label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      editable={!isLoading}
                    />
                  )}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      const publishInput = form.querySelector('input[name="published"]') as HTMLInputElement;
                      if (publishInput) publishInput.value = 'false';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t(TranslationKey.SAVE_AS_DRAFT)}
                    </>
                  ) : (
                    t(TranslationKey.SAVE_AS_DRAFT)
                  )}
                </Button>

                <Button 
                  type="submit" 
                  variant="default"
                  disabled={isLoading}
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (form) {
                      const publishInput = form.querySelector('input[name="published"]') as HTMLInputElement;
                      if (publishInput) publishInput.value = 'true';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t(TranslationKey.PUBLISHING)}
                    </>
                  ) : (
                    t(TranslationKey.PUBLISH)
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                >
                  {t(TranslationKey.CANCEL)}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
