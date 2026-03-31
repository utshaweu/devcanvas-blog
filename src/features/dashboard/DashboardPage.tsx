import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { PenSquare, FileText, Eye, Heart, Edit, Trash2 } from 'lucide-react';
import { useBlogStore } from '@/stores/blogStore';
import { useGlobalToast } from '@/contexts/ToastContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE } from '@/utils/helpers';
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_POSTS)}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_PUBLISHED)}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_LIVE_ON_BLOG)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_VIEWS)}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_ACROSS_ALL_POSTS)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(TranslationKey.STATS_TOTAL_LIKES)}</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <p className="text-xs text-muted-foreground">
                {t(TranslationKey.STATS_FROM_YOUR_READERS)}
              </p>
            </CardContent>
          </Card>
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
                    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer">
                      <CardHeader>
                        <div className="space-y-2">
                          <img
                            src={post.featured_image || DEFAULT_FEATURED_IMAGE}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
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
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.preventDefault();
                              handleEdit(post);
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
                              handleDelete(post);
                            }}
                            disabled={deletingId === post.id}
                          >
                            {deletingId === post.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Trash2 className="mr-1 h-3 w-3" />
                                {t(TranslationKey.DELETE)}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
