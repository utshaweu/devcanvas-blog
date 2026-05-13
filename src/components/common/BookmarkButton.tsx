import React, { useCallback } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { cn } from '@/utils/helpers';
import { BookmarkButtonProps } from '@/types';

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ postId, className }) => {
  const { isAuthenticated, user } = useAuth();
  const { isBookmarked, toggleBookmark, togglingPostIds } = useBookmarkStore();
  const { warning: toastWarning, success: toastSuccess, error: toastError } = useGlobalToast();
  const { t } = useTranslation();

  const bookmarked = isBookmarked(postId);
  const isToggling = togglingPostIds.includes(postId);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated || !user?.id) {
        toastWarning(
          t(TranslationKey.LOGIN_REQUIRED_TO_BOOKMARK),
          t(TranslationKey.LOGIN_REQUIRED_TO_BOOKMARK_MESSAGE)
        );
        return;
      }

      try {
        await toggleBookmark(postId, user.id);
        toastSuccess(
          bookmarked ? t(TranslationKey.BOOKMARK_REMOVED) : t(TranslationKey.BOOKMARK_ADDED),
          bookmarked ? t(TranslationKey.BOOKMARK_REMOVED_MESSAGE) : t(TranslationKey.BOOKMARK_ADDED_MESSAGE)
        );
      } catch {
        toastError(t(TranslationKey.UNKNOWN_ERROR));
      }
    },
    [isAuthenticated, user?.id, bookmarked, postId, toggleBookmark, toastWarning, toastSuccess, toastError, t]
  );

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        'flex items-center gap-1 transition-colors',
        bookmarked ? 'text-accent' : 'hover:text-accent',
        className
      )}
      aria-label={bookmarked ? t(TranslationKey.REMOVE_BOOKMARK) : t(TranslationKey.BOOKMARK_POST)}
      title={bookmarked ? t(TranslationKey.REMOVE_BOOKMARK) : t(TranslationKey.BOOKMARK_POST)}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 fill-accent text-accent" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
};
