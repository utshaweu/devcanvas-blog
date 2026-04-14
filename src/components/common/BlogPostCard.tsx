import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Edit, Trash2 } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { Badge } from './Badge';
import { formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import type { BlogPostCardProps } from '@/types';

const BlogPostCardComponent: React.FC<BlogPostCardProps> = ({
  post,
  variant = 'default',
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslation();
  const isDashboard = variant === 'dashboard';
  const publishDate = post.published_at || post.created_at;

  const visibleTags = post.tags?.slice(0, 3) ?? [];
  const remainingTags = Math.max((post.tags?.length ?? 0) - visibleTags.length, 0);
  const formattedPublishDate = useMemo(
    () => `${formatRelativeTime(publishDate)} • ${formatDate(publishDate)}`,
    [publishDate]
  );

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
              <Badge variant="category" className="absolute top-3 left-3">
                {post.category.name}
              </Badge>
            )}
            {visibleTags.length > 0 && (
              <div className="pointer-events-none absolute bottom-3 right-3 flex max-w-[80%] flex-wrap justify-end gap-1 opacity-100 translate-y-0 transition-all duration-300 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                {visibleTags.map((tag) => (
                  <Badge key={tag.id} variant="tag" size="xs">
                    {tag.name}
                  </Badge>
                ))}
                {remainingTags > 0 && (
                  <Badge variant="tag" size="xs">
                    +{remainingTags}
                  </Badge>
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
              <Badge variant="status" published={post.published}>
                {post.published ? t(TranslationKey.PUBLISHED) : t(TranslationKey.DRAFT)}
              </Badge>
              <span className="text-muted-foreground">
                {formattedPublishDate}
              </span>
            </div>
          )}

          {/* Author and Date - Default view */}
          {!isDashboard && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{post.author?.name}</span>
              <span>•</span>
              <span>
                {formattedPublishDate}
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

BlogPostCardComponent.displayName = 'BlogPostCard';

export const BlogPostCard = React.memo(BlogPostCardComponent);
