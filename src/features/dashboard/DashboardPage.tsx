import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, FileText, Eye, Heart } from 'lucide-react';
import { useBlogStore } from '@/stores/blogStore';
import { useGlobalToast } from '@/contexts/ToastContext';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/common/StatCard';
import { LoadMoreButton } from '@/components/common/LoadMoreButton';
import { VirtualizedGrid } from '@/components/common/VirtualizedGrid';
import { cn } from '@/utils/helpers';
import type { BlogPost } from '@/types';

type FilterType = 'all' | 'published' | 'draft';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { posts, isLoading, pagination, fetchUserPosts, fetchUserPostsStats, deletePost, loadMoreUserPosts, resetPagination } = useBlogStore();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [allPostsStats, setAllPostsStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  // Helper function to calculate stats from posts
  const calculateStats = (posts: BlogPost[]) => {
    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.published).length,
      draftPosts: posts.filter(p => !p.published).length,
      totalViews: posts.reduce((sum, p) => sum + p.views, 0),
      totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
    };
  };

  // Helper function to refresh stats
  const refreshStats = async () => {
    if (user?.id) {
      const allPosts = await fetchUserPostsStats(user.id);
      setAllPostsStats(calculateStats(allPosts));
    }
  };

  // Fetch all posts for stats (only once)
  useEffect(() => {
    refreshStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch filtered posts when filter changes
  useEffect(() => {
    if (user?.id) {
      resetPagination();
      fetchUserPosts(user.id, filter);
    }
  }, [user?.id, filter, fetchUserPosts, resetPagination]);

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(t(TranslationKey.DELETE_POST_CONFIRM))) {
      return;
    }

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      toastSuccess(t(TranslationKey.POST_DELETED_SUCCESS), t(TranslationKey.POST_DELETED_MESSAGE));
      // Refresh both stats and filtered list
      await refreshStats();
      if (user?.id) {
        resetPagination();
        fetchUserPosts(user.id, filter);
      }
    } catch (error) {
      toastError(
        t(TranslationKey.POST_DELETE_FAILED),
        error instanceof Error ? error.message : t(TranslationKey.UNKNOWN_ERROR)
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (post: BlogPost) => {
    navigate(`/edit/${post.id}`);
  };

  const handleLoadMore = () => {
    if (user?.id) {
      loadMoreUserPosts(user.id, filter);
    }
  };

  // Helper function for filter button classes
  const getFilterButtonClass = (filterType: FilterType) => {
    return cn(
      "transition-all",
      filter === filterType
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700'
        : 'text-muted-foreground hover:text-foreground'
    );
  };

  // Helper function to get empty state message
  const getEmptyStateMessage = () => {
    if (filter === 'all') return t(TranslationKey.NO_POSTS_YET);
    if (filter === 'published') return t(TranslationKey.NO_PUBLISHED_POSTS);
    return t(TranslationKey.NO_DRAFT_POSTS);
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{t(TranslationKey.DASHBOARD)}</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t(TranslationKey.WELCOME_BACK)}, {user?.name}!</p>
          </div>
          <Button onClick={() => navigate('/create')} className="w-full sm:w-auto">
            <PenSquare className="mr-2 h-4 w-4" />
            {t(TranslationKey.CREATE_POST)}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t(TranslationKey.STATS_TOTAL_POSTS)}
            value={allPostsStats.totalPosts}
            description={`${allPostsStats.publishedPosts} published, ${allPostsStats.draftPosts} drafts`}
            icon={FileText}
          />

          <StatCard
            title={t(TranslationKey.STATS_PUBLISHED)}
            value={allPostsStats.publishedPosts}
            description={t(TranslationKey.STATS_LIVE_ON_BLOG)}
            icon={FileText}
          />

          <StatCard
            title={t(TranslationKey.STATS_TOTAL_VIEWS)}
            value={allPostsStats.totalViews}
            description={t(TranslationKey.STATS_ACROSS_ALL_POSTS)}
            icon={Eye}
          />

          <StatCard
            title={t(TranslationKey.STATS_TOTAL_LIKES)}
            value={allPostsStats.totalLikes}
            description={t(TranslationKey.STATS_FROM_YOUR_READERS)}
            icon={Heart}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t(TranslationKey.MY_POSTS)}</CardTitle>
                <CardDescription>{t(TranslationKey.MY_POSTS_DESCRIPTION)}</CardDescription>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex w-full items-center gap-2 overflow-x-auto rounded-lg bg-muted/50 p-1 sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={getFilterButtonClass('all')}
                >
                  {t(TranslationKey.ALL)} ({allPostsStats.totalPosts})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('published')}
                  className={getFilterButtonClass('published')}
                >
                  {t(TranslationKey.PUBLISHED)} ({allPostsStats.publishedPosts})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('draft')}
                  className={getFilterButtonClass('draft')}
                >
                  {t(TranslationKey.DRAFT)} ({allPostsStats.draftPosts})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{getEmptyStateMessage()}</p>
                <Button className="mt-4" onClick={() => navigate('/create')}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  {t(TranslationKey.CREATE_YOUR_FIRST_POST)}
                </Button>
              </div>
            ) : (
              <>
                <VirtualizedGrid
                  items={posts}
                  getItemKey={(post) => post.id}
                  renderItem={(post) => (
                    <Link to={`/blog/${post.slug}`}>
                      <BlogPostCard
                        post={post}
                        variant="dashboard"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deletingId === post.id}
                      />
                    </Link>
                  )}
                />

                <LoadMoreButton
                  isLoading={isLoading && posts.length > 0}
                  hasMore={pagination.page < pagination.totalPages}
                  onLoadMore={handleLoadMore}
                  currentCount={posts.length}
                  totalCount={pagination.total}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
