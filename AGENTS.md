# AGENTS.md - AI Development Guide for DevCanvas Blog

This file provides comprehensive instructions for AI coding assistants (Claude, GPT-4, etc.) working on the DevCanvas Blog project.

## 🤖 Available AI Agents

The repository is compatible with several AI models to assist developers:

- **GitHub Copilot (Raptor mini)** – in-editor completion assistant via the official VS Code extension.
- **Claude Sonnet 4.6** – a high-capacity language model useful for nuanced writing and reasoning tasks.
- **GPT‑4.1** – a versatile OpenAI model offering a balance of reasoning and creativity for general development assistance.
- **GPT‑5.1** – the latest OpenAI generative model designed for advanced code generation and problem solving.
- **Subagents** – autonomously spawned agents (`runSubagent`) for complex, multi-step tasks such as repo-wide refactors or deep searches.

### Connecting and Usage

1. **Copilot:** install the extension, sign in with a GitHub account, and begin coding; suggestions appear inline.
2. **Claude/GPT models:** invoked via the chat assistant by specifying the desired model when requesting help.
3. **Subagents:** ask the assistant to create a subagent for you using `runSubagent` when a task requires thorough automated actions.

> **Note:** Always review and test generated code before merging to ensure correctness and security.

---

## 🎯 Project Overview

**Project Name:** DevCanvas Blog  
**Type:** Full-stack blog platform  
**Architecture:** Micro-frontend with feature-based modules  
**Primary Goal:** Modern, production-ready blog with rich text editing, authentication, and analytics

---

## 📚 Tech Stack Reference

### Frontend Core
- **Framework:** React 18.3+ with TypeScript 5.x
- **Build Tool:** Vite 5.x
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS 3.x with custom color palette

### State Management
- **Global State:** Zustand 4.x with persistence middleware
- **Form State:** React Hook Form 7.x
- **Server State:** Supabase real-time subscriptions

### Internationalization
- **Language Context:** Provides `en`/`bn` and persists choice.
- **TranslationKey enum:** All UI strings are referenced via enum values for type safety.
- **useTranslation hook:** Returns `t(key)` and current language.
- **Extract script:** `npm run extract:i18n` scans components for used keys and reports missing/unused entries.
- Add new keys by updating `TranslationKey` and dictionaries in `src/i18n.ts`.
- **Translation keys for FileUpload:** UPLOAD_AVATAR, UPLOADING, UPLOAD_SUCCESS, UPLOAD_FAILED, FILE_TOO_LARGE, INVALID_FILE_TYPE, CHANGE_IMAGE, REMOVE_IMAGE

### Form & Validation
- **Forms:** React Hook Form with Controller for custom components
- **Validation:** Zod 3.x for schema validation
- **Pattern:** Schema-first approach with TypeScript inference

### UI Components
- **Base Library:** Shadcn/ui (copy-paste components)
- **Primitives:** Radix UI for accessibility
- **Icons:** Lucide React
- **Rich Text:** Tiptap 2.x with StarterKit
- **Dialog Component:** `src/components/ui/dialog.tsx` - Modal dialog for user interactions
  - Used by UpdatePasswordDialog for secure password changes
  - Supports animations and smooth transitions
  - Fully accessible with Radix UI

### Backend & Database
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with JWT tokens
- **Storage:** Supabase Storage for images
  - **Avatars bucket:** 500KB limit (user profile pictures)
  - **Featured-images bucket:** 500KB limit (blog post images)
  - **File upload component:** Built-in with progress tracking

### Testing
- **Unit Tests:** Jest 29.x
- **Component Tests:** React Testing Library 14.x
- **Setup:** setupTests.ts with jest-dom

### Analytics & Charts
- **Library:** Recharts 2.x
- **Data:** Real-time from Supabase

---

## 🎨 Design System

### Color Palette (Modern Tech Theme)
```typescript
const colors = {
  primary: '#F8FAFC',      // Off-white/Gray background
  secondary: '#0F172A',     // Deep Navy text (easier on eyes than black)
  accent: '#3B82F6',        // Electric Blue for buttons/links
  border: '#E2E8F0',        // Soft Gray for borders
  muted: '#E2E8F0',         // Muted elements
}
```

### Typography
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800, 900
- **Font Features:** cv02, cv03, cv04, cv11 enabled
- **Usage:** System font stack with Inter as primary

### Spacing & Layout
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Mobile-first:** All responsive design starts with mobile
- **Breakpoints:** Follow Tailwind defaults (sm, md, lg, xl, 2xl)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                  # Shadcn/ui primitives (atomic)
│   │   ├── button.tsx       # Button with variants
│   │   ├── input.tsx        # Form input
│   │   ├── label.tsx        # Form label
│   │   ├── card.tsx         # Card components
│   │   ├── select.tsx       # Dropdown select
│   │   ├── toast.tsx        # Toast notifications
│   │   └── dropdown-menu.tsx # Dropdown menu
│   ├── common/              # Reusable composed components
│   │   ├── RichTextEditor.tsx   # Tiptap editor wrapper
│   │   ├── LoadingSpinner.tsx   # Loading states
│   │   └── MultiSelect.tsx      # Multi-select with chips
│   └── layout/              # Layout components
│       └── Header.tsx       # Main navigation
├── contexts/               # React context providers (theme, toast)
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── features/                # Feature modules (micro-frontends)
│   ├── auth/               # Authentication
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── blog/               # Blog features
│   │   ├── BlogListPage.tsx
│   │   ├── BlogPostPage.tsx
│   │   └── CreatePostPage.tsx
│   ├── dashboard/          # Dashboard
│   │   └── DashboardPage.tsx
│   └── analytics/          # Analytics (future)
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useToast.ts         # Toast notifications
│   └── useDebounce.ts      # Debounce values
├── stores/                 # Zustand stores
│   ├── authStore.ts        # Auth state
│   ├── blogStore.ts        # Blog posts state
│   └── contentStore.ts     # Categories & tags state
├── lib/                    # Third-party configs
│   └── supabase.ts         # Supabase client
├── types/                  # TypeScript definitions
│   └── index.ts            # All type definitions
├── utils/                  # Utility functions
│   └── helpers.ts          # Helper functions
└── styles/                 # Global styles
    └── globals.css         # Tailwind + custom CSS

# root files
├── App.tsx                 # Main app component with routing
├── main.tsx                # Entry point
├── setupTests.ts           # Jest setup (react testing library)

# note: there is no dedicated __tests__ folder yet; tests are colocated with individual modules or under a tests/ directory when added
```

---

## 🔑 Key Patterns & Conventions

### 1. Component Structure

**Functional Components with TypeScript:**
```typescript
import React from 'react';

interface ComponentProps {
  title: string;
  onAction?: () => void;
  className?: string;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction,
  className 
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {title}
    </div>
  );
};
```

**Key Points:**
- Always use `React.FC<Props>` for type safety
- Props interface defined above component
- Use optional props with `?`
- Accept `className` for styling flexibility
- Use `cn()` utility for class merging

### 2. Custom Hooks Pattern

```typescript
export function useCustomHook() {
  const [state, setState] = useState();
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const actions = {
    action1: () => {},
    action2: () => {},
  };
  
  return {
    state,
    ...actions,
  };
}
```

### 3. Zustand Store Pattern

```typescript
interface StoreState {
  data: Data[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  createData: (input: CreateInput) => Promise<Data>;
  updateData: (id: string, updates: Partial<Data>) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,
  
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from('table').select();
      if (error) throw error;
      set({ data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // ... other actions
  
  clearError: () => set({ error: null }),
}));
```

**Key Points:**
- Separate data, loading, and error states
- All async operations in try-catch
- Use `set` and `get` from Zustand
- Clear error action for UI feedback

### 4. Form Handling Pattern

```typescript
// 1. Define Zod schema
const schema = z.object({
  title: z.string().min(5, 'Minimum 5 characters'),
  email: z.string().email('Invalid email'),
  published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

// 2. Use React Hook Form
const {
  register,
  handleSubmit,
  control,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    published: false,
  },
});

// 3. For custom components, use Controller
<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      {/* ... */}
    </Select>
  )}
/>
```

### 5. Input Component Pattern

```typescript
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const { register, formState: { errors } } = useForm();
const { t } = useTranslation();

// With label and error (recommended for form fields)
<Input
  id="email"
  type="email"
  label={t(TranslationKey.EMAIL)}
  placeholder="you@example.com"
  error={errors.email?.message}
  {...register('email')}
  disabled={isLoading}
/>

// For multiple inputs in PostForm
<Input
  id="title"
  type="text"
  label={t(TranslationKey.TITLE)}
  placeholder={t(TranslationKey.ENTER_TITLE_PLACEHOLDER)}
  error={errors.title?.message}
  {...register('title')}
  disabled={isLoading}
/>

// With custom styling (ProfilePage pattern)
<Input
  id="name"
  type="text"
  label={t(TranslationKey.NAME)}
  placeholder={t(TranslationKey.ENTER_NAME_PLACEHOLDER)}
  error={errors.name?.message}
  {...register('name')}
  disabled={isLoading}
  className="h-11 transition-all duration-200"
  labelClassName="flex items-center gap-2"
/>

// Backward compatible - without label/error
<Input
  id="search"
  type="text"
  placeholder="Search..."
  {...register('search')}
/>
```

**Key Features:**
- Optional `label` prop - renders Label automatically
- Optional `error` prop - displays error message with validation feedback
- Customizable via className, labelClassName, containerClassName
- React Hook Form compatible - spreads register props
- Disabled state support
- Backward compatible - works without label/error props
- Accessibility features (htmlFor, aria labels)

**Used in:**
- LoginPage - Email field
- SignupPage - Name & Email fields
- ForgotPasswordPage - Email field
- PostForm - Title & Excerpt fields
- ProfilePage - Name & Email fields

### 6. PasswordInput Component Pattern

```typescript
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors } } = useForm();
  
  return (
    <PasswordInput
      id="password"
      label="Password"
      placeholder="••••••••"
      visible={showPassword}
      onVisibilityChange={setShowPassword}
      disabled={isLoading}
      error={errors.password?.message}
      {...register('password')}
    />
  );
};
```

**For multiple password fields (signup, password reset):**
```typescript
const [showPasswords, setShowPasswords] = useState({
  password: false,
  confirm: false,
});

<PasswordInput
  id="password"
  label="Password"
  visible={showPasswords.password}
  onVisibilityChange={(visible) =>
    setShowPasswords(prev => ({ ...prev, password: visible }))
  }
  disabled={isLoading}
  error={errors.password?.message}
  {...register('password')}
/>

<PasswordInput
  id="confirmPassword"
  label="Confirm Password"
  visible={showPasswords.confirm}
  onVisibilityChange={(visible) =>
    setShowPasswords(prev => ({ ...prev, confirm: visible }))
  }
  disabled={isLoading}
  error={errors.confirmPassword?.message}
  {...register('confirmPassword')}
/>
```

**Key Features:**
- Password visibility toggle (Eye/EyeOff icons)
- React Hook Form compatible - spreads register props
- Error message display with validation feedback
- Disabled state support for loading
- Customizable via containerClassName, labelClassName, inputClassName
- Accessibility features (aria-labels, semantic HTML)
- Bilingual support (EN/BN)

**Used throughout the app in:**
- LoginPage - Password field
- SignupPage - Password & Confirm Password fields
- ResetPasswordPage - Password & Confirm Password fields
- UpdatePasswordDialog - Current, New, & Confirm Password fields

### 7. RichTextEditor Component Pattern

```typescript
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(50, 'Content must be at least 50 characters'),
});

type FormData = z.infer<typeof schema>;

const { control, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

// With label and error
<Controller
  name="content"
  control={control}
  render={({ field }) => (
    <RichTextEditor
      label="Post Content"
      content={field.value}
      onChange={field.onChange}
      editable={!isLoading}
      error={errors.content?.message}
      placeholder="Start writing your post..."
    />
  )}
/>

// Minimal usage (backward compatible)
<RichTextEditor
  content={contentValue}
  onChange={setContentValue}
/>

// Read-only mode for displaying posts
<RichTextEditor
  content={post.content}
  onChange={() => {}}
  editable={false}
  placeholder="Post content"
/>
```

**Key Features:**
- Optional `label` prop - renders label above editor
- Optional `error` prop - displays error message below editor
- Rich formatting toolbar (Bold, Italic, Strikethrough, Headings, Lists, Quotes, Code)
- Color picker with preset colors
- Link & image insertion via URL
- Undo/Redo functionality
- Customizable via className, containerClassName, labelClassName
- Controller/React Hook Form compatible
- Read-only mode via `editable` prop
- Minimum 300px height for comfortable writing
- Prose styling with dark mode support

**Used in:**
- PostForm - Blog post creation (with label/error)
- PostDetailPage - View-only mode (editable={false})

### 8. Protected Routes Pattern


```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingOverlay />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Usage in routes
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### 9. Error Handling Pattern

**Modern Approach: Use Global Toast Notifications**

```typescript
import { useGlobalToast } from '@/contexts/ToastContext';

// In components
const { success: toastSuccess, error: toastError } = useGlobalToast();
const [isLoading, setIsLoading] = useState(false);

// Success case
try {
  await operation();
  toastSuccess(
    t(TranslationKey.SUCCESS_TITLE),
    t(TranslationKey.SUCCESS_MESSAGE)
  );
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : 'Operation failed';
  toastError(t(TranslationKey.ERROR_TITLE), errorMessage);
}
```

**Legacy Approach: Inline Error Display (avoid for new code)**

```typescript
// In stores
try {
  const result = await operation();
  set({ data: result, error: null });
} catch (error: any) {
  set({ error: error.message || 'Operation failed' });
  throw error; // Re-throw for component to handle
}

// In components (legacy - avoid this pattern)
const [error, setError] = useState<string | null>(null);

try {
  await store.action();
} catch (err: any) {
  setError(err.message);
}

// Display error inline (legacy)
{error && (
  <div className="p-3 rounded-md bg-destructive/10 text-destructive">
    {error}
  </div>
)}
```

**Toast Notification Types:**
- `success(title, description?)` - Success messages
- `error(title, description?)` - Error messages
- `warning(title, description?)` - Warning messages
- `info(title, description?)` - Info messages

**Best Practices:**
- Always use `useGlobalToast()` for user feedback instead of inline error states
- Remove `const [error, setError] = useState<string | null>(null)` from components
- Use `TranslationKey` enum for all user-facing messages
- Handle errors gracefully with appropriate user feedback
- Keep loading states separate from error/success feedback

```

### 9. Dialog Form Reset Pattern

When closing a dialog/modal with a form, reset validation errors and field values:

```typescript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors }, reset, handleSubmit } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Reset form and validation errors when modal is closed
  useEffect(() => {
    if (!open) {
      reset();
      // Reset other local state (password visibility, etc.)
      setShowPassword(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: any) => {
    // Handle form submission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

**Key Points:**
- Add `useEffect` hook that listens to the `open` prop
- When `open` is false (modal closing), call `reset()` to clear form state and all validation errors
- Also reset any local UI state (password visibility, selected colors, etc.)
- Include `reset` in dependency array

**Used in:**
- UpdatePasswordDialog - Clears all password fields and Zod validation errors
- Any form-based dialog or modal component

### 10. Pagination Pattern (Load More Button)

**Overview:**  
The blog uses a "Load More" pagination strategy similar to Facebook, Medium, and Twitter for seamless content browsing.

**Configuration:**
- **Page Size:** 9 posts per page (optimized for 3-column grid)
- **Strategy:** Append mode - new posts are added to existing list
- **Component:** `LoadMoreButton` in `src/components/common/LoadMoreButton.tsx`

**Store Methods:**
```typescript
// blogStore.ts
interface BlogState {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Fetch with optional append
  fetchPosts: (page?: number, limit?: number, append?: boolean) => Promise<void>;
  fetchUserPosts: (userId: string, filter?: 'all' | 'published' | 'draft', page?: number, limit?: number, append?: boolean) => Promise<void>;
  
  // Convenience methods
  loadMorePosts: () => Promise<void>;
  loadMoreUserPosts: (userId: string, filter?: 'all' | 'published' | 'draft') => Promise<void>;
  resetPagination: () => void;
}
```

**Component Usage:**
```typescript
import { LoadMoreButton } from '@/components/common/LoadMoreButton';
import { useBlogStore } from '@/stores/blogStore';

const MyPage: React.FC = () => {
  const { posts, pagination, isLoading, fetchPosts, loadMorePosts, resetPagination } = useBlogStore();

  useEffect(() => {
    // Reset and fetch first page on mount
    resetPagination();
    fetchPosts();
    
    // Cleanup: reset pagination on unmount
    return () => resetPagination();
  }, []);

  const handleLoadMore = () => {
    loadMorePosts();
  };

  const initialLoading = isLoading && posts.length === 0;
  const loadingMore = isLoading && posts.length > 0;
  const hasMore = pagination.page < pagination.totalPages;

  return (
    <div>
      {/* Show posts */}
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      
      {/* Load More button */}
      {posts.length > 0 && (
        <LoadMoreButton
          isLoading={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          currentCount={posts.length}
          totalCount={pagination.total}
        />
      )}
    </div>
  );
};
```

**LoadMoreButton Props:**
```typescript
interface LoadMoreButtonProps {
  isLoading: boolean;       // Show loading spinner
  hasMore: boolean;         // Has more pages to load
  onLoadMore: () => void;   // Callback when clicked
  currentCount: number;     // Current posts shown
  totalCount: number;       // Total posts available
  className?: string;       // Optional CSS class
}
```

**Features:**
- Shows "Showing X of Y posts" counter
- Displays loading state with spinner
- Auto-hides when all posts are loaded
- Shows "No more posts to load" message when done
- Fully internationalized (i18n keys: `LOAD_MORE`, `LOADING_MORE`, `NO_MORE_POSTS`, `SHOWING_POSTS_COUNT`)

**Best Practices:**
- Always call `resetPagination()` before initial fetch
- Reset on filter changes (e.g., in DashboardPage when switching between All/Published/Draft)
- Clean up on unmount to prevent state leaks
- Use `append: true` for load more, `append: false` for initial/filter changes

---

## 💬 Comments System Pattern

### Overview
The comments system supports nested comments (replies to comments) on blog posts with full CRUD operations and real-time updates.

### Using Comments in Components

**Fetching Comments with Author Info:**
```typescript
// Fetch all comments for a post with author information
const fetchPostComments = async (postId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:author_id (id, name, avatar_url),
      children:comments!parent_id (
        *,
        author:author_id (id, name, avatar_url)
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null) // Only root comments
    .order('created_at', { ascending: false });
    
  return data;
};
```

**Creating a Comment:**
```typescript
const createComment = async (postId: string, content: string, parentId?: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_id: parentId || null,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

**Updating a Comment:**
```typescript
const updateComment = async (commentId: string, content: string) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date() })
    .eq('id', commentId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

**Deleting a Comment:**
```typescript
const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
    
  if (error) throw error;
};
```

### Key Features
- Parent-child relationships via `parent_id` field
- Cascade delete when posts or parent comments are deleted
- RLS policies enforce user ownership for update/delete
- Real-time subscriptions for live comment updates
- Timestamps track creation and modification

### Database Constraints
- `post_id` references `posts` table with CASCADE delete
- `author_id` references `users` table with CASCADE delete
- `parent_id` self-references for nested replies
- All timestamp fields automatically set/updated

### Row-Level Security Policies
- **Read**: Anyone can read comments on published posts
- **Create**: Authenticated users can create comments
- **Update**: Users can only update their own comments
- **Delete**: Users can only delete their own comments

---

## 👍 Like System Pattern

### Overview
The like system tracks user engagement on blog posts with real-time count aggregation using Supabase RPC functions.

### Using Likes in Components

**Toggling a Post Like (Atomic RPC):**
```typescript
// Use RPC function for atomic like/unlike operation
const toggleLike = async (postId: string) => {
  const { data, error } = await supabase
    .rpc('toggle_post_like', { p_post_id: postId });
    
  if (error) throw error;
  return data; // Returns { liked: boolean, likes: number }
};
```

**Checking if User Liked a Post:**
```typescript
const checkIfLiked = async (postId: string) => {
  const { data } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();
    
  return !!data; // Returns true if liked
};
```

**Getting Like Count:**
```typescript
// Direct from posts table (aggregated)
const getLikesCount = (post: BlogPost) => {
  return post.likes; // Updated automatically by RPC function
};
```

**Real-time Like Updates (Subscription):**
```typescript
const subscribeToLikes = (postId: string, onUpdate: (likes: number) => void) => {
  const subscription = supabase
    .from('posts')
    .on('UPDATE', payload => {
      if (payload.new.id === postId) {
        onUpdate(payload.new.likes);
      }
    })
    .subscribe();
    
  return subscription;
};
```

### RPC Function (Supabase)

The `toggle_post_like` function ensures atomic operations:
```sql
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID)
RETURNS TABLE(liked BOOLEAN, likes INTEGER) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF EXISTS (SELECT 1 FROM post_likes WHERE post_id = p_post_id AND user_id = v_user_id) THEN
    DELETE FROM post_likes WHERE post_id = p_post_id AND user_id = v_user_id;
    liked := FALSE;
  ELSE
    INSERT INTO post_likes (post_id, user_id) VALUES (p_post_id, v_user_id);
    liked := TRUE;
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO likes FROM post_likes WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Key Features
- One like per user per post (unique constraint)
- Atomic toggle operation (like/unlike in single RPC call)
- Automatic count aggregation in posts table
- Real-time updates via Supabase subscriptions
- Only authenticated users can like posts

### Database Table
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### Row-Level Security Policies
- **Read**: Public (anyone can see like counts)
- **Create/Delete**: Users can only manage their own likes
- **Updates**: Not applicable (only CRUD)

### Best Practices
- Use RPC `toggle_post_like()` for atomic operations
- Subscribe to post updates for real-time like counts
- Handle optimistic UI updates for better UX
- Show loading state during like toggle
- Use toast notifications for like actions

---

## 🗄️ Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tags
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### post_tags (junction table)
```sql
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

#### post_likes
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);

-- Users can insert their own record
CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (published = true OR author_id = auth.uid());

-- Users can create own posts
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Users can update own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (author_id = auth.uid());

-- Users can delete own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- Anyone can read comments on published posts or own comments
CREATE POLICY "Anyone can read comments on published posts or own comments"
  ON comments
  FOR SELECT
  USING (
    (SELECT published FROM posts WHERE posts.id = comments.post_id) = true
    OR author_id = auth.uid()
  );

-- Users can create own comments
CREATE POLICY "Users can create own comments"
  ON comments
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update own comments
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  USING (author_id = auth.uid());

-- Users can delete own comments
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  USING (author_id = auth.uid());

-- Anyone can read categories
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);

-- Anyone can read tags
CREATE POLICY "Anyone can read tags" ON tags FOR SELECT USING (true);

-- Anyone can read post_tags
CREATE POLICY "Anyone can read post_tags" ON post_tags FOR SELECT USING (true);

-- Users can manage tags for own posts
CREATE POLICY "Users can manage tags for own posts" ON post_tags
  FOR ALL
  USING ((SELECT author_id FROM posts WHERE posts.id = post_tags.post_id) = auth.uid());

-- Anyone can read post likes
CREATE POLICY "Anyone can read post likes" ON post_likes FOR SELECT USING (true);

-- Authenticated users can create likes
CREATE POLICY "Authenticated users can like posts" ON post_likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON post_likes
  FOR DELETE
  USING (user_id = auth.uid());
```

### Post Likes & Views Feature Setup

To enable the post like/unlike and views tracking functionality, run the following SQL in your Supabase SQL Editor:

```sql
-- Drop existing functions if parameter names need to change
DROP FUNCTION IF EXISTS public.toggle_post_like(uuid);
DROP FUNCTION IF EXISTS public.increment_post_views(uuid);

-- Create post_likes table to track user likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;

-- Create RLS policies
CREATE POLICY "Users can view all likes" ON post_likes 
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON post_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- Create the toggle_post_like RPC function
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user already liked this post
  IF EXISTS (
    SELECT 1 FROM post_likes 
    WHERE post_id = p_post_id 
    AND user_id = auth.uid()
  ) THEN
    -- Unlike: Remove the like
    DELETE FROM post_likes 
    WHERE post_id = p_post_id 
    AND user_id = auth.uid();
    
    -- Decrement the likes count
    UPDATE posts 
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = p_post_id;
  ELSE
    -- Like: Add a new like
    INSERT INTO post_likes (post_id, user_id)
    VALUES (p_post_id, auth.uid());
    
    -- Increment the likes count
    UPDATE posts 
    SET likes = likes + 1
    WHERE id = p_post_id;
  END IF;
END;
$$;

-- Create the increment_post_views RPC function
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts 
  SET views = views + 1
  WHERE id = p_post_id;
END;
$$;
```

**Usage in frontend:**
```typescript
// Toggle like
await supabase.rpc('toggle_post_like', { p_post_id: postId });

// Increment views
await supabase.rpc('increment_post_views', { p_post_id: postId });
```

**Features:**
- **Likes**: Prevents duplicate likes (UNIQUE constraint), automatic count updates
- **Views**: Simple counter increment for page views
- **Security**: Row Level Security enabled for likes table
- **Performance**: Optimized with database indexes
- **Data Integrity**: CASCADE deletion when posts/users are removed

---

## 🛠️ Common Tasks Guide

### Working with Translations
1. Add a key to `TranslationKey` enum in `src/i18n.ts`.
2. Provide English and Bengali values in the `translations` object.
3. Use `const { t } = useTranslation();` and call `t(TranslationKey.YOUR_KEY)` in components.
4. Run `npm run extract:i18n` to audit missing/unused keys.

### Adding a New Page

1. **Create the page component:**
```typescript
// src/features/[feature]/NewPage.tsx
export const NewPage: React.FC = () => {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold">New Page</h1>
    </div>
  );
};
```

2. **Add route in App.tsx:**
```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. **Add navigation link if needed:**
```typescript
// In Header.tsx
<Link to="/new-page">New Page</Link>
```

### Adding a New Zustand Store

```typescript
// src/stores/newStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface NewState {
  data: any[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useNewStore = create<NewState>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  
  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from('table').select();
      if (error) throw error;
      set({ data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
```

### Password Update Feature

The application includes a password update feature accessible from the user avatar dropdown in the header:

**Location:** `src/features/auth/UpdatePasswordDialog.tsx`

**Features:**
- Secure password change dialog with modal
- Requires current password verification
- Validates new password (6+ characters)
- Confirms password match
- Prevents reusing current password
- Password visibility toggles (Eye icon)
- Error validation messages
- Loading states during submission
- Toast notifications for feedback
- Bilingual support (EN/BN)

**Usage in Header:**
```typescript
import { UpdatePasswordDialog } from '@/features/auth/UpdatePasswordDialog';

const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

// In dropdown menu
<DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
  <Key className="mr-2 h-4 w-4" />
  <span>{t(TranslationKey.CHANGE_PASSWORD)}</span>
</DropdownMenuItem>

// In component
<UpdatePasswordDialog
  open={passwordDialogOpen}
  onOpenChange={setPasswordDialogOpen}
/>
```

**Translation Keys Used:**
- `CHANGE_PASSWORD` - Dialog title
- `CURRENT_PASSWORD` - Current password label
- `NEW_PASSWORD` - New password label
- `CONFIRM_NEW_PASSWORD` - Confirm password label
- `UPDATE_PASSWORD_DESCRIPTION` - Dialog description
- `PASSWORD_UPDATED_SUCCESS` - Success notification title
- `PASSWORD_CHANGED_MESSAGE` - Success notification message
- `UPDATING_PASSWORD` - Loading state
- `UPDATE_PASSWORD` - Submit button text

**Auth Integration:**
```typescript
const { updatePassword } = useAuth();
await updatePassword(newPassword);
```

The feature follows project patterns:
- React Hook Form + Zod validation
- Global toast notifications
- TypeScript with proper typing
- Tailwind CSS styling
- Radix UI Dialog component

### Adding a New UI Component

1. **Create component in appropriate folder:**
```typescript
// src/components/ui/new-component.tsx
import * as React from 'react';
import { cn } from '@/utils/helpers';

interface NewComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  className,
  children 
}) => {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  );
};
```

2. **Use in other components:**
```typescript
import { NewComponent } from '@/components/ui/new-component';

<NewComponent className="custom-styles">Content</NewComponent>
```

### Adding a New Form

```typescript
// 1. Define schema
const formSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

// 2. Setup form
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(formSchema),
});

// 3. Create JSX
<form onSubmit={handleSubmit(onSubmit)}>
  <div className="space-y-2">
    <Label>Field 1</Label>
    <Input {...register('field1')} />
    {errors.field1 && <p className="text-destructive">{errors.field1.message}</p>}
  </div>
  
  <Button type="submit">Submit</Button>
</form>
```

### Adding a New Database Table

1. **Create table in Supabase:**
```sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Add RLS policies:**
```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name" ON new_table
  FOR SELECT USING (true);
```

3. **Add TypeScript types:**
```typescript
// src/types/index.ts
export interface NewTable {
  id: string;
  name: string;
  created_at: string;
}
```

4. **Create store for data management:**
```typescript
// src/stores/newTableStore.ts
// ... (follow store pattern)
```

---

## 🧪 Testing Guidelines

### Unit Test Example

```typescript
// src/utils/__tests__/helpers.test.ts
import { formatDate, generateSlug } from '../helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-01');
      const result = formatDate(date);
      expect(result).toBe('January 1, 2024');
    });
  });
  
  describe('generateSlug', () => {
    it('generates slug from text', () => {
      const result = generateSlug('Hello World');
      expect(result).toBe('hello-world');
    });
  });
});
```

### Component Test Example

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚨 Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection fails

**Solution:**
- Check `.env` file exists with correct variables
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing env variables

### Issue: TypeScript errors on Shadcn components

**Solution:**
- Ensure all Radix UI dependencies are installed
- Check `tsconfig.json` has correct path aliases
- Run `npm install` to install missing deps

### Issue: RLS policies blocking queries

**Solution:**
- Check user is authenticated
- Verify RLS policies in Supabase dashboard
- Use Supabase query inspector to debug

### Issue: Form validation not working

**Solution:**
- Ensure Zod schema matches form fields
- Check `resolver: zodResolver(schema)` is set
- Verify field names match schema keys

---

## 📋 Code Review Checklist

When reviewing or creating code, ensure:

### General
- [ ] TypeScript types are properly defined
- [ ] No `any` types unless absolutely necessary
- [ ] Imports are organized (React first, then libraries, then local)
- [ ] No unused imports or variables
- [ ] Proper error handling with try-catch
- [ ] Loading states shown during async operations

### Components
- [ ] Props interface defined
- [ ] Proper use of React.FC
- [ ] className prop accepted for styling
- [ ] Accessibility attributes (aria-label, etc.)
- [ ] Mobile-responsive design
- [ ] No inline styles (use Tailwind)

### Forms
- [ ] Zod schema defined
- [ ] React Hook Form setup correctly
- [ ] Controller used for custom components
- [ ] Error messages displayed
- [ ] Submit button disabled while loading
- [ ] Success/error feedback shown

### Stores
- [ ] Loading and error states included
- [ ] Try-catch in all async actions
- [ ] Clear error action available
- [ ] Optimistic updates where appropriate
- [ ] No direct state mutation

### Database
- [ ] RLS policies defined
- [ ] Proper foreign key relationships
- [ ] Indexes on frequently queried columns
- [ ] Timestamp columns (created_at, updated_at)
- [ ] Cascade deletes where appropriate

---

## 🎯 Best Practices

### 1. Component Organization
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use composition over complex props
- Separate UI from business logic

### 2. State Management
- Use Zustand for global state
- Use useState for local component state
- Use React Hook Form for form state
- Don't duplicate state unnecessarily

### 3. Styling
- Use Tailwind utility classes
- Use `cn()` for conditional classes
- Follow mobile-first approach
- Maintain consistent spacing

### 4. Performance
- Lazy load routes when possible
- Memoize expensive calculations
- Debounce search inputs
- Optimize images before upload

### 5. Security
- Never store sensitive data in localStorage
- Always validate input on backend
- Use RLS policies in Supabase
- Sanitize user-generated content

### 6. Accessibility
- Use semantic HTML
- Add aria labels where needed
- Ensure keyboard navigation works
- Test with screen readers

---

## 🔄 Development Workflow

### Starting Development
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Add Supabase credentials

# 3. Start development server
npm run dev
```

### Making Changes
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... edit files ...

# 3. Test changes
npm run test
npm run lint

# 4. Commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/new-feature
```

### Deploying
```bash
# 1. Build for production
npm run build

# 2. Preview build
npm run preview

# 3. Deploy to hosting
# (Vercel, Netlify, etc.)
```

---

## 📖 Additional Resources

### Documentation Links
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tiptap Docs](https://tiptap.dev/)

### Project-Specific Docs
- `README.md` - Main documentation
- `ARCHITECTURE.md` - System architecture
- `QUICKSTART.md` - Quick setup guide
- `PROJECT_STRUCTURE.md` - File organization
- `CATEGORIES_TAGS_EXPLANATION.md` - Feature implementation

---

## 🤖 AI Assistant Guidelines

When working on this project as an AI assistant:

### DO:
✅ Follow the established patterns and conventions
✅ Use existing components and utilities
✅ Maintain TypeScript strict typing
✅ Follow the color scheme and design system
✅ Add proper error handling
✅ Include loading states
✅ Write clear, documented code
✅ Test changes before suggesting
✅ Reference existing code as examples
✅ Ask clarifying questions if needed

### DON'T:
❌ Change the core architecture without discussion
❌ Use different state management libraries
❌ Ignore TypeScript errors
❌ Use inline styles instead of Tailwind
❌ Skip form validation
❌ Forget error handling
❌ Modify the color scheme without approval
❌ Add dependencies without justification
❌ Ignore accessibility requirements
❌ Break existing functionality

### When Creating New Features:
1. Check if similar features exist
2. Follow the established patterns
3. Use existing components where possible
4. Add to appropriate feature folder
5. Update types if needed
6. Test thoroughly
7. Document if complex

### When Debugging:
1. Identify the issue clearly
2. Check relevant files systematically
3. Verify environment configuration
4. Test in isolation
5. Provide clear explanation
6. Suggest preventive measures

---

## 🗂️ File Upload & Storage

### FileUpload Component (`src/components/ui/file-upload.tsx`)

A production-ready file upload component with:
- Real-time progress tracking (0-100%)
- Image preview with Change/Remove buttons
- File validation (size & type)
- Bilingual error messages
- Direct Supabase Storage integration

**Usage Example:**
```tsx
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  value={avatarUrl}
  onChange={(url) => setAvatarUrl(url)}
  bucket="avatars"
  maxSize={0.5}  // 500KB
  accept="image/*"
/>
```

### Supabase Storage Setup

**Required Buckets:**
1. **avatars**: User profile pictures (500KB max)
2. **featured-images**: Blog post images (10MB max)

**Setup Instructions:**
See `STORAGE_SETUP.md` for complete setup guide including:
- SQL scripts to create buckets
- Row Level Security policies
- Storage access configuration

**Security:**
- Users can only upload to their own folder
- Public read access for all images
- File size limits enforced at bucket level
- MIME type restrictions prevent non-image uploads

**File Organization:**
```
avatars/
  └── {user_id}/
      └── {random_id}-{timestamp}.{ext}

featured-images/
  └── {random_id}-{timestamp}.{ext}
```

### Translation Keys for FileUpload

When using FileUpload, these translation keys are available:
- `UPLOAD_AVATAR` - Upload button label
- `UPLOADING` - Upload in progress
- `UPLOAD_SUCCESS` - Upload complete
- `UPLOAD_FAILED` - Upload error
- `FILE_TOO_LARGE` - File size error
- `INVALID_FILE_TYPE` - File type error
- `CHANGE_IMAGE` - Change button
- `REMOVE_IMAGE` - Remove button

All keys have both English and Bengali translations.

---

## 📞 Getting Help

When stuck or uncertain:

1. **Check Documentation:**
   - Read AGENTS.md (this file)
   - Review ARCHITECTURE.md
   - Check component examples

2. **Search Codebase:**
   - Look for similar implementations
   - Check existing patterns
   - Review related files

3. **Verify Environment:**
   - Check .env variables
   - Verify dependencies installed
   - Confirm Supabase connection

4. **Test Incrementally:**
   - Start with simple case
   - Add complexity gradually
   - Test each step

---

## 🎓 Learning Path for New Contributors

### Week 1: Fundamentals
- [ ] Review project structure
- [ ] Understand component hierarchy
- [ ] Learn state management pattern
- [ ] Study form handling approach

### Week 2: Features
- [ ] Examine authentication flow
- [ ] Review blog post creation
- [ ] Understand category/tag system
- [ ] Study dashboard implementation

### Week 3: Advanced
- [ ] Deep dive into Supabase integration
- [ ] Learn RLS policy patterns
- [ ] Understand optimization techniques
- [ ] Review testing approach

### Week 4: Contribution
- [ ] Fix a small bug
- [ ] Add a minor feature
- [ ] Improve documentation
- [ ] Submit first PR

---

## 🚀 Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript types

# Database
# (Run in Supabase SQL Editor)
# See supabase-seed-data.sql for examples
```

---

**This AGENTS.md file should be your primary reference when working on the DevCanvas Blog project. Keep it updated as the project evolves!**

**Last Updated:** 2026
**Version:** 1.0.0
**Maintainer:** DevCanvas Team
