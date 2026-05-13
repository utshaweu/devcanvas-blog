import { PostFormData } from "@/features/blog/PostForm";
import { LucideIcon } from "lucide-react";
import type { CommentItem as CommentItemType } from '@/stores/commentStore';

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
  comments: number;
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

export interface AnalyticsMonthlyDataPoint {
  key: string;
  month: string;
  views: number;
  likes: number;
  comments: number;
  posts: number;
}

export interface AnalyticsTopPostDataPoint {
  title: string;
  fullTitle: string;
  views: number;
  likes: number;
  comments: number;
  engagementScore: number;
}

export interface AnalyticsDistributionDataPoint {
  name: string;
  value: number;
}

export interface ReusableLineChartSeries {
  dataKey: string;
  name: string;
  stroke: string;
  strokeWidth?: number;
}

export interface ReusableLineChartProps<TData extends object = Record<string, unknown>> {
  data: TData[];
  xDataKey: keyof TData & string;
  series: ReusableLineChartSeries[];
  className?: string;
  yAxisAllowDecimals?: boolean;
}

export interface ReusableBarChartProps<TData extends object = Record<string, unknown>> {
  data: TData[];
  xDataKey: keyof TData & string;
  barDataKey: keyof TData & string;
  barName: string;
  barColor?: string;
  className?: string;
  yAxisAllowDecimals?: boolean;
  showXAxisLabels?: boolean;
  tooltipLabelKey?: keyof TData & string;
}

export interface ReusablePieChartProps {
  data: AnalyticsDistributionDataPoint[];
  colors: string[];
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
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
  /** Called whenever the form's dirty state changes */
  onDirtyChange?: (isDirty: boolean) => void;
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
  label?: string; // Optional label
  error?: string; // Optional error message
  containerClassName?: string; // Optional container styling
  labelClassName?: string; // Optional label styling
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

export interface FileUploadProps {
  value?: string; // URL of the currently uploaded file
  onChange?: (url: string) => void; // Callback when a new file is uploaded
  onRemove?: () => void; // Callback when the file is removed
  accept?: string; // Accepted file types (e.g. "image/*")
  maxSize?: number; // Max file size in MB
  bucket?: string; // Supabase storage bucket name
  path?: string; // Optional path prefix for uploaded files
  disabled?: boolean; // Disabled state
  className?: string; // Additional CSS classes for upload area
  label?: string; // Label for the upload area
  showPreview?: boolean; // Whether to show image preview after upload
  error?: string; // Validation error message (external errors)
  containerClassName?: string; // Additional CSS classes for container
  labelClassName?: string; // Additional CSS classes for label
  errors?: string; // Validation error message (internal errors from file upload)
}

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  allowClear?: boolean;
}

export interface CommentsSectionProps {
  postId: string;
  className?: string;
}

export interface CommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  placeholder: string;
  submitLabel: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export interface CommentItemProps {
  comment: CommentItemType;
  currentUserId?: string;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  loginRequiredLabel: string;
  replyLabel: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirmMessage: string;
  saveLabel: string;
  cancelLabel: string;
  replyPlaceholder: string;
  editPlaceholder: string;
  viewRepliesLabel: string;
  hideRepliesLabel: string;
  onRequireLogin: () => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  className?: string;
}

export interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  visible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  // react-hook-form compatibility
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  clearButtonLabel: string;
  label?: string;
  helperText?: string;
  className?: string;
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  buttonLabel: string;
  className?: string;
  buttonClassName?: string;
  pickerClassName?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'custom';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonContent?: React.ReactNode;
  disabled?: boolean;
  preferredWidth?: number;
  maxHeight?: number;
  viewportPadding?: number;
  mobileBreakpoint?: number;
  mobileCentered?: boolean;
}

export interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  overscan?: number;
  useWindowScroll?: boolean;
  getItemKey?: (item: T, index: number) => string;
  footer?: React.ReactNode;
}

export type VirtualizedGridComponent = <T,>(props: VirtualizedGridProps<T>) => JSX.Element;

export interface McpError {
  code: number;
  message: string;
}

export interface McpMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: McpError;
}

export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface ChatBotHook {
  sendMessage: (message: string) => Promise<string>;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export interface McpContentPart {
  type: string;
  text?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SpotlightSearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

export interface SpotlightSearchProps {
  className?: string;
  resultsLimit?: number;
  onResultNavigate?: (result: SpotlightSearchResult) => void;
}

export interface AuthorHoverCardProps {
  authorName?: string;
  authorAvatarUrl?: string;
  authorInitial: string;
  totalPosts: number | null;
  isLoading: boolean;
  className?: string;
}

export interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  iconClassName?: string;
}

export interface BookmarkButtonProps {
  postId: string;
  className?: string;
}