import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE } from '@/utils/helpers';
import { Eye, Heart } from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const { posts, isLoading, fetchPosts } = useBlogStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{t(TranslationKey.HOME_WELCOME_TITLE)}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(TranslationKey.HOME_WELCOME_SUBTITLE)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t(TranslationKey.NO_POSTS_AVAILABLE)}</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <CardHeader>
                    <div className="space-y-2">
                      <img
                        src={post.featured_image || DEFAULT_FEATURED_IMAGE}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      <CardTitle className="text-xl hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-sm line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{post.author?.name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(post.published_at || post.created_at)} • {formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
