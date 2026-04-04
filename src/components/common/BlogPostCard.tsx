import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Edit, Trash2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import type { BlogPostCardProps } from '@/types';

export const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  variant = 'default',
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const isDashboard = variant === 'dashboard';

  const visibleTags = post.tags?.slice(0, 3) ?? [];
  const remainingTags = Math.max((post.tags?.length ?? 0) - visibleTags.length, 0);

  return (
    <Card className="group h-full cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <div className="space-y-2">
          <div className="relative mb-2">
            <img
              src={post.featured_image || DEFAULT_FEATURED_IMAGE}
              alt={post.title}
              className="h-48 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {post.category?.name && (
              <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md backdrop-blur-sm">
                {post.category.name}
              </span>
            )}
            {visibleTags.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 right-3 flex max-w-[80%] flex-wrap justify-end gap-1 opacity-100 translate-y-0 transition-all duration-300 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                {visibleTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
                  >
                    {tag.name}
                  </span>
                ))}
                {remainingTags > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                    +{remainingTags}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl line-clamp-2 flex-1 hover:text-accent transition-colors">
              {post.title}
            </CardTitle>
          </div>
          {post.excerpt && (
            <CardDescription className="text-sm line-clamp-2">
              {post.excerpt}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Status Badge and Date - Dashboard only */}
          {isDashboard && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${
                post.published 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              }`}>
                {post.published ? t(TranslationKey.PUBLISHED) : t(TranslationKey.DRAFT)}
              </span>
              <span className="text-muted-foreground">
                {formatRelativeTime(post.published_at || post.created_at)} • {formatDate(post.published_at || post.created_at)}
              </span>
            </div>
          )}

          {/* Author and Date - Default view */}
          {!isDashboard && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{post.author?.name}</span>
              <span>•</span>
              <span>
                {formatRelativeTime(post.published_at || post.created_at)} • {formatDate(post.published_at || post.created_at)}
              </span>
            </div>
          )}

          {/* Views and Likes */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.likes}
            </span>
          </div>
        </div>

        {/* Action Buttons - Dashboard only */}
        {isDashboard && onEdit && onDelete && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                onEdit(post);
              }}
            >
              <Edit className="mr-1 h-3 w-3" />
              {t(TranslationKey.EDIT)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={(e) => {
                e.preventDefault();
                onDelete(post);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Trash2 className="mr-1 h-3 w-3" />
                  {t(TranslationKey.DELETE)}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
