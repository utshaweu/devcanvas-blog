import { PostFormData } from "@/features/blog/PostForm";
import { LucideIcon } from "lucide-react";

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

// Blog Post Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: string;
  author?: User;
  category_id?: string;
  category?: Category;
  tags?: Tag[];
  published: boolean;
  published_at?: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: string;
  category_id?: string;
  tags?: string[];
  published: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  created_at: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
}

// Comment Types
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user?: User;
  content: string;
  parent_id?: string;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface PostAnalytics {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avg_read_time: number;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
}

export interface ViewData {
  date: string;
  views: number;
  likes: number;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface FormFieldError {
  type: string;
  message: string;
}

// Toast/Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  roles?: string[];
}

// Editor Types
export interface EditorContent {
  type: 'doc';
  content: unknown[];
}

// Search Types
export interface SearchParams {
  query: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult {
  posts: BlogPost[];
  total: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

// language support
export type Language = 'en' | 'bn';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<PostFormData>;
  onCancel: () => void;
  submitButtonText: {
    primary: string;
    secondary?: string;
    loading: string;
  };
  mode: 'create' | 'edit';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

export interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'dashboard';
  onEdit?: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
  isDeleting?: boolean;
}

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export type BadgeVariant = 'category' | 'tag' | 'status' | 'default';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  published?: boolean; // For status variant
}

export interface LoadMoreButtonProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentCount: number;
  totalCount: number;
  className?: string;
}