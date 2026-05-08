import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { cn } from '@/utils/helpers';
import { LoadingSpinner } from './LoadingSpinner';
import { AuthorHoverCardProps } from '@/types';


export const AuthorHoverCard: React.FC<AuthorHoverCardProps> = ({
  authorName,
  authorAvatarUrl,
  authorInitial,
  totalPosts,
  isLoading,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 bottom-full z-20 mb-2 w-56 rounded-xl border border-border/70 bg-gradient-to-br from-slate-50 via-background to-blue-50/60 p-3 opacity-0 -translate-y-1 scale-95 backdrop-blur-sm transition-all duration-300 ease-out group-hover/author:opacity-100 group-hover/author:translate-y-0 group-hover/author:scale-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {authorAvatarUrl ? (
          <img
            src={authorAvatarUrl}
            alt={authorName ?? ''}
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
            {authorInitial}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{authorName}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t(TranslationKey.STATS_TOTAL_POSTS)}
          </p>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {isLoading ? <LoadingSpinner size="sm" /> : totalPosts ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
};
