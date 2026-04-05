import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TranslationKey } from '@/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import { LoadMoreButtonProps } from '@/types';

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  isLoading,
  hasMore,
  onLoadMore,
  currentCount,
  totalCount,
  className = '',
}) => {
  const { t } = useTranslation();

  if (!hasMore) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-muted-foreground">
          {t(TranslationKey.NO_MORE_POSTS)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t(TranslationKey.SHOWING_POSTS_COUNT)
            .replace('{current}', String(currentCount))
            .replace('{total}', String(totalCount))}
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        size="lg"
        className="min-w-[200px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {t(TranslationKey.LOADING_MORE)}
          </>
        ) : (
          t(TranslationKey.LOAD_MORE)
        )}
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        {t(TranslationKey.SHOWING_POSTS_COUNT)
          .replace('{current}', String(currentCount))
          .replace('{total}', String(totalCount))}
      </p>
    </div>
  );
};
