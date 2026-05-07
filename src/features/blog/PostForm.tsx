import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { PostFormProps } from '@/types';

// validation schema
const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().optional(),
  featured_image: z.string().optional().or(z.literal('')),
  category_id: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  published: z.boolean(),
});

export type PostFormData = z.infer<typeof postSchema>;

export const PostForm: React.FC<PostFormProps> = ({
  onSubmit,
  isLoading,
  defaultValues,
  onCancel,
  submitButtonText,
  mode,
  onDirtyChange,
}) => {
  const { user } = useAuth();
  const { categories, tags, fetchCategories, fetchTags } = useBlogStore();
  const { t } = useTranslation();
  const resolvedDefaultValues = useMemo<PostFormData>(() => ({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category_id: '',
    tags: [],
    published: false,
    ...defaultValues,
  }), [defaultValues]);

  // Fetch categories and tags when component mounts
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: resolvedDefaultValues,
  });

  const watchedValues = useWatch({ control });

  // Notify parent whenever the form dirty state changes
  useEffect(() => {
    const normalizeHtml = (value?: string) => {
      const trimmedValue = value?.trim() ?? '';
      return trimmedValue === '<p></p>' ? '' : trimmedValue;
    };

    const normalizeText = (value?: string) => value ?? '';
    const normalizeTags = (value?: string[]) => value ?? [];

    const hasChanges =
      normalizeText(watchedValues.title) !== resolvedDefaultValues.title ||
      normalizeHtml(watchedValues.content) !== normalizeHtml(resolvedDefaultValues.content) ||
      normalizeText(watchedValues.excerpt) !== resolvedDefaultValues.excerpt ||
      normalizeText(watchedValues.featured_image) !== resolvedDefaultValues.featured_image ||
      normalizeText(watchedValues.category_id) !== resolvedDefaultValues.category_id ||
      JSON.stringify(normalizeTags(watchedValues.tags)) !== JSON.stringify(resolvedDefaultValues.tags) ||
      (watchedValues.published ?? false) !== resolvedDefaultValues.published;

    onDirtyChange?.(hasChanges);
  }, [onDirtyChange, resolvedDefaultValues, watchedValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id="title"
        type="text"
        label={t(TranslationKey.TITLE)}
        placeholder={t(TranslationKey.ENTER_TITLE_PLACEHOLDER)}
        error={errors.title?.message}
        {...register('title')}
        disabled={isLoading}
      />

      <Input
        id="excerpt"
        type="text"
        label={t(TranslationKey.EXCERPT)}
        placeholder={t(TranslationKey.EXCERPT_PLACEHOLDER)}
        error={errors.excerpt?.message}
        {...register('excerpt')}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">{t(TranslationKey.FEATURED_IMAGE)}</Label>
        <Controller
          name="featured_image"
          control={control}
          render={({ field }) => (
            <FileUpload
              value={field.value}
              onChange={field.onChange}
              onRemove={() => field.onChange('')}
              bucket="featured-images"
              path={user?.id}
              accept="image/*"
              maxSize={0.15}
              disabled={isLoading}
              label={t(TranslationKey.FEATURED_IMAGE)}
              showPreview={true}
              errors={errors.featured_image?.message}
            />
          )}
        />
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

      <div>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              label={t(TranslationKey.CONTENT)}
              content={field.value}
              onChange={field.onChange}
              editable={!isLoading}
              error={errors.content?.message}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-4">
        {mode === 'create' && submitButtonText.secondary && (
          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={() => {
              setValue('published', false, { shouldDirty: false, shouldValidate: true });
            }}
            variant="custom"
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
        )}

        {mode === 'edit' && !defaultValues?.published && (
          <Button 
            type="submit"
            disabled={isLoading}
            onClick={() => {
              setValue('published', true, { shouldDirty: false, shouldValidate: true });
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
        )}


        <Button 
          type="submit" 
          variant="default"
          disabled={isLoading}
          onClick={() => {
            setValue('published', defaultValues?.published ?? true, { shouldDirty: false, shouldValidate: true });
          }}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {submitButtonText.loading}
            </>
          ) : (
            submitButtonText.primary
          )}
        </Button>

        <Button 
          type="button" 
          variant="destructive"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t(TranslationKey.CANCEL)}
        </Button>
      </div>
    </form>
  );
};
