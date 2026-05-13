import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { BlogPost, Tag } from '@/types';

const mapBookmarkPost = (post: unknown): BlogPost => {
  const p = post as Record<string, unknown>;
  return {
    ...p,
    content: typeof p.content === 'string' ? p.content : '',
    comments: typeof p.comments === 'number' ? p.comments : 0,
    tags: Array.isArray(p.tags)
      ? p.tags.map((t: unknown) => (t as Record<string, unknown>).tag as Tag)
      : [],
  } as BlogPost;
};

const POST_SELECT = `
  id,
  title,
  slug,
  content,
  excerpt,
  featured_image,
  author_id,
  published,
  published_at,
  views,
  likes,
  comments,
  created_at,
  updated_at,
  author:users(id, name, avatar_url),
  category:categories(id, name, slug, description, post_count, created_at),
  tags:post_tags(tag:tags(id, name, slug, post_count, created_at))
` as const;

interface BookmarkState {
  bookmarkedPostIds: string[];
  bookmarkedPosts: BlogPost[];
  isLoading: boolean;
  togglingPostIds: string[];
  hasFetchedIds: boolean;

  fetchBookmarkedIds: (userId: string) => Promise<void>;
  fetchBookmarks: (userId: string) => Promise<void>;
  toggleBookmark: (postId: string, userId: string) => Promise<void>;
  isBookmarked: (postId: string) => boolean;
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedPostIds: [],
  bookmarkedPosts: [],
  isLoading: false,
  togglingPostIds: [],
  hasFetchedIds: false,

  fetchBookmarkedIds: async (userId: string) => {
    if (get().hasFetchedIds) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', userId);

      if (error) throw error;

      set({
        bookmarkedPostIds: (data ?? []).map((b) => b.post_id as string),
        hasFetchedIds: true,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch bookmark IDs:', error);
    }
  },

  fetchBookmarks: async (userId: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`id, post_id, post:posts(${POST_SELECT})`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts = (data ?? [])
        .map((b) => b.post)
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map(mapBookmarkPost);

      set({
        bookmarkedPosts: posts,
        bookmarkedPostIds: posts.map((p) => p.id),
        hasFetchedIds: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch bookmarks:', error);
      set({ isLoading: false });
    }
  },

  toggleBookmark: async (postId: string, userId: string) => {
    const isCurrentlyBookmarked = get().bookmarkedPostIds.includes(postId);

    // Optimistic update
    set((state) => ({
      bookmarkedPostIds: isCurrentlyBookmarked
        ? state.bookmarkedPostIds.filter((id) => id !== postId)
        : [...state.bookmarkedPostIds, postId],
      bookmarkedPosts: isCurrentlyBookmarked
        ? state.bookmarkedPosts.filter((p) => p.id !== postId)
        : state.bookmarkedPosts,
      togglingPostIds: [...state.togglingPostIds, postId],
    }));

    try {
      if (isCurrentlyBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: userId, post_id: postId });

        if (error) throw error;
      }
    } catch (error: unknown) {
      // Roll back optimistic update
      set((state) => ({
        bookmarkedPostIds: isCurrentlyBookmarked
          ? [...state.bookmarkedPostIds, postId]
          : state.bookmarkedPostIds.filter((id) => id !== postId),
        bookmarkedPosts: isCurrentlyBookmarked
          ? state.bookmarkedPosts
          : state.bookmarkedPosts.filter((p) => p.id !== postId),
      }));
      console.error('Failed to toggle bookmark:', error);
      throw error;
    } finally {
      set((state) => ({
        togglingPostIds: state.togglingPostIds.filter((id) => id !== postId),
      }));
    }
  },

  isBookmarked: (postId: string) => get().bookmarkedPostIds.includes(postId),

  clearBookmarks: () =>
    set({ bookmarkedPostIds: [], bookmarkedPosts: [], togglingPostIds: [], hasFetchedIds: false }),
}));
