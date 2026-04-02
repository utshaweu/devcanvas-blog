import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { PostFormProps } from '@/types';

// validation schema
const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().optional(),
  featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
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
}) => {
  const { categories, tags, fetchCategories, fetchTags } = useBlogStore();
  const { t } = useTranslation();

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
    defaultValues: {
      published: false,
      category_id: '',
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        {mode === 'create' && submitButtonText.secondary && (
          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={() => {
              setValue('published', false, { shouldDirty: true, shouldValidate: true });
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
        )}

        {mode === 'edit' && !defaultValues?.published && (
          <Button 
            type="submit"
            disabled={isLoading}
            onClick={() => {
              setValue('published', true, { shouldDirty: true, shouldValidate: true });
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
            setValue('published', defaultValues?.published ?? true, { shouldDirty: true, shouldValidate: true });
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
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t(TranslationKey.CANCEL)}
        </Button>
      </div>
    </form>
  );
};
