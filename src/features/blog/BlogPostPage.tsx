import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE } from '@/utils/helpers';
import { Eye, Heart, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { CommentsSection } from '../comments/CommentsSection';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { warning: toastWarning } = useGlobalToast();
  const { currentPost, isLoading, fetchPostBySlug, incrementViews, toggleLike } = useBlogStore();
  const viewCountedRef = useRef<string | null>(null);

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      toastWarning(
        t(TranslationKey.LOGIN_REQUIRED_TO_LIKE),
        t(TranslationKey.LOGIN_REQUIRED_TO_LIKE_MESSAGE)
      );
      return;
    }
    toggleLike(currentPost!.id);
  };

  useEffect(() => {
    if (slug) {
      fetchPostBySlug(slug);
    }
  }, [slug, fetchPostBySlug]);

  useEffect(() => {
    // Only increment views once per post ID, and only when post is loaded
    if (currentPost && currentPost.id !== viewCountedRef.current) {
      viewCountedRef.current = currentPost.id;
      incrementViews(currentPost.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost?.id, incrementViews]);

  if (isLoading) {
    return (
      <div className="container-custom py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="container-custom py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{t(TranslationKey.POST_NOT_FOUND)}</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t(TranslationKey.BACK_TO_BLOG)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t(TranslationKey.BACK_TO_BLOG)}
        </Button>

        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{currentPost.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                {currentPost.author?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{currentPost.author?.name}</p>
                <p className="text-sm">{formatRelativeTime(currentPost.published_at || currentPost.created_at)} • {formatDate(currentPost.published_at || currentPost.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {currentPost.views} {t(TranslationKey.VIEWS)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeClick}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              {currentPost.likes}
            </Button>
          </div>

          <img
            src={currentPost.featured_image || DEFAULT_FEATURED_IMAGE}
            alt={currentPost.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </header>

        <div 
          className="prose prose-slate dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-hr:border-border max-w-none"
          dangerouslySetInnerHTML={{ __html: currentPost.content }}
        />

        <CommentsSection postId={currentPost.id} />
      </div>
    </article>
  );
};
