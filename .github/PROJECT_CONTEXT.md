# DevCanvas Blog - Project Context for AI Assistants

This file helps GitHub Copilot understand the project structure and conventions.

## Project Type
Full-stack blog platform with:
- File upload system (avatars & featured images)
- Infinite scroll pagination (Load More)
- Post search (debounced, Medium-style search bar)
- Multilingual support (EN/BN)
- Dark mode (Light/Dark/System)
- Comments system (nested)
- Like system (toggle with RPC)
- Rich text editor (Tiptap)

## Key Technologies
- **Frontend:** React 18 + TypeScript + Vite (port 3012) + Tailwind CSS
- **State:** Zustand (global) + React Hook Form (forms) + Toast Context
- **Validation:** Zod schemas
- **UI:** Shadcn/ui components (Radix UI)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Editor:** Tiptap for rich text
- **i18n:** Custom translation system with enum keys

## Architecture
Micro-frontend with feature-based modules:
- `features/auth` - Authentication
- `features/blog` - Blog posts
- `features/dashboard` - Analytics
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
- **Inter only** - No other fonts

## Import Aliases
- `@/components` → `src/components`
- `@/hooks` → `src/hooks`
- `@/stores` → `src/stores`
- `@/utils` → `src/utils`
- `@/types` → `src/types`

## Database Tables
- `users` - User profiles (with avatar_url)
- `posts` - Blog posts (with views, likes, featured_image)
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

## Common Patterns

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

const { posts, pagination, loadMorePosts } = useBlogStore();

<LoadMoreButton 
  isLoading={isLoading}
  hasMore={pagination.page < pagination.totalPages}
  onLoadMore={loadMorePosts}
  currentCount={posts.length}
  totalCount={pagination.total}
/>
```

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
```

## Common Commands
```bash
npm run dev      # Start development
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Check code quality
```

This context helps Copilot generate code that matches project conventions.
