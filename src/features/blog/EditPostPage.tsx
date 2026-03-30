import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import type { UpdatePostData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { LoadingSpinner, LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';

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

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPost, updatePost, fetchPostById, categories, tags, fetchCategories, fetchTags, isLoading: storeLoading } = useBlogStore();
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
      category_id: '',
      tags: [],
    },
  });

  // Fetch categories and tags
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  // Fetch the post to edit
  useEffect(() => {
    if (id) {
      fetchPostById(id).then(() => {
        setIsInitialLoading(false);
      });
    }
  }, [id, fetchPostById]);

  // Populate form when post is loaded
  useEffect(() => {
    if (currentPost && !isInitialLoading) {
      reset({
        title: currentPost.title,
        content: currentPost.content,
        excerpt: currentPost.excerpt || '',
        featured_image: currentPost.featured_image || '',
        category_id: currentPost.category_id || '',
        tags: currentPost.tags?.map(tag => tag.id) || [],
        published: currentPost.published,
      });
    }
  }, [currentPost, isInitialLoading, reset]);

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toastError(t(TranslationKey.AUTH_REQUIRED_TITLE), t(TranslationKey.MUST_BE_LOGGED_IN));
      return;
    }

    if (!id) {
      toastError(t(TranslationKey.UPDATE_POST_FAILED_TITLE), 'Post ID is missing');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: UpdatePostData = {
        id,
        ...data,
      };
      
      await updatePost(postData);

      toastSuccess(t(TranslationKey.POST_UPDATED_TITLE), t(TranslationKey.POST_UPDATED_MESSAGE));
      
      navigate('/dashboard');
    } catch (err: unknown) {
      console.log(err);
      toastError(
        t(TranslationKey.UPDATE_POST_FAILED_TITLE),
        err instanceof Error ? err.message : t(TranslationKey.UPDATE_POST_FAILED_MESSAGE)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading || storeLoading) {
    return <LoadingOverlay message={t(TranslationKey.LOADING_POST)} />;
  }

  if (!currentPost) {
    return (
      <div className="container-custom py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{t(TranslationKey.POST_NOT_FOUND)}</h1>
          <Button onClick={() => navigate('/dashboard')}>
            {t(TranslationKey.BACK_TO_BLOG)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t(TranslationKey.EDIT_POST_TITLE)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t(TranslationKey.TITLE)}</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={t(TranslationKey.ENTER_TITLE_PLACEHOLDER)}
                  {...register('title')}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      editable={!isSubmitting}
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
                  variant="default"
                  disabled={isSubmitting}
                  onClick={() => {
                    setValue('published', true, { shouldDirty: true, shouldValidate: true });
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t(TranslationKey.UPDATING)}
                    </>
                  ) : (
                    t(TranslationKey.UPDATE_POST)
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSubmitting}
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
