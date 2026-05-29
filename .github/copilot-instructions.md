# GitHub Copilot Instructions - DevCanvas Blog

## Project Overview
You are assisting with **DevCanvas Blog** - a production-ready, full-stack blogging platform with:
- **File Upload System**: Avatar & featured image uploads with Supabase Storage
- **Infinite Scroll**: Load More pagination (9 posts per page)
- **Virtualized Grid Rendering**: Windowed rendering for large post collections
- **Post Search**: Debounced, Medium-style search on blog list with pagination support
- **Author Hover Card**: Reusable gradient author preview card with avatar fallback and lazy post-count loading
- **Share Button**: Reusable `ShareButton` component — clipboard copy + Web Share API sheet (WhatsApp, Telegram, Facebook, etc.)
- **Spotlight Search**: Keyboard-first instant post search (`Ctrl+K` / `Cmd+K`) with arrow-key navigation, reusable `resultsLimit` and `onResultNavigate` props, and full bilingual support
- **Multilingual**: English and Bangla support with runtime switching
- **Dark Mode**: Light/Dark/System theme with persistence
- **Comments System**: Nested comments on blog posts
- **Like System**: Post likes with real-time tracking
- **Rich Text Editor**: Tiptap with full formatting support
- **Reusable Emoji Picker**: Shared emoji picker for editor and comments
- **Unsaved Changes Protection**: Reusable navigation blocker and confirmation dialog for dirty forms
- **Analytics**: Dashboard with views, likes, comments, and engagement metrics
- **Reading Progress Bar**: Fixed top bar showing scroll progress on blog post pages
- **Estimated Read Time**: Calculated at 200 WPM, shown on post cards and post page
- **Reading List**: Bookmark posts to a personal reading list stored in Supabase (`bookmarks` table with RLS); managed via `useBookmarkStore` (Zustand) with optimistic updates
- **Table of Contents**: Auto-generated sticky sidebar (desktop) + collapsible accordion (mobile) from `h1`/`h2`/`h3` headings; scroll-listener active tracking with last-heading guard; `useTableOfContents` hook injects IDs into rendered DOM
- **Code Syntax Highlighting**: Editor uses `@tiptap/extension-code-block-lowlight` with `lowlight@^2` for live highlighting and a language selector; viewer uses `highlight.js` (`hljs.highlightElement`) on rendered `pre code` blocks with GitHub-inspired light/dark token colors
- **OAuth Login**: Google & GitHub sign-in/sign-up via Supabase Auth providers; reusable `OAuthButtons` component used on LoginPage and SignupPage

## Tech Stack (DO NOT SUGGEST ALTERNATIVES)

### Core
- React 18.3+ with TypeScript 5.x
- Vite 5.x (build tool, dev server on port 3012)
- Tailwind CSS 3.x (styling ONLY - no CSS-in-JS)
- React Router DOM v6

### State Management
- Zustand 4.x (global state with persistence)
- React Hook Form 7.x (forms)
- Zod 3.x (validation)
- Toast Context (global notifications)

### UI Components
- Shadcn/ui (Radix UI primitives)
- Lucide React (icons)
- Tiptap 2.x (rich text editor with `@tiptap/extension-code-block-lowlight@^2.27.2` + `lowlight@^2`)
- `highlight.js` — viewer-side syntax highlighting on blog post pages
- Emoji-mart (shared emoji picker data + UI)
- Custom FileUpload component (with progress tracking)
- Custom PasswordInput component (with visibility toggle)
- Reusable `AuthorHoverCard` component (author preview on hover)
- Reusable `ShareButton` component (clipboard copy + Web Share API)
- VirtualizedGrid component (react-virtuoso powered)
- Reusable chart wrappers: `LineChartView`, `BarChartView`, `PieChartView`
- Reusable `OAuthButtons` component (Google + GitHub buttons with divider, loading states, `mode` prop for signin/signup label text)

### Backend & Storage
- Supabase (PostgreSQL + Auth + Storage)
- Supabase Storage buckets:
  - `avatars` (500KB limit, public)
  - `featured-images` (500KB limit, public)

### OAuth Providers
- Google (`supabase.auth.signInWithOAuth({ provider: 'google' })`)
- GitHub (`supabase.auth.signInWithOAuth({ provider: 'github' })`)
- Redirect URL uses `window.location.origin` dynamically (works for both `localhost:3012` and `devcanvas-blog.vercel.app`)
- Supabase Dashboard → Authentication → URL Configuration must allowlist both `http://localhost:3012/dashboard` and `https://devcanvas-blog.vercel.app/dashboard`

### MCP & Environment Variables
- Frontend MCP endpoint is configured via `VITE_MCP_WS_URL`
  - local development: set in `.env.local` (e.g., `http://localhost:8080`)
  - production: set in `.env.production` (deployed bridge URL)
- MCP server should read Supabase URL from `VITE_SUPABASE_URL` or `SUPABASE_URL`
- MCP server should prefer `SUPABASE_SERVICE_ROLE_KEY` when available, then fall back to anon key
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only (deployment/runtime secret), not exposed in client bundles

### MCP Chatbot Implementation (Actual Repo)
- Frontend integration:
  - `src/components/common/ChatBot.tsx`
  - `src/hooks/useChatBot.ts`
  - `useChatBot` sends MCP `initialize` and routes natural-language prompts to `tools/call` based on keyword intent.
- Bridge implementation:
  - `mcp-websocket-bridge.js`
  - Runs HTTP + WebSocket server and spawns `mcp-server.js` using stdio transport.
- MCP tools are implemented in:
  - `mcp-server.js`
  - Includes tools for posts, views, likes, comments, categories, and tags, plus `blog://stats` resource.
- Category/tag counts in MCP should be treated as relation-derived values (from `posts.category_id` and `post_tags`), not as authoritative `post_count` columns.

## Database Optimization

### Posts Table Indexes

To optimize query performance, add these indexes to the `posts` table in your Supabase SQL editor:

```sql
-- ============================================
-- Add Indexes to Posts Table for Performance
-- ============================================

-- Index for author_id lookups (most critical)
-- Used in: fetchUserPosts, fetchUserPostsStats
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

-- Index for published status queries
-- Used in: fetchPosts (filters by published = true)
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);

-- Composite index for published posts ordered by date
-- Used in: fetchPosts (published = true ORDER BY published_at DESC)
CREATE INDEX IF NOT EXISTS idx_posts_published_published_at 
  ON posts(published, published_at DESC);

-- Index for slug lookups (used in fetchPostBySlug)
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Composite index for user's published posts
-- Used in: fetchUserPosts with published filter
CREATE INDEX IF NOT EXISTS idx_posts_author_published 
  ON posts(author_id, published);

-- Composite index for sorting user posts by creation date
-- Used in: fetchUserPosts (ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_posts_author_created_at 
  ON posts(author_id, created_at DESC);

-- Index for category_id lookups (if filtering by category)
-- Consider adding if category filtering is implemented
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
```

### Comments Counter Migration

To keep `posts.comments` fast and accurate in production, run the following SQL in Supabase:

```sql
-- Backfill comments count from existing comments data
UPDATE public.posts p
SET comments = COALESCE(c.comment_count, 0)
FROM (
  SELECT post_id, COUNT(*)::INTEGER AS comment_count
  FROM public.comments
  GROUP BY post_id
) c
WHERE p.id = c.post_id;

-- Ensure posts with no comments are explicitly reset to 0
UPDATE public.posts
SET comments = 0
WHERE id NOT IN (
  SELECT DISTINCT post_id
  FROM public.comments
  WHERE post_id IS NOT NULL
);

-- Keep posts.comments in sync with comments changes
CREATE OR REPLACE FUNCTION public.sync_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments = comments + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments = GREATEST(comments - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.post_id IS DISTINCT FROM OLD.post_id THEN
      UPDATE public.posts
      SET comments = GREATEST(comments - 1, 0)
      WHERE id = OLD.post_id;

      UPDATE public.posts
      SET comments = comments + 1
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_comments_count ON public.comments;

CREATE TRIGGER trg_sync_post_comments_count
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.sync_post_comments_count();

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Verify stored counts match actual comments
SELECT
  p.id,
  p.title,
  p.comments AS stored_comments,
  COALESCE(c.actual_comments, 0) AS actual_comments
FROM public.posts p
LEFT JOIN (
  SELECT post_id, COUNT(*)::INTEGER AS actual_comments
  FROM public.comments
  GROUP BY post_id
) c ON c.post_id = p.id
WHERE p.comments <> COALESCE(c.actual_comments, 0)
ORDER BY p.created_at DESC;
```

### Public Schema API Grants

> **Supabase change (effective May 30 2026 for new projects, October 30 2026 enforced for all):**
> New tables in the `public` schema are **not** exposed to the Data API (PostgREST / supabase-js) by default.
> Run the SQL below once in the Supabase SQL Editor — or re-run it whenever you add a new table.

```sql
-- Schema visibility
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Table-level grants (RLS still enforces per-row rules)
GRANT SELECT ON public.users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated;

GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;

GRANT SELECT ON public.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

GRANT SELECT ON public.tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;

GRANT SELECT ON public.post_tags TO anon, authenticated;
GRANT INSERT, DELETE ON public.post_tags TO authenticated;

GRANT SELECT ON public.post_likes TO anon, authenticated;
GRANT INSERT, DELETE ON public.post_likes TO authenticated;

GRANT SELECT ON public.bookmarks TO authenticated;
GRANT INSERT, DELETE ON public.bookmarks TO authenticated;

-- Sequence grants (needed for INSERT with uuid/serial defaults)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- RPC / function grants
GRANT EXECUTE ON FUNCTION public.toggle_post_like(uuid)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_post_comments_count() TO authenticated;

-- Future-proof: any new table/function created in public inherits these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO authenticated, anon;
```

## Design System (NEVER CHANGE)

### Color Palette
```typescript
const colors = {
  primary: '#F8FAFC',      // Background
  secondary: '#0F172A',    // Text
  accent: '#3B82F6',       // Blue
  border: '#E2E8F0',       // Gray
};
```

### Typography
- Font: Inter (Google Fonts) as primary
- Optional alternate font: Acme (toggle from header)
- Do not introduce additional font families beyond Inter and Acme

## Code Patterns

### 1. Component Pattern
```typescript
import React from 'react';
import { cn } from '@/utils/helpers';

interface Props {
  title: string;
  className?: string;
}

export const Component: React.FC<Props> = ({ title, className }) => {
  return (
    <div className={cn('base-classes', className)}>
      {title}
    </div>
  );
};
```

**Rules:**
- Use `React.FC<Props>`
- Always accept `className`
- Use `cn()` for class merging
- Named exports only

### 2. Input Component Pattern
```typescript
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

const { register, formState: { errors } } = useForm();

// With optional label and error props
<Input
  id="email"
  type="email"
  label={t(TranslationKey.EMAIL)}
  placeholder="you@example.com"
  error={errors.email?.message}
  {...register('email')}
  disabled={isLoading}
/>

// With custom styling (labelClassName, className, containerClassName)
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

**Input Features:**
- Optional `label` prop - renders Label automatically
- Optional `error` prop - displays validation error message
- Customizable styling (className, labelClassName, containerClassName)
- React Hook Form compatible
- Disabled state support
- Backward compatible (works without label/error)

### 3. File Upload Pattern
```typescript
import { FileUpload } from '@/components/ui/file-upload';

// In component
const [avatarUrl, setAvatarUrl] = useState<string>('');

<FileUpload
  value={avatarUrl}
  onChange={setAvatarUrl}
  bucket="avatars"
  maxSize={0.5}  // 500KB
  accept="image/*"
/>
```

**FileUpload Features:**
- Real-time progress (0-100%)
- Image preview with Change/Remove
- Supabase Storage integration
- Bilingual labels (EN/BN)
- Error handling with user feedback

### 4. Toast Notification Pattern
```typescript
import { useGlobalToast } from '@/contexts/ToastContext';

const { success, error, warning, info } = useGlobalToast();

// Show notifications
success('Success!', 'Operation completed');
error('Error!', 'Something went wrong');
```

**Rules:**
- Use global toast instead of inline errors
- Toast auto-dismisses after 5 seconds
- Position: top-right

### 4.1 Memory Safety Pattern

**isMounted guard for async state updates:**
```typescript
import { useEffect, useRef } from 'react';

const isMountedRef = useRef(true);

useEffect(() => {
  return () => { isMountedRef.current = false; };
}, []);

// In async callbacks, always check before setState
const loadData = async () => {
  const result = await fetchSomething();
  if (!isMountedRef.current) return;
  setData(result);
};
```

**Required in:** any component that awaits async operations and then sets local state (e.g., `useState` for loading, error, or result values). Zustand store updates do NOT need this guard.

**Timer / interval cleanup pattern:**
```typescript
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const timerRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);

useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current)    clearTimeout(timerRef.current);
  };
}, []);

// Store IDs on the ref, not in a local variable
intervalRef.current = setInterval(() => { ... }, 50);
timerRef.current    = setTimeout(() => { ... }, 2000);
```

**Cap growing arrays in long-running components:**
```typescript
const MAX_ITEMS = 100;

setItems(prev => {
  const next = [...prev, newItem];
  return next.length > MAX_ITEMS ? next.slice(next.length - MAX_ITEMS) : next;
});
```

**Used in:** `ChatBot.tsx` — caps the `messages` array at 100 entries.

**Rules:**
- Always use `useRef` (not a local `const`) for timer IDs so the cleanup `useEffect` can cancel them
- Never set state from `FileReader.onload`, `setTimeout`, or `setInterval` callbacks without an `isMountedRef` check
- Dead-code `useEffect` hooks with no side effects must be removed entirely
- Do NOT add these guards to Zustand store actions — stores are singletons outside React lifecycle

### 5. Internationalization Pattern
```typescript
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const { t, language, setLanguage } = useTranslation();

// Use translation keys (defined in i18n.ts)
<h1>{t(TranslationKey.WELCOME)}</h1>
<button onClick={() => setLanguage('bn')}>বাংলা</button>
```

**Rules:**
- All text MUST use translation keys
- Keys defined in `src/i18n.ts` enum
- Run `npm run extract:i18n` to verify keys
- Stored in localStorage as `devcanvas-language`

### 6. Theme Pattern
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { theme, setTheme } = useTheme();

// Toggle theme
<button onClick={() => setTheme('dark')}>Dark</button>
<button onClick={() => setTheme('light')}>Light</button>
<button onClick={() => setTheme('system')}>System</button>
```

**Rules:**
- Themes: 'light' | 'dark' | 'system'
- Stored in localStorage as `devcanvas-theme`
- CSS variables in globals.css handle colors
- .dark class toggles on <html>

### 6.1 Font Family Pattern
```typescript
import { useFontFamily } from '@/hooks/useFontFamily';

const { fontFamily, toggleFontFamily } = useFontFamily();

<button onClick={toggleFontFamily}>
  {fontFamily === 'inter' ? 'Acme' : 'Inter'}
</button>
```

**Rules:**
- Supported fonts: `'inter' | 'acme'`
- Persist preference in localStorage as `devcanvas-font-family`
- Toggle `font-acme` class on `<html>` for global activation
- Keep logic inside `useFontFamily` instead of duplicating in layout components

### 7. RichTextEditor Pattern
```typescript
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(50, 'Content must be at least 50 characters'),
});

const { control, formState: { errors } } = useForm({
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
      placeholder="Start writing..."
    />
  )}
/>
```

**RichTextEditor Features:**
- Optional label & error props
- Bold, Italic, Strikethrough, Headings, Lists, Quotes, Code blocks
- Color picker with preset colors
- Link & image insertion
- Undo/Redo functionality
- Read-only mode support (editable={false})
- Controller/React Hook Form compatible

### 8. Dialog Form Reset Pattern
```typescript
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MyDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, formState: { errors }, reset, handleSubmit } = useForm();

  // Reset form and validation errors when modal is closed
  useEffect(() => {
    if (!open) {
      reset();
      setShowPassword(false);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

**Key Rules:**
- Call `reset()` when modal closes (`!open`) to clear all validation errors
- Reset other local state (password visibility, selected colors, etc.)
- Include `reset` in dependency array to avoid stale closures

### 8.1 Emoji Picker Pattern
```typescript
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const { t } = useTranslation();

<EmojiPicker
  buttonLabel={t(TranslationKey.INSERT_EMOJI)}
  onEmojiSelect={(emoji) => {
    // Insert at cursor for textarea inputs
    // Insert via editor chain for rich text editors
  }}
/>
```

**Rules:**
- Reuse `EmojiPicker` instead of duplicating emoji panel logic
- Always use `TranslationKey.INSERT_EMOJI` for label/title text
- Keep emoji insertion logic in the parent surface (`textarea`, `tiptap`, etc.)

### 8.2 Unsaved Changes Pattern
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/common/UnsavedChangesDialog';

const [formIsDirty, setFormIsDirty] = useState(false);
const { showDialog, confirmNavigation, cancelNavigation, allowNavigation } =
  useUnsavedChanges(formIsDirty && !isLoading);

// Before navigate after save
allowNavigation();
navigate('/dashboard');

<PostForm onDirtyChange={setFormIsDirty} />
<UnsavedChangesDialog
  open={showDialog}
  onConfirm={confirmNavigation}
  onCancel={cancelNavigation}
/>
```

**Rules:**
- Reuse `useUnsavedChanges` for create/edit forms instead of page-local blockers
- Reuse `UnsavedChangesDialog` instead of creating new confirmation modals
- Feed the hook a stable dirty signal from normalized form values so untouched rich-text forms do not show false positives
- Call `allowNavigation()` before successful programmatic navigation after save/publish

### 9. Pagination Pattern (Load More)
```typescript
import { LoadMoreButton } from '@/components/common/LoadMoreButton';

const { posts, pagination, loadMorePosts, resetPagination } = useBlogStore();

// Initial load
useEffect(() => {
  resetPagination();
  fetchPosts();
}, []);

// Load more button
const hasMore = pagination.page < pagination.totalPages;
<LoadMoreButton 
  isLoading={isLoading} 
  hasMore={hasMore}
  onLoadMore={loadMorePosts}
  currentCount={posts.length}
  totalCount={pagination.total}
/>
```

**Pagination Rules:**
- 9 posts per page (3x3 grid)
- Append mode: new posts added to list
- Shows "X of Y posts" counter
- Auto-hides when all loaded
- Use `VirtualizedGrid` for large card lists (including blog list and dashboard)

### 10. Blog Search Pattern
```typescript
import { SearchBar } from '@/components/common/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';

const [searchQuery, setSearchQuery] = useState('');
const debouncedSearchQuery = useDebounce(searchQuery, 400);

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  onClear={() => setSearchQuery('')}
  placeholder={t(TranslationKey.SEARCH_POSTS_PLACEHOLDER)}
  clearButtonLabel={t(TranslationKey.CLEAR_SEARCH)}
  helperText={searchHelperText}
/>
```

**Search Rules:**
- Use debounced query updates before fetching posts
- Keep search text readable in dark mode with explicit foreground classes
- Keep load-more behavior in sync with the active search query
- All visible search text must use translation keys

### 10.1 Author Hover Card Pattern
```typescript
import { AuthorHoverCard } from '@/components/common/AuthorHoverCard';
import { useBlogStore } from '@/stores/blogStore';

const { fetchAuthorPublishedPostCount } = useBlogStore();

<div className="relative group/author" onMouseEnter={() => void handleAuthorHover()}>
  <AuthorHoverCard
    authorName={post.author?.name}
    authorAvatarUrl={post.author?.avatar_url}
    authorInitial={authorInitial}
    totalPosts={authorPostCount}
    isLoading={isAuthorPostCountLoading}
  />
</div>
```

**Rules:**
- Reuse `AuthorHoverCard` for author hover previews instead of inline duplicated markup
- Load author totals lazily on hover with `fetchAuthorPublishedPostCount(authorId)` from `blogStore`
- Keep fallback initial style consistent with the header avatar fallback (`bg-accent`, `text-accent-foreground`)

### 10.2 Analytics Chart Pattern
```typescript
import { LineChartView } from '@/components/common/LineChartView';
import { BarChartView } from '@/components/common/BarChartView';
import { PieChartView } from '@/components/common/PieChartView';
import type { AnalyticsMonthlyDataPoint } from '@/types';
```

**Rules:**
- Use shared chart wrappers for analytics pages instead of duplicating Recharts setup
- Keep analytics interfaces in `src/types/index.ts` and import where needed
- Use tooltip styles that remain readable in both light and dark mode
- Avoid dense rotated X-axis labels in narrow cards; hide or simplify labels when needed

### 10. Zustand Store Pattern
```typescript
import { create } from 'zustand';

interface State {
  data: Item[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  fetchData: (page?: number, append?: boolean) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  resetPagination: () => void;
  clearError: () => void;
}

export const useStore = create<State>((set, get) => ({
  data: [],
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 9, total: 0, totalPages: 0 },
  
  fetchData: async (page = 1, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const from = (page - 1) * 9;
      const to = from + 8;
      
      const { data, error, count } = await supabase
        .from('table')
        .select('*', { count: 'exact' })
        .range(from, to);
      
      if (error) throw error;
      
      set(state => ({
        data: append ? [...state.data, ...data] : data,
        pagination: {
          page,
          limit: 9,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / 9),
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  loadMorePosts: async () => {
    const { pagination } = get();
    if (pagination.page < pagination.totalPages) {
      await get().fetchData(pagination.page + 1, true);
    }
  },
  
  resetPagination: () => set({ 
    data: [], 
    pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } 
  }),
  
  clearError: () => set({ error: null }),
}));
```

**Rules:**
- ALWAYS include: data, isLoading, error, pagination
- ALWAYS use try-catch
- ALWAYS have clearError
- Append mode for pagination

### 11. Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(5),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

**Rules:**
- Always use Zod for validation
- Use `z.infer` for types
- Display error messages

### 12. Password Input Pattern
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
      label={t(TranslationKey.PASSWORD)}
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

**For multiple password fields:**
```typescript
const [showPasswords, setShowPasswords] = useState({
  password: false,
  confirm: false,
});

<PasswordInput
  id="password"
  label={t(TranslationKey.PASSWORD)}
  visible={showPasswords.password}
  onVisibilityChange={(visible) =>
    setShowPasswords(prev => ({ ...prev, password: visible }))
  }
  disabled={isLoading}
  error={errors.password?.message}
  {...register('password')}
/>
```

**Key Features:**
- Password visibility toggle (Eye/EyeOff icons)
- React Hook Form compatible
- Error message display
- Disabled state support
- Customizable via className props
- Accessibility features (aria-labels)

### 13. Like/Unlike Pattern (RPC)
```typescript
// Toggle like
const { error } = await supabase.rpc('toggle_post_like', { 
  p_post_id: postId 
});

if (error) throw error;

// Refresh post to get updated count
await fetchPostById(postId);
```

**Rules:**
- Use RPC function `toggle_post_like`
- Always refresh post after toggle
- Handle errors with toast

### 14. Comments Pattern
```typescript
// Fetch comments
const { data, error } = await supabase
  .from('comments')
  .select(`
    *,
    author:users(id, name, avatar_url)
  `)
  .eq('post_id', postId)
  .order('created_at', { ascending: false });

// Create comment
const { error } = await supabase
  .from('comments')
  .insert({
    post_id: postId,
    author_id: user.id,
    content: content,
    parent_id: parentId || null,
  });
```

**Rules:**
- Nested comments use `parent_id`
- Always select author info
- Order by created_at DESC

### 13. Storage Upload Pattern
```typescript
// Upload to Supabase Storage
const uploadFile = async (file: File, bucket: string) => {
  const userId = user.id;
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return publicUrl;
};
```

**Rules:**
- Use user ID for folder structure
- Timestamp for unique filenames
- Get public URL after upload
- Buckets: 'avatars' or 'featured-images'
```typescript
import { create } from 'zustand';

interface State {
  data: Item[];
  isLoading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  clearError: () => void;
}

export const useStore = create<State>((set) => ({
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
  
  clearError: () => set({ error: null }),
}));
```

**Rules:**
- Always include: data, isLoading, error
- Always use try-catch
- Always have clearError

### 3. Form Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(5),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

**Rules:**
- Always use Zod for validation
- Use `z.infer` for types
- Display error messages

## Styling Rules

### Use ONLY Tailwind CSS
```typescript
// ✅ CORRECT
<div className="flex items-center gap-4 p-4 rounded-lg">

// ❌ WRONG - No inline styles
<div style={{ display: 'flex' }}>

// ❌ WRONG - No CSS modules
import styles from './Component.module.css';
```

### Mobile-First
```typescript
// ✅ CORRECT
className="text-sm md:text-base lg:text-lg"

// ❌ WRONG
className="text-lg md:text-base sm:text-sm"
```

## Database (Supabase)

### Tables Structure
```sql
-- users: User profiles
-- posts: Blog posts with views/likes/comments
-- comments: Nested comments on posts
-- categories: Post categories
-- tags: Post tags
-- post_tags: Many-to-many junction
-- post_likes: Track user likes
```

### Query Pattern
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true);

if (error) throw error;
return data;
```

**Rules:**
- Always destructure data and error
- Always check error
- Never skip error handling

### RPC Functions
```typescript
// Increment views
await supabase.rpc('increment_post_views', { p_post_id: id });

// Toggle like
await supabase.rpc('toggle_post_like', { p_post_id: id });
```

**Rules:**
- Use RPC for increment/toggle operations
- Always refresh data after RPC
- Handle errors with toast notifications

## File Structure

```
src/
├── components/
│   ├── ui/              # Shadcn components
│   │   ├── file-upload.tsx    # File upload with progress
│   │   ├── button.tsx
│   │   └── ...
│   ├── common/          # Reusable components
│   │   ├── LoadMoreButton.tsx  # Pagination button
│   │   ├── RichTextEditor.tsx  # Tiptap editor (CodeBlockLowlight + language selector)
│   │   ├── TableOfContents.tsx # Sticky TOC sidebar + mobile accordion
│   │   └── ...
│   └── layout/          # Header, Footer
├── features/
│   ├── auth/            # Login, Signup
│   ├── blog/            # Blog posts
│   ├── dashboard/       # Analytics
│   ├── profile/         # User profile with avatar
│   └── comments/        # Comment system
├── contexts/
│   ├── ToastContext.tsx     # Global toast
│   └── ThemeContext.tsx     # Theme management
├── hooks/               # Custom hooks
│   ├── useTranslation.ts    # i18n hook
│   ├── useTableOfContents.ts # Extracts & IDs h1/h2/h3 nodes from a content ref
│   └── ...
├── stores/              # Zustand stores
│   ├── authStore.ts
│   ├── blogStore.ts
│   └── contentStore.ts
├── types/               # TypeScript types
├── utils/               # Helpers
├── i18n.ts              # Translation keys
└── lib/
    └── supabase.ts      # Supabase client
```

## Table of Contents Pattern

```typescript
import { TableOfContents } from '@/components/common/TableOfContents';
import { useTableOfContents } from '@/hooks/useTableOfContents';

// In BlogPostPage:
const contentRef = useRef<HTMLDivElement | null>(null);
const headings = useTableOfContents(contentRef, currentPost?.id);

// Desktop sidebar (xl+)
<aside className="hidden xl:block">
  <TableOfContents headings={headings} variant="desktop" onNavigate={() => setIsContentExpanded(true)} />
</aside>

// Mobile collapsible (below xl)
<div className="xl:hidden">
  <TableOfContents headings={headings} variant="mobile" onNavigate={() => setIsContentExpanded(true)} />
</div>
```

**Rules:**
- Use `variant="desktop"` in the sidebar `aside` (hidden below xl) and `variant="mobile"` in main content flow (hidden at xl+)
- Never render `variant="both"` on `BlogPostPage` — it causes duplicate display
- `useTableOfContents` mutates DOM IDs on heading elements; call it with a stable `dep` (e.g., `currentPost?.id`) to re-run on post change
- The scroll listener in `TableOfContents` is cleaned up on unmount — do not remove the cleanup
- Click handler scrolls to `getBoundingClientRect().top + scrollY - 80` to clear the fixed navbar
- `scroll-margin-top: 80px` on `.prose h1/h2/h3/h4` in `globals.css` handles anchor navigation

## Code Syntax Highlighting Pattern

**Editor (Tiptap):**
```typescript
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

// In useEditor extensions:
StarterKit.configure({ codeBlock: false }), // disable built-in
CodeBlockLowlight.configure({ lowlight }),    // add lowlight-powered version
```

**Viewer (BlogPostPage):**
```typescript
import hljs from 'highlight.js';

useEffect(() => {
  const el = contentRef.current;
  if (!el) return;
  el.querySelectorAll<HTMLElement>('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}, [currentPost?.id]);
```

**Rules:**
- Pin `@tiptap/extension-code-block-lowlight` to `^2.x` — v3 requires `@tiptap/core@3.x` and is incompatible
- Language selector (`<select>`) shown in toolbar only when `editor.isActive('codeBlock')` — uses `updateAttributes('codeBlock', { language })`
- hljs token CSS lives in `globals.css` — GitHub-inspired light/dark palette; do not use a separate hljs theme stylesheet
- The `.hljs { background: transparent !important; }` rule ensures our custom `pre` background shows through

## Import Order

```typescript
// 1. React
import React from 'react';

// 2. Third-party
import { useForm } from 'react-hook-form';

// 3. Internal (use @/ alias)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 4. Types
import type { BlogPost } from '@/types';
```

## TypeScript Rules

- NO `any` types
- Define interfaces for props
- Type all function returns
- Use strict mode

## Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

try {
  await action();
} catch (err: any) {
  setError(err.message);
}

{error && (
  <div className="p-3 bg-destructive/10 text-destructive">
    {error}
  </div>
)}
```

## Common Mistakes to AVOID

❌ Don't use `any` type
❌ Don't use inline styles
❌ Don't skip error handling
❌ Don't forget loading states
❌ Don't mutate state directly
❌ Don't use default exports for components
❌ Don't hardcode text (use translation keys)
❌ Don't use inline error messages (use toast)

## What to ALWAYS Include

✅ TypeScript types
✅ Error handling with toast
✅ Loading states
✅ className prop
✅ Proper imports
✅ Tailwind classes
✅ Translation keys (not hardcoded text)
✅ Dark mode compatible colors

## Key Features Implementation

### FileUpload Component
- Component: `<FileUpload>` from `@/components/ui/file-upload`
- Optional label prop - displays in upload area
- Optional error prop - shows external validation errors
- Buckets: 'avatars' (500KB) or 'featured-images' (500KB)
- Real-time progress, preview, change/remove buttons
- Bilingual support (EN/BN)

### Input Component
- Component: `<Input>` from `@/components/ui/input`
- Optional label prop - renders Label automatically
- Optional error prop - displays validation error message
- Customizable styling via className, labelClassName, containerClassName
- React Hook Form compatible (spreads register props)
- Backward compatible - works without label/error props
- Used in: LoginPage, SignupPage, ForgotPasswordPage, PostForm, ProfilePage

### RichTextEditor Component
- Component: `<RichTextEditor>` from `@/components/common/RichTextEditor`
- Optional label prop - displays above editor
- Optional error prop - displays error message below editor
- Rich formatting toolbar (Bold, Italic, Strikethrough, Headings, Lists, Quotes, Code)
- Color picker with preset colors
- Link & image insertion support
- Undo/Redo functionality
- Read-only mode support (editable={false})
- Minimum 300px height with prose styling
- Used in: PostForm - Content creation

### Pagination
- Component: `<LoadMoreButton>` from `@/components/common/LoadMoreButton`
- Page size: 9 posts
- Append mode (adds to existing list)
- Shows "X of Y posts" counter

### Password Input
- Component: `<PasswordInput>` from `@/components/ui/password-input`
- Password visibility toggle with Eye/EyeOff icons
- React Hook Form compatible (spreads register props)
- Error message display with validation feedback
- Disabled state support for loading
- Customizable styling via className props
- Used in: LoginPage, SignupPage, ResetPasswordPage, UpdatePasswordDialog

### Toast Notifications
- Hook: `useGlobalToast()` from `@/contexts/ToastContext`
- Types: success, error, warning, info
- Auto-dismiss after 5 seconds
- Position: top-right

### Internationalization
- Hook: `useTranslation()` from `@/hooks/useTranslation`
- Keys: Enum in `src/i18n.ts`
- Languages: 'en' | 'bn'
- Verify: `npm run extract:i18n`

### Theme System
- Hook: `useTheme()` from `@/contexts/ThemeContext`
- Options: 'light' | 'dark' | 'system'
- CSS variables in globals.css
- .dark class on <html>

### Comments
- Table: `comments` with `parent_id` for nesting
- Always join with author info
- Order by created_at DESC
- RLS: authenticated users can create

### Likes
- Table: `post_likes` (unique per user/post)
- RPC: `toggle_post_like(p_post_id)`
- Updates `posts.likes` count
- Shows liked state in UI

## When suggesting code:
1. Follow these patterns strictly
2. Use existing components (FileUpload, LoadMoreButton, etc.)
3. Use translation keys, not hardcoded text
4. Use toast for user feedback
5. Include error handling
6. Add TypeScript types
7. Support dark mode
8. Include loading states
