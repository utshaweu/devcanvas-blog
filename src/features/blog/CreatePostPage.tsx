import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import type { CreatePostData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';
import { PostForm, PostFormData } from './PostForm';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/common/UnsavedChangesDialog';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPost } = useBlogStore();
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formIsDirty, setFormIsDirty] = useState(false);

  // Block ALL navigation (Link clicks, back button, navigate()) when the form
  // has unsaved changes. isLoading acts as a natural bypass while submitting.
  const { showDialog, confirmNavigation, cancelNavigation, allowNavigation } =
    useUnsavedChanges(formIsDirty && !isLoading);

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toastError(t(TranslationKey.AUTH_REQUIRED_TITLE), t(TranslationKey.MUST_BE_LOGGED_IN));
      return;
    }

    setIsLoading(true);

    try {
      const postData: CreatePostData = {
        ...data,
        author_id: user.id,
      };

      const post = await createPost(postData);

      toastSuccess(t(TranslationKey.POST_CREATED_TITLE), t(TranslationKey.POST_CREATED_MESSAGE));

      // Allow the programmatic navigate() calls below to bypass the blocker.
      allowNavigation();

      if (data.published) {
        navigate(`/blog/${post.slug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      toastError(
        t(TranslationKey.CREATE_POST_FAILED_TITLE),
        err instanceof Error ? err.message : t(TranslationKey.CREATE_POST_FAILED_MESSAGE)
      );
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
            <PostForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              onCancel={() => navigate('/dashboard')}
              onDirtyChange={setFormIsDirty}
              submitButtonText={{
                primary: t(TranslationKey.PUBLISH),
                secondary: t(TranslationKey.SAVE_AS_DRAFT),
                loading: t(TranslationKey.PUBLISHING),
              }}
              mode="create"
            />
          </CardContent>
        </Card>
      </div>

      <UnsavedChangesDialog
        open={showDialog}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
      />
    </div>
  );
};
