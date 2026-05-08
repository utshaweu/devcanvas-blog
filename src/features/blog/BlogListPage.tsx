import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LoadMoreButton } from '@/components/common/LoadMoreButton';
import { SearchBar } from '@/components/common/SearchBar';
import { VirtualizedGrid } from '@/components/common/VirtualizedGrid';
import { useDebounce } from '@/hooks/useDebounce';

export const BlogListPage: React.FC = () => {
  const { posts, isLoading, pagination, fetchPosts, loadMorePosts, resetPagination } = useBlogStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const normalizedSearchQuery = debouncedSearchQuery.trim();

  useEffect(() => {
    // Reset pagination when entering this page and clean up when leaving.
    resetPagination();

    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  useEffect(() => {
    fetchPosts(1, 9, false, normalizedSearchQuery);
  }, [fetchPosts, normalizedSearchQuery]);

  const handleLoadMore = () => {
    loadMorePosts();
  };

  const initialLoading = isLoading && posts.length === 0;
  const loadingMore = isLoading && posts.length > 0;
  const hasMore = pagination.page < pagination.totalPages;
  const searchHelperText = useMemo(() => {
    if (!normalizedSearchQuery) {
      return t(TranslationKey.SEARCH_POSTS_HELPER);
    }

    const displayQuery = normalizedSearchQuery.length > 40
      ? `${normalizedSearchQuery.slice(0, 40).trim()}...`
      : normalizedSearchQuery;

    return t(TranslationKey.SEARCH_RESULTS_SUMMARY)
      .replace('{count}', String(pagination.total))
      .replace('{query}', displayQuery);
  }, [normalizedSearchQuery, pagination.total, t]);

  if (initialLoading) {
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

        <div className="mx-auto w-full max-w-3xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder={t(TranslationKey.SEARCH_POSTS_PLACEHOLDER)}
            clearButtonLabel={t(TranslationKey.CLEAR_SEARCH)}
            helperText={searchHelperText}
          />
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {normalizedSearchQuery ? t(TranslationKey.NO_SEARCH_RESULTS) : t(TranslationKey.NO_POSTS_AVAILABLE)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <VirtualizedGrid
            items={posts}
            getItemKey={(post) => post.id}
            renderItem={(post) => (
              <Link to={`/blog/${post.slug}`}>
                <BlogPostCard post={post} variant="default" />
              </Link>
            )}
            footer={(
              <LoadMoreButton
                isLoading={loadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                currentCount={posts.length}
                totalCount={pagination.total}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};
