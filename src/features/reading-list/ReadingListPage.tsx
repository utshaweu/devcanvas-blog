import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';

export const ReadingListPage: React.FC = () => {
  const { user } = useAuth();
  const { bookmarkedPosts, isLoading, fetchBookmarks } = useBookmarkStore();
  const { t } = useTranslation();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchBookmarks(user.id);
    }
  }, [user?.id, fetchBookmarks]);

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
        <div>
          <h1 className="text-3xl font-bold">{t(TranslationKey.READING_LIST)}</h1>
          <p className="text-muted-foreground mt-1">{t(TranslationKey.READING_LIST_DESCRIPTION)}</p>
        </div>

        {bookmarkedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <Bookmark className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t(TranslationKey.READING_LIST_EMPTY)}</h2>
            <p className="text-muted-foreground max-w-sm">
              {t(TranslationKey.READING_LIST_EMPTY_DESCRIPTION)}
            </p>
            <Button asChild>
              <Link to="/blog">{t(TranslationKey.BACK_TO_BLOG)}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <BlogPostCard post={post} variant="default" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
