import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CommentComposer } from '@/features/comments/CommentComposer';
import { CommentItem } from '@/features/comments/CommentItem';
import { useCommentStore } from '@/stores/commentStore';
import type { CommentItem as CommentItemType } from '@/stores/commentStore';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { cn } from '@/utils/helpers';
import { CommentsSectionProps } from '@/types';

const countComments = (items: CommentItemType[]): number =>
  items.reduce((total, comment) => total + 1 + countComments(comment.replies), 0);

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  className,
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { warning: toastWarning, success: toastSuccess, error: toastError } = useGlobalToast();
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    resetComments,
    clearError,
  } = useCommentStore();
  const [newCommentText, setNewCommentText] = useState<string>('');

  useEffect(() => {
    fetchComments(postId);

    return () => {
      resetComments();
    };
  }, [postId, fetchComments, resetComments]);

  useEffect(() => {
    if (!error) return;
    toastError(t(TranslationKey.COMMENT_ACTION_FAILED_TITLE), error);
    clearError();
  }, [error, toastError, clearError, t]);

  const totalComments = useMemo(() => countComments(comments), [comments]);

  const notifyLoginRequired = () => {
    toastWarning(
      t(TranslationKey.LOGIN_REQUIRED_TO_COMMENT),
      t(TranslationKey.LOGIN_REQUIRED_TO_COMMENT_MESSAGE)
    );
  };

  const handleCreateComment = async () => {
    if (!isAuthenticated || !user) {
      notifyLoginRequired();
      return;
    }

    const content = newCommentText.trim();
    if (!content) return;

    try {
      await createComment(postId, user.id, content, null);
      setNewCommentText('');
      toastSuccess(
        t(TranslationKey.COMMENT_ADDED_TITLE),
        t(TranslationKey.COMMENT_ADDED_MESSAGE)
      );
    } catch {
      // error surfaced by store and error effect
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!isAuthenticated || !user) {
      notifyLoginRequired();
      return;
    }

    try {
      await createComment(postId, user.id, content, parentId);
      toastSuccess(
        t(TranslationKey.COMMENT_ADDED_TITLE),
        t(TranslationKey.COMMENT_ADDED_MESSAGE)
      );
    } catch {
      // error surfaced by store and error effect
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      toastSuccess(
        t(TranslationKey.COMMENT_UPDATED_TITLE),
        t(TranslationKey.COMMENT_UPDATED_MESSAGE)
      );
    } catch {
      // error surfaced by store and error effect
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toastSuccess(
        t(TranslationKey.COMMENT_DELETED_TITLE),
        t(TranslationKey.COMMENT_DELETED_MESSAGE)
      );
    } catch {
      // error surfaced by store and error effect
    }
  };

  return (
    <Card className={cn('border-border bg-card/95 shadow-sm', className)}>
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{t(TranslationKey.COMMENTS)}</CardTitle>
          <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">
            {totalComments}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {isAuthenticated ? (
          <CommentComposer
            value={newCommentText}
            onChange={setNewCommentText}
            onSubmit={handleCreateComment}
            isSubmitting={isSubmitting}
            placeholder={t(TranslationKey.WRITE_COMMENT_PLACEHOLDER)}
            submitLabel={t(TranslationKey.POST_COMMENT)}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {t(TranslationKey.LOGIN_REQUIRED_TO_COMMENT_MESSAGE)}
          </div>
        )}

        {isLoading ? (
          <div className="py-4 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t(TranslationKey.NO_COMMENTS_YET)}
          </p>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                isAuthenticated={isAuthenticated}
                isSubmitting={isSubmitting}
                loginRequiredLabel={t(TranslationKey.LOGIN_TO_REPLY)}
                replyLabel={t(TranslationKey.REPLY)}
                editLabel={t(TranslationKey.EDIT)}
                deleteLabel={t(TranslationKey.DELETE)}
                deleteConfirmMessage={t(TranslationKey.DELETE_COMMENT_CONFIRM)}
                saveLabel={t(TranslationKey.SAVE)}
                cancelLabel={t(TranslationKey.CANCEL)}
                replyPlaceholder={t(TranslationKey.WRITE_REPLY_PLACEHOLDER)}
                editPlaceholder={t(TranslationKey.EDIT_COMMENT_PLACEHOLDER)}
                viewRepliesLabel={t(TranslationKey.VIEW_ALL_REPLIES)}
                hideRepliesLabel={t(TranslationKey.HIDE_REPLIES)}
                onRequireLogin={notifyLoginRequired}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

