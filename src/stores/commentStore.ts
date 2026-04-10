import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface CommentAuthor {
  id: string;
  name: string;
  avatar_url?: string | null;
}

export interface CommentItem {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author?: CommentAuthor;
  replies: CommentItem[];
}

interface CommentState {
  comments: CommentItem[];
  currentPostId: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchComments: (postId: string) => Promise<void>;
  createComment: (postId: string, authorId: string, content: string, parentId?: string | null) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  resetComments: () => void;
  clearError: () => void;
}

const sortCommentsByDate = (comments: CommentItem[]): CommentItem[] =>
  comments
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((comment) => ({
      ...comment,
      replies: sortCommentsByDate(comment.replies),
    }));

const buildCommentTree = (items: CommentItem[]): CommentItem[] => {
  const commentMap = new Map<string, CommentItem>();
  const rootComments: CommentItem[] = [];

  items.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  commentMap.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(comment);
        return;
      }
    }

    rootComments.push(comment);
  });

  return sortCommentsByDate(rootComments);
};

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  currentPostId: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchComments: async (postId: string) => {
    set({ isLoading: true, error: null, currentPostId: postId });

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users(id, name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedComments = ((data ?? []) as Omit<CommentItem, 'replies'>[]).map((comment) => ({
        ...comment,
        replies: [],
      }));

      set({
        comments: buildCommentTree(mappedComments),
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch comments',
        isLoading: false,
      });
      throw error;
    }
  },

  createComment: async (postId: string, authorId: string, content: string, parentId: string | null = null) => {
    set({ isSubmitting: true, error: null });

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: authorId,
        content,
        parent_id: parentId,
      });

      if (error) throw error;

      await get().fetchComments(postId);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create comment',
        isSubmitting: false,
      });
      throw error;
    }
  },

  updateComment: async (commentId: string, content: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;

      const { currentPostId } = get();
      if (!currentPostId) throw new Error('No active post selected for comment refresh');

      await get().fetchComments(currentPostId);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update comment',
        isSubmitting: false,
      });
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    set({ isSubmitting: true, error: null });

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;

      const { currentPostId } = get();
      if (!currentPostId) throw new Error('No active post selected for comment refresh');

      await get().fetchComments(currentPostId);
      set({ isSubmitting: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete comment',
        isSubmitting: false,
      });
      throw error;
    }
  },

  resetComments: () =>
    set({
      comments: [],
      currentPostId: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
    }),

  clearError: () => set({ error: null }),
}));

