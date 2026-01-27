import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogStore } from '@/stores/blogStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { Eye, Heart, ArrowLeft } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentPost, isLoading, fetchPostBySlug, incrementViews, toggleLike } = useBlogStore();

  useEffect(() => {
    if (slug) {
      fetchPostBySlug(slug);
    }
  }, [slug, fetchPostBySlug]);

  useEffect(() => {
    if (currentPost) {
      incrementViews(currentPost.id);
    }
  }, [currentPost?.id]);

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
          <h1 className="text-3xl font-bold">Post not found</h1>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to blog
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
                <p className="text-sm">{formatDate(currentPost.published_at || currentPost.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {currentPost.views} views
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleLike(currentPost.id)}
              className="flex items-center gap-1"
            >
              <Heart className="h-4 w-4" />
              {currentPost.likes}
            </Button>
          </div>

          {currentPost.featured_image && (
            <img
              src={currentPost.featured_image}
              alt={currentPost.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </header>

        <div 
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: currentPost.content }}
        />
      </div>
    </article>
  );
};
