import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { BlogPost, CreatePostData, UpdatePostData, PaginatedResponse } from '@/types';

interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<void>;
  createPost: (data: CreatePostData) => Promise<BlogPost>;
  updatePost: (data: UpdatePostData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  fetchPosts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `, { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const posts = data?.map((post: any) => ({
        ...post,
        tags: post.tags?.map((t: any) => t.tag) || [],
      })) || [];

      set({
        posts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch posts',
        isLoading: false,
      });
    }
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const post = {
        ...data,
        tags: data.tags?.map((t: any) => t.tag) || [],
      };

      set({
        currentPost: post,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch post',
        isLoading: false,
      });
    }
  },

  fetchPostBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      const post = {
        ...data,
        tags: data.tags?.map((t: any) => t.tag) || [],
      };

      set({
        currentPost: post,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch post',
        isLoading: false,
      });
    }
  },

  createPost: async (postData: CreatePostData) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          slug: postData.title.toLowerCase().replace(/\s+/g, '-'),
        })
        .select()
        .single();

      if (error) throw error;

      // Handle tags if provided
      if (postData.tags && postData.tags.length > 0) {
        const tagInserts = postData.tags.map(tagId => ({
          post_id: data.id,
          tag_id: tagId,
        }));

        await supabase.from('post_tags').insert(tagInserts);
      }

      set({ isLoading: false });
      return data;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create post',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePost: async (postData: UpdatePostData) => {
    set({ isLoading: true, error: null });

    try {
      const { id, ...updates } = postData;
      
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update tags if provided
      if (postData.tags) {
        await supabase.from('post_tags').delete().eq('post_id', id);
        
        const tagInserts = postData.tags.map(tagId => ({
          post_id: id,
          tag_id: tagId,
        }));

        await supabase.from('post_tags').insert(tagInserts);
      }

      // Refresh current post if it's the one being updated
      const { currentPost } = get();
      if (currentPost?.id === id) {
        await get().fetchPostById(id);
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update post',
        isLoading: false,
      });
      throw error;
    }
  },

  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        posts: state.posts.filter(post => post.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete post',
        isLoading: false,
      });
      throw error;
    }
  },

  incrementViews: async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_post_views', { post_id: id });
      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to increment views:', error);
    }
  },

  toggleLike: async (id: string) => {
    try {
      const { error } = await supabase.rpc('toggle_post_like', { post_id: id });
      if (error) throw error;

      // Refresh current post to get updated like count
      const { currentPost } = get();
      if (currentPost?.id === id) {
        await get().fetchPostById(id);
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
