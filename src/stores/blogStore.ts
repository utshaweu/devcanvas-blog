import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { BlogPost, CreatePostData, UpdatePostData, Category, Tag } from '@/types';
import { generateUniqueSlug } from '@/utils/helpers';

interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  categories: Category[];
  tags: Tag[];
  currentSearchQuery: string;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchPosts: (page?: number, limit?: number, append?: boolean, searchQuery?: string) => Promise<void>;
  fetchUserPosts: (userId: string, publishedFilter?: 'all' | 'published' | 'draft', page?: number, limit?: number, append?: boolean) => Promise<void>;
  fetchUserPostsStats: (userId: string) => Promise<BlogPost[]>;
  fetchPostById: (id: string) => Promise<void>;
  fetchPostBySlug: (slug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createPost: (data: CreatePostData) => Promise<BlogPost>;
  updatePost: (data: UpdatePostData) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  loadMoreUserPosts: (userId: string, publishedFilter?: 'all' | 'published' | 'draft') => Promise<void>;
  resetPagination: () => void;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  posts: [],
  currentPost: null,
  categories: [],
  tags: [],
  currentSearchQuery: '',
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  },

  fetchPosts: async (page = 1, limit = 9, append = false, searchQuery = '') => {
    set({ isLoading: true, error: null });

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const normalizedSearchQuery = searchQuery.trim();
      const sanitizedSearchQuery = normalizedSearchQuery
        .replace(/[,%]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `, { count: 'exact' })
        .eq('published', true);

      if (sanitizedSearchQuery) {
        const pattern = `%${sanitizedSearchQuery}%`;
        query = query.or(`title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern}`);
      }

      const { data, error, count } = await query
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const posts = (data?.map((post: unknown) => {
        const postData = post as Record<string, unknown>;
        return {
          ...postData,
          tags: Array.isArray(postData.tags) 
            ? postData.tags.map((t: unknown) => (t as Record<string, unknown>).tag) 
            : [],
        };
      }) || []) as BlogPost[];

      set(state => ({
        posts: append ? [...state.posts, ...posts] : posts,
        currentSearchQuery: normalizedSearchQuery,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts',
        isLoading: false,
      });
    }
  },

  fetchUserPosts: async (userId: string, publishedFilter: 'all' | 'published' | 'draft' = 'all', page = 1, limit = 9, append = false) => {
    set({ isLoading: true, error: null });

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `, { count: 'exact' })
        .eq('author_id', userId);

      // Apply published filter
      if (publishedFilter === 'published') {
        query = query.eq('published', true);
      } else if (publishedFilter === 'draft') {
        query = query.eq('published', false);
      }
      // If 'all', no additional filter is needed

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const posts = (data?.map((post: unknown) => {
        const postData = post as Record<string, unknown>;
        return {
          ...postData,
          tags: Array.isArray(postData.tags) 
            ? postData.tags.map((t: unknown) => (t as Record<string, unknown>).tag) 
            : [],
        };
      }) || []) as BlogPost[];

      set(state => ({
        posts: append ? [...state.posts, ...posts] : posts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user posts',
        isLoading: false,
      });
    }
  },

  fetchUserPostsStats: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(*),
          category:categories(*),
          tags:post_tags(tag:tags(*))
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts = (data?.map((post: unknown) => {
        const postData = post as Record<string, unknown>;
        return {
          ...postData,
          tags: Array.isArray(postData.tags) 
            ? postData.tags.map((t: unknown) => (t as Record<string, unknown>).tag) 
            : [],
        };
      }) || []) as BlogPost[];

      return posts;
    } catch (error: unknown) {
      console.error('Failed to fetch user posts stats:', error);
      return [];
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

      const postData = data as Record<string, unknown>;
      const post = {
        ...postData,
        tags: Array.isArray(postData.tags) 
          ? postData.tags.map((t: unknown) => (t as Record<string, unknown>).tag) 
          : [],
      } as BlogPost;

      set({
        currentPost: post,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch post',
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

      const postData = data as Record<string, unknown>;
      const post = {
        ...postData,
        tags: Array.isArray(postData.tags) 
          ? postData.tags.map((t: unknown) => (t as Record<string, unknown>).tag) 
          : [],
      } as BlogPost;

      set({
        currentPost: post,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch post',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      set({ categories: data || [] });
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchTags: async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      set({ tags: data || [] });
    } catch (error: unknown) {
      console.error('Failed to fetch tags:', error);
    }
  },

  createPost: async (postData: CreatePostData) => {
    set({ isLoading: true, error: null });

    try {
      const { tags: tagIds, ...postFields } = postData;

      // Check if slug already exists in database
      const checkSlugExists = async (slug: string): Promise<boolean> => {
        const { data, error } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', slug)
          .single();
        
        // If data is returned or there's no error, slug exists
        // If error is "not found", slug doesn't exist
        return !!data && !error;
      };

      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug(
        postData.title,
        checkSlugExists
      );

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postFields,
          slug: uniqueSlug,
          published_at: postData.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Handle tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          post_id: data.id,
          tag_id: tagId,
        }));

        const { error: postTagsError } = await supabase.from('post_tags').insert(tagInserts);
        if (postTagsError) throw postTagsError;
      }

      set({ isLoading: false });
      return data;
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create post',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePost: async (postData: UpdatePostData) => {
    set({ isLoading: true, error: null });

    try {
      const { id, tags: tagIds, ...updates } = postData;
      
      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update tags if provided
      if (tagIds) {
        await supabase.from('post_tags').delete().eq('post_id', id);
        
        const tagInserts = tagIds.map(tagId => ({
          post_id: id,
          tag_id: tagId,
        }));

        const { error: postTagsError } = await supabase.from('post_tags').insert(tagInserts);
        if (postTagsError) throw postTagsError;
      }

      // Refresh current post if it's the one being updated
      const { currentPost } = get();
      if (currentPost?.id === id) {
        await get().fetchPostById(id);
      }

      set({ isLoading: false });
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update post',
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
    } catch (error: unknown) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete post',
        isLoading: false,
      });
      throw error;
    }
  },

  incrementViews: async (id: string) => {
    try {
      const { error } = await supabase.rpc('increment_post_views', { p_post_id: id });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Failed to increment views:', error);
    }
  },

  toggleLike: async (id: string) => {
    try {
      const { error } = await supabase.rpc('toggle_post_like', { p_post_id: id });
      if (error) throw error;

      // Refresh current post to get updated like count
      const { currentPost } = get();
      if (currentPost?.id === id) {
        await get().fetchPostById(id);
      }
    } catch (error: unknown) {
      console.error('Failed to toggle like:', error);
    }
  },

  loadMorePosts: async () => {
    const { pagination, currentSearchQuery } = get();
    const nextPage = pagination.page + 1;
    
    if (nextPage <= pagination.totalPages) {
      await get().fetchPosts(nextPage, pagination.limit, true, currentSearchQuery);
    }
  },

  loadMoreUserPosts: async (userId: string, publishedFilter: 'all' | 'published' | 'draft' = 'all') => {
    const { pagination } = get();
    const nextPage = pagination.page + 1;
    
    if (nextPage <= pagination.totalPages) {
      await get().fetchUserPosts(userId, publishedFilter, nextPage, pagination.limit, true);
    }
  },

  resetPagination: () => {
    set({
      posts: [],
      currentSearchQuery: '',
      pagination: {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0,
      },
    });
  },

  clearError: () => set({ error: null }),
}));
