import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { PenSquare, FileText, Eye, Heart } from 'lucide-react';
import { useBlogStore } from '@/stores/blogStore';
import { useGlobalToast } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/common/StatCard';
import { BlogPostCard } from '@/components/common/BlogPostCard';
import { cn } from '@/utils/helpers';
import type { BlogPost } from '@/types';

type FilterType = 'all' | 'published' | 'draft';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { posts, isLoading, fetchUserPosts, fetchUserPostsStats, deletePost } = useBlogStore();
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

  // Fetch all posts for stats (only once)
  useEffect(() => {
    if (user?.id) {
      fetchUserPostsStats(user.id).then((allPosts) => {
        setAllPostsStats({
          totalPosts: allPosts.length,
          publishedPosts: allPosts.filter(p => p.published).length,
          draftPosts: allPosts.filter(p => !p.published).length,
          totalViews: allPosts.reduce((sum, p) => sum + p.views, 0),
          totalLikes: allPosts.reduce((sum, p) => sum + p.likes, 0),
        });
      });
    }
  }, [user?.id, fetchUserPostsStats]);

  // Fetch filtered posts when filter changes
  useEffect(() => {
    if (user?.id) {
      fetchUserPosts(user.id, filter);
    }
  }, [user?.id, filter, fetchUserPosts]);

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(t(TranslationKey.DELETE_POST_CONFIRM))) {
      return;
    }

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      toastSuccess(t(TranslationKey.POST_DELETED_SUCCESS), t(TranslationKey.POST_DELETED_MESSAGE));
      // Refresh both stats and filtered list
      if (user?.id) {
        fetchUserPostsStats(user.id).then((allPosts) => {
          setAllPostsStats({
            totalPosts: allPosts.length,
            publishedPosts: allPosts.filter(p => p.published).length,
            draftPosts: allPosts.filter(p => !p.published).length,
            totalViews: allPosts.reduce((sum, p) => sum + p.views, 0),
            totalLikes: allPosts.reduce((sum, p) => sum + p.likes, 0),
          });
        });
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

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{t(TranslationKey.DASHBOARD)}</h1>
            <p className="text-muted-foreground mt-2">{t(TranslationKey.WELCOME_BACK)}, {user?.name}!</p>
          </div>
          <Button onClick={() => navigate('/create')}>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t(TranslationKey.MY_POSTS)}</CardTitle>
                <CardDescription>{t(TranslationKey.MY_POSTS_DESCRIPTION)}</CardDescription>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={cn(
                    "transition-all",
                    filter === 'all'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(TranslationKey.ALL)} ({allPostsStats.totalPosts})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('published')}
                  className={cn(
                    "transition-all",
                    filter === 'published'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(TranslationKey.PUBLISHED)} ({allPostsStats.publishedPosts})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter('draft')}
                  className={cn(
                    "transition-all",
                    filter === 'draft'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(TranslationKey.DRAFT)} ({allPostsStats.draftPosts})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  {filter === 'all' && t(TranslationKey.NO_POSTS_YET)}
                  {filter === 'published' && t(TranslationKey.NO_PUBLISHED_POSTS)}
                  {filter === 'draft' && t(TranslationKey.NO_DRAFT_POSTS)}
                </p>
                <Button className="mt-4" onClick={() => navigate('/create')}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  {t(TranslationKey.CREATE_YOUR_FIRST_POST)}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <BlogPostCard
                      post={post}
                      variant="dashboard"
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isDeleting={deletingId === post.id}
                    />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
