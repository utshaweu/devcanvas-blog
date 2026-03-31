import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import type { UpdatePostData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';
import { PostForm, PostFormData } from './PostForm';

export const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPost, updatePost, fetchPostById, isLoading: storeLoading } = useBlogStore();
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch the post to edit
  useEffect(() => {
    if (id) {
      fetchPostById(id).then(() => {
        setIsInitialLoading(false);
      });
    }
  }, [id, fetchPostById]);

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
            <PostForm
              onSubmit={onSubmit}
              isLoading={isSubmitting}
              defaultValues={{
                title: currentPost.title,
                content: currentPost.content,
                excerpt: currentPost.excerpt || '',
                featured_image: currentPost.featured_image || '',
                category_id: currentPost.category_id || '',
                tags: currentPost.tags?.map(tag => tag.id) || [],
                published: currentPost.published,
              }}
              onCancel={() => navigate('/dashboard')}
              submitButtonText={{
                primary: t(TranslationKey.UPDATE_POST),
                loading: t(TranslationKey.UPDATING),
              }}
              mode="edit"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
