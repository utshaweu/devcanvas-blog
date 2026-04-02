import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BlogPostCard } from '@/components/common/BlogPostCard';

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
                <BlogPostCard
                  post={post}
                  variant="default"
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
