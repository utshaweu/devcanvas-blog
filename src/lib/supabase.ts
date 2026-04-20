import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database type definitions for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          email?: string;
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          author_id: string;
          category_id: string | null;
          published: boolean;
          published_at: string | null;
          views: number;
          likes: number;
          comments: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          author_id: string;
          category_id?: string | null;
          published?: boolean;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          author_id?: string;
          category_id?: string | null;
          published?: boolean;
          published_at?: string | null;
          views?: number;
          likes?: number;
          comments?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          post_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          post_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          post_id: string;
          author_id: string;
          content: string;
          parent_id?: string | null;
        };
        Update: {
          post_id?: string;
          author_id?: string;
          content?: string;
          parent_id?: string | null;
        };
      };
    };
  };
};
