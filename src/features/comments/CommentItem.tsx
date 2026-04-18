import React, { useState } from 'react';
import { MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentComposer } from '@/features/comments/CommentComposer';
import { formatRelativeTime } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import { CommentItemProps } from '@/types';


export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  isAuthenticated,
  isSubmitting,
  loginRequiredLabel,
  replyLabel,
  editLabel,
  deleteLabel,
  deleteConfirmMessage,
  saveLabel,
  cancelLabel,
  replyPlaceholder,
  editPlaceholder,
  viewRepliesLabel,
  hideRepliesLabel,
  onRequireLogin,
  onReply,
  onEdit,
  onDelete,
  className,
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [editText, setEditText] = useState<string>(comment.content);

  const isOwner = Boolean(currentUserId && comment.author_id === currentUserId);
  const hasAvatar = Boolean(comment.author?.avatar_url);
  const replyCount = comment.replies.length;
  const formattedViewRepliesLabel = viewRepliesLabel.replace('{count}', String(replyCount));

  const handleReplyStart = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    setIsReplying((previous) => !previous);
  };

  const handleEditStart = () => {
    setEditText(comment.content);
    setIsEditing((previous) => !previous);
  };

  const handleReplySubmit = async () => {
    const content = replyText.trim();
    if (!content) return;

    await onReply(comment.id, content);
    setReplyText('');
    setIsReplying(false);
    setAreRepliesVisible(true);
  };

  const handleEditSubmit = async () => {
    const content = editText.trim();
    if (!content) return;

    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    if (!window.confirm(deleteConfirmMessage)) return;
    await onDelete(comment.id);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-3">
        <div className="mt-1 h-9 w-9 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold">
          {hasAvatar ? (
            <img
              src={comment.author?.avatar_url || ''}
              alt={comment.author?.name || ''}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span>{comment.author?.name?.charAt(0).toUpperCase() || '?'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">
                {comment.author?.name}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            {isEditing ? (
              <CommentComposer
                value={editText}
                onChange={setEditText}
                onSubmit={handleEditSubmit}
                isSubmitting={isSubmitting}
                placeholder={editPlaceholder}
                submitLabel={saveLabel}
                cancelLabel={cancelLabel}
                onCancel={() => {
                  setIsEditing(false);
                  setEditText(comment.content);
                }}
                className="pt-1"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
                {comment.content}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReplyStart}
                className="h-8 px-2 text-xs font-semibold text-muted-foreground"
              >
                <MessageCircle className="mr-1 h-3.5 w-3.5" />
                {isAuthenticated ? replyLabel : loginRequiredLabel}
              </Button>

              {isOwner && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEditStart}
                    className="h-8 px-2 text-xs font-semibold text-muted-foreground"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    {editLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteClick}
                    className="h-8 px-2 text-xs font-semibold text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    {deleteLabel}
                  </Button>
                </>
              )}

              {replyCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAreRepliesVisible((previous) => !previous)}
                  className="h-8 px-2 text-xs font-semibold text-accent"
                >
                  {areRepliesVisible ? hideRepliesLabel : formattedViewRepliesLabel}
                </Button>
              )}
            </div>
          )}

          {isReplying && (
            <CommentComposer
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              isSubmitting={isSubmitting}
              placeholder={replyPlaceholder}
              submitLabel={replyLabel}
              cancelLabel={cancelLabel}
              onCancel={() => {
                setIsReplying(false);
                setReplyText('');
              }}
              className="mt-2"
            />
          )}
        </div>
      </div>

      {replyCount > 0 && areRepliesVisible && (
        <div className="ml-6 border-l border-border pl-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              isSubmitting={isSubmitting}
              loginRequiredLabel={loginRequiredLabel}
              replyLabel={replyLabel}
              editLabel={editLabel}
              deleteLabel={deleteLabel}
              deleteConfirmMessage={deleteConfirmMessage}
              saveLabel={saveLabel}
              cancelLabel={cancelLabel}
              replyPlaceholder={replyPlaceholder}
              editPlaceholder={editPlaceholder}
              viewRepliesLabel={viewRepliesLabel}
              hideRepliesLabel={hideRepliesLabel}
              onRequireLogin={onRequireLogin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

