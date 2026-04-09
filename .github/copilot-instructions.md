# GitHub Copilot Instructions - DevCanvas Blog

## Project Overview
You are assisting with **DevCanvas Blog** - a production-ready, full-stack blogging platform with:
- **File Upload System**: Avatar & featured image uploads with Supabase Storage
- **Infinite Scroll**: Load More pagination (9 posts per page)
- **Multilingual**: English and Bangla support with runtime switching
- **Dark Mode**: Light/Dark/System theme with persistence
- **Comments System**: Nested comments on blog posts
- **Like System**: Post likes with real-time tracking
- **Rich Text Editor**: Tiptap with full formatting support
- **Analytics**: Dashboard with views, likes, and engagement metrics

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
- Tiptap 2.x (rich text editor)
- Custom FileUpload component (with progress tracking)

### Backend & Storage
- Supabase (PostgreSQL + Auth + Storage)
- Supabase Storage buckets:
  - `avatars` (500KB limit, public)
  - `featured-images` (500KB limit, public)

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
- Font: Inter (Google Fonts) - ONLY this font
- No Arial, Roboto, or system fonts

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

### 2. File Upload Pattern
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

### 3. Toast Notification Pattern
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

### 4. Internationalization Pattern
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

### 5. Theme Pattern
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

### 6. Pagination Pattern (Load More)
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

### 7. Zustand Store Pattern
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

### 8. Form Pattern
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

### 9. Like/Unlike Pattern (RPC)
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

### 10. Comments Pattern
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

### 11. Storage Upload Pattern
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
-- posts: Blog posts with views/likes
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
│   │   ├── RichTextEditor.tsx  # Tiptap editor
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

### File Upload
- Component: `<FileUpload>` from `@/components/ui/file-upload`
- Buckets: 'avatars' (500KB) or 'featured-images' (500KB)
- Shows progress, preview, change/remove buttons
- Bilingual labels

### Pagination
- Component: `<LoadMoreButton>` from `@/components/common/LoadMoreButton`
- Page size: 9 posts
- Append mode (adds to existing list)
- Shows "X of Y posts" counter

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
