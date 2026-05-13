import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn, formatDate, formatRelativeTime, DEFAULT_FEATURED_IMAGE, calculateReadingTime } from '@/utils/helpers';
import { Eye, Heart, ArrowLeft, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/ToastContext';
import { CommentsSection } from '../comments/CommentsSection';
import { ReadingProgressBar } from '@/components/common/ReadingProgressBar';
import { BookmarkButton } from '@/components/common/BookmarkButton';
import { useBookmarkStore } from '@/stores/bookmarkStore';

const CONTENT_PREVIEW_MAX_HEIGHT = 620;
const CONTENT_PREVIEW_FADE_HEIGHT = 340;

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { fetchBookmarkedIds } = useBookmarkStore();
  const { warning: toastWarning } = useGlobalToast();
  const { currentPost, isLoading, fetchPostBySlug, incrementViews, toggleLike } = useBlogStore();
  const viewCountedRef = useRef<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [shouldShowSeeMore, setShouldShowSeeMore] = useState(false);
  const authorName = currentPost?.author?.name;
  const authorAvatarUrl = currentPost?.author?.avatar_url;
  const authorInitial = authorName?.charAt(0).toUpperCase();

  const handleFeaturedImageError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_FEATURED_IMAGE;
  };

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
    setIsContentExpanded(false);
  }, [currentPost?.id]);

  useEffect(() => {
    const contentElement = contentRef.current;

    if (!contentElement) {
      setShouldShowSeeMore(false);
      return;
    }

    const checkOverflow = () => {
      setShouldShowSeeMore(contentElement.scrollHeight > CONTENT_PREVIEW_MAX_HEIGHT + 8);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [currentPost?.id]);

  useEffect(() => {
    // Only increment views once per post ID, and only when post is loaded
    if (currentPost && currentPost.id !== viewCountedRef.current) {
      viewCountedRef.current = currentPost.id;
      incrementViews(currentPost.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPost?.id, incrementViews]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBookmarkedIds(user.id);
    }
  }, [isAuthenticated, user?.id, fetchBookmarkedIds]);

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
      <ReadingProgressBar />
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t(TranslationKey.BACK_TO_BLOG)}
        </Button>

        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{currentPost.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={authorName ?? ''}
                  className="h-10 w-10 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-medium text-accent-foreground">
                  {authorInitial}
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{authorName}</p>
                <p className="text-sm">{formatRelativeTime(currentPost.published_at || currentPost.created_at)} • {formatDate(currentPost.published_at || currentPost.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {currentPost.views} {t(TranslationKey.VIEWS)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {calculateReadingTime(currentPost.content)} min read
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
            <BookmarkButton postId={currentPost.id} />
          </div>

          {currentPost.excerpt && (
            <p className="text-lg leading-relaxed text-primary-foreground font-medium">{currentPost.excerpt}</p>
          )}

          <img
            src={currentPost.featured_image || DEFAULT_FEATURED_IMAGE}
            alt={currentPost.title}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={handleFeaturedImageError}
            className="w-full h-auto object-cover rounded-lg"
          />
        </header>

        <div className="relative">
          <div
            ref={contentRef}
            className={cn(
              'prose prose-slate dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-hr:border-border max-w-none',
              !isContentExpanded && 'overflow-hidden'
            )}
            style={!isContentExpanded ? { maxHeight: `${CONTENT_PREVIEW_MAX_HEIGHT}px` } : undefined}
            dangerouslySetInnerHTML={{ __html: currentPost.content }}
          />

          {!isContentExpanded && shouldShowSeeMore && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent"
                style={{ height: `${CONTENT_PREVIEW_FADE_HEIGHT}px` }}
              />
              <div className="absolute inset-x-0 bottom-6 flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setIsContentExpanded(true)}
                  className="h-auto bg-transparent px-2 py-1 text-base font-semibold shadow-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    {t(TranslationKey.SEE_MORE)}
                  </span>
                </Button>
              </div>
            </>
          )}
        </div>

        <CommentsSection postId={currentPost.id} />
      </div>
    </article>
  );
};
