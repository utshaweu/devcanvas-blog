# DevCanvas Blog - Project Context for AI Assistants

This file helps GitHub Copilot understand the project structure and conventions.

## Project Type
Full-stack blog platform with:
- File upload system (avatars & featured images)
- Infinite scroll pagination (Load More)
- Virtualized post grid rendering for large lists
- Post search (debounced, Medium-style search bar)
- Multilingual support (EN/BN)
- Dark mode (Light/Dark/System)
- Comments system (nested)
- Like system (toggle with RPC)
- Rich text editor (Tiptap)
- Reusable emoji picker (shared in editor and comments)
- 404 error page (beautiful, animated)
- Header font family toggle (Inter/Acme with persistence)

## Key Technologies
- **Frontend:** React 18 + TypeScript + Vite (port 3012) + Tailwind CSS
- **State:** Zustand (global) + React Hook Form (forms) + Toast Context
- **Validation:** Zod schemas
- **UI:** Shadcn/ui components (Radix UI)
- **Emoji:** emoji-mart with shared `EmojiPicker` component
- **Virtualization:** react-virtuoso (`VirtualizedGrid`)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Editor:** Tiptap for rich text
- **i18n:** Custom translation system with enum keys

## Architecture
Micro-frontend with feature-based modules:
- `features/auth` - Authentication
- `features/blog` - Blog posts
- `features/dashboard` - Dashboard and post management
- `features/analytics` - Dedicated analytics charts
- `features/profile` - User profile with avatar
- `features/comments` - Comment system

## Component Conventions

### Standard Component
```typescript
import React from 'react';
import { cn } from '@/utils/helpers';

interface ComponentNameProps {
  title: string;
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  title, 
  className 
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {title}
    </div>
  );
};
```

### Custom Hook
```typescript
export function useCustomHook() {
  const [state, setState] = useState();
  
  return {
    state,
    action: () => {},
  };
}
```

### Zustand Store
```typescript
interface StoreState {
  data: Item[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
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

## Styling
- **ONLY Tailwind CSS** - No inline styles or CSS modules
- **Mobile-first** - Start with mobile breakpoints
- **Use cn()** - For conditional classes

## Color Palette
```typescript
primary: '#F8FAFC'      // Background
secondary: '#0F172A'    // Text
accent: '#3B82F6'       // Blue
border: '#E2E8F0'       // Gray
```

## Font
- **Inter primary with optional Acme**
- Use shared hook `useFontFamily` and localStorage key `devcanvas-font-family`

## Import Aliases
- `@/components` → `src/components`
- `@/hooks` → `src/hooks`
- `@/stores` → `src/stores`
- `@/utils` → `src/utils`
- `@/types` → `src/types`

## Database Tables
- `users` - User profiles (with avatar_url)
- `posts` - Blog posts (with views, likes, comments, featured_image)
- `comments` - Nested comments (with parent_id)
- `categories` - Post categories
- `tags` - Post tags
- `post_tags` - Junction table
- `post_likes` - User likes (unique constraint)

## Storage Buckets
- `avatars` - User avatars (500KB max, public)
- `featured-images` - Post images (500KB max, public)

## RPC Functions
```sql
-- Increment post views
increment_post_views(p_post_id UUID)

-- Toggle like (add/remove)
toggle_post_like(p_post_id UUID)
```

## Comments Counter Migration

Use this SQL in Supabase to keep `posts.comments` updated automatically:

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

-- Keep posts.comments in sync with comments changes
CREATE OR REPLACE FUNCTION public.sync_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
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
```

## Common Patterns

### Reusable Analytics Charts
Use shared chart wrappers from `components/common` to avoid repeating Recharts setup:

- `LineChartView.tsx`
- `BarChartView.tsx`
- `PieChartView.tsx`

Analytics chart interfaces should be centralized in `src/types/index.ts` and imported by pages/components.

Rules:
- Ensure tooltip contrast works in both light and dark themes
- Avoid overflowing X-axis labels in compact chart cards

### SearchBar Component
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

Rules:
- Use debounced search input before requesting posts
- Preserve load-more pagination behavior while searching
- Ensure dark-mode readability for input text, placeholder, and helper text
- Use translation keys for all search UI strings

### Input Component
```typescript
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

const { register, formState: { errors } } = useForm();

// With label and error
<Input
  id="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error={errors.email?.message}
  {...register('email')}
  disabled={isLoading}
/>

// Backward compatible - without label/error
<Input
  id="search"
  type="text"
  placeholder="Search..."
  {...register('search')}
/>
```

### Password Input
```typescript
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';

const [showPassword, setShowPassword] = useState(false);

<PasswordInput
  id="password"
  label="Password"
  placeholder="••••••••"
  visible={showPassword}
  onVisibilityChange={setShowPassword}
  error={errors.password?.message}
  {...register('password')}
/>
```

### File Upload
```typescript
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  value={avatarUrl}
  onChange={setAvatarUrl}
  bucket="avatars"
  maxSize={0.5}
  accept="image/*"
/>
```

### Toast Notifications
```typescript
import { useGlobalToast } from '@/contexts/ToastContext';

const { success, error } = useGlobalToast();
success('Done!', 'Operation completed');
```

### Translation (i18n)
```typescript
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const { t } = useTranslation();
<h1>{t(TranslationKey.WELCOME)}</h1>
```

### Theme Toggle
```typescript
import { useTheme } from '@/contexts/ThemeContext';

const { theme, setTheme } = useTheme();
<button onClick={() => setTheme('dark')}>Dark</button>
```

### RichTextEditor Component
```typescript
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { useForm, Controller } from 'react-hook-form';

const { control, formState: { errors } } = useForm();

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

### EmojiPicker Component
```typescript
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

const { t } = useTranslation();

<EmojiPicker
  buttonLabel={t(TranslationKey.INSERT_EMOJI)}
  onEmojiSelect={(emoji) => {
    // Handle insertion for textarea or editor
  }}
/>
```

Rules:
- Use this shared component instead of custom emoji picker logic in each feature.
- Keep insertion behavior in parent component (cursor-aware for textarea).
- Use translation key `INSERT_EMOJI` for user-facing label/title.

### Dialog Form Reset
```typescript
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const MyDialog = ({ open, onOpenChange }) => {
  const { register, reset, formState: { errors }, handleSubmit } = useForm();

  // Reset form and validation errors when modal is closed
  useEffect(() => {
    if (!open) {
      reset();
      // Reset other local state
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

### Load More Pagination
```typescript
import { LoadMoreButton } from '@/components/common/LoadMoreButton';
import { VirtualizedGrid } from '@/components/common/VirtualizedGrid';

const { posts, pagination, loadMorePosts } = useBlogStore();

<VirtualizedGrid
  items={posts}
  getItemKey={(post) => post.id}
  renderItem={(post) => <PostCard post={post} />}
/>

<LoadMoreButton 
  isLoading={isLoading}
  hasMore={pagination.page < pagination.totalPages}
  onLoadMore={loadMorePosts}
  currentCount={posts.length}
  totalCount={pagination.total}
/>
```

### 404 Error Page
```typescript
import { NotFound } from '@/components/common/NotFound';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

// The NotFound component is automatically integrated as the catch-all route
// In App.tsx routes:
<Route path="*" element={<NotFound />} />

// Component usage (for reference):
export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background with clipped blobs */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <h1>{t(TranslationKey.PAGE_NOT_FOUND)}</h1>
        <p>{t(TranslationKey.PAGE_NOT_FOUND_DESCRIPTION)}</p>
        <Button onClick={() => navigate('/')}>
          {t(TranslationKey.GO_HOME)}
        </Button>
      </div>
    </div>
  );
};
```

**Features:**
- Multilingual (EN/BN)
- Theme-aware (light/dark mode)
- Animated accent-colored blobs
- No horizontal scroll issues (overflow-hidden parent)
- Uses project Button component and colors

### Form with Validation
```typescript
const schema = z.object({
  title: z.string().min(5),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Supabase Query
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true);

if (error) throw error;
```

### Error Display
```typescript
{error && (
  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
    {error}
  </div>
)}
```

## TypeScript Rules
- No `any` types
- Define interfaces for all props
- Use strict mode

## File Naming
- Components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Stores: `storeName.ts`
- Utils: `camelCase.ts`

## Testing
- Test files: `Component.test.tsx`
- Use React Testing Library
- Mock Supabase in tests

## Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_MCP_WS_URL
SUPABASE_SERVICE_ROLE_KEY
```

Notes:
- `VITE_MCP_WS_URL` should be environment-specific:
  - local: `.env.local` -> `http://localhost:8080`
  - production: `.env.production` -> your deployed bridge URL
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only (MCP server/bridge runtime), not a client-side Vite variable.

## MCP Chatbot Architecture (Actual)
- Frontend: `src/components/common/ChatBot.tsx` + `src/hooks/useChatBot.ts`
  - `useChatBot` resolves `VITE_MCP_WS_URL`, opens WebSocket, sends MCP `initialize`, then calls tools based on keyword intent.
- Bridge: `mcp-websocket-bridge.js`
  - Bridges WebSocket JSON-RPC <-> MCP stdio, spawns `mcp-server.js` per client.
- Server: `mcp-server.js`
  - Supabase env precedence:
    - URL: `VITE_SUPABASE_URL` -> `SUPABASE_URL`
    - key: `SUPABASE_SERVICE_ROLE_KEY` -> `VITE_SUPABASE_ANON_KEY` -> `SUPABASE_ANON_KEY`
  - Implements tools: `get_posts_today`, `get_total_posts`, `get_published_posts`, `get_total_views`, `get_total_likes`, `get_popular_posts`, `get_recent_posts`, `get_categories`, `get_tags`, `get_comment_stats`.
  - Category/tag MCP counts are computed from live relations (`posts.category_id`, `post_tags`).

## Common Commands
```bash
npm run dev      # Start development
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Check code quality
```

This context helps Copilot generate code that matches project conventions.
