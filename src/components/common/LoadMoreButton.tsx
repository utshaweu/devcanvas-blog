import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TranslationKey } from '@/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/helpers';
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

  // Always render the same outer shell so the layout height stays stable and
  // there is no shift when switching between "has more" and "all loaded" states.
  return (
    <div className={cn('flex flex-col items-center gap-2 py-8', className)}>
      {hasMore ? (
        <Button
          onClick={onLoadMore}
          disabled={isLoading}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
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
      ) : (
        <p className="text-sm text-muted-foreground">
          {t(TranslationKey.NO_MORE_POSTS)}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t(TranslationKey.SHOWING_POSTS_COUNT)
          .replace('{current}', String(currentCount))
          .replace('{total}', String(totalCount))}
      </p>
    </div>
  );
};
