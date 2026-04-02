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
import type { BlogPost } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { posts, isLoading, fetchUserPosts, deletePost } = useBlogStore();
  const { success: toastSuccess, error: toastError } = useGlobalToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts(user.id);
    }
  }, [user?.id, fetchUserPosts]);

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length,
    draftPosts: posts.filter(p => !p.published).length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(t(TranslationKey.DELETE_POST_CONFIRM))) {
      return;
    }

    setDeletingId(post.id);
    try {
      await deletePost(post.id);
      toastSuccess(t(TranslationKey.POST_DELETED_SUCCESS), t(TranslationKey.POST_DELETED_MESSAGE));
      // Refresh the list
      if (user?.id) {
        fetchUserPosts(user.id);
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
            value={stats.totalPosts}
            description={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
            icon={FileText}
          />

          <StatCard
            title={t(TranslationKey.STATS_PUBLISHED)}
            value={stats.publishedPosts}
            description={t(TranslationKey.STATS_LIVE_ON_BLOG)}
            icon={FileText}
          />

          <StatCard
            title={t(TranslationKey.STATS_TOTAL_VIEWS)}
            value={stats.totalViews}
            description={t(TranslationKey.STATS_ACROSS_ALL_POSTS)}
            icon={Eye}
          />

          <StatCard
            title={t(TranslationKey.STATS_TOTAL_LIKES)}
            value={stats.totalLikes}
            description={t(TranslationKey.STATS_FROM_YOUR_READERS)}
            icon={Heart}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t(TranslationKey.MY_POSTS)}</CardTitle>
            <CardDescription>{t(TranslationKey.MY_POSTS_DESCRIPTION)}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t(TranslationKey.NO_POSTS_YET)}</p>
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
