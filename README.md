# DevCanvas Blog Platform

A modern, full-featured blog platform built with React, TypeScript, and Supabase, following micro-frontend architecture principles.

## 🚀 Features

- **Authentication & Authorization**: Secure user authentication with Supabase
- **Password Management**: Secure password update dialog in user profile dropdown
- **Rich Text Editor**: Powerful content creation with Tiptap
- **File Upload System**: Beautiful file upload with progress tracking for avatars
- **Supabase Storage**: Integrated cloud storage for user avatars and images
- **Modern UI**: Beautiful interface using Shadcn/ui components
- **State Management**: Efficient state handling with Zustand
- **Type Safety**: Full TypeScript support throughout
- **Form Validation**: Robust validation with React Hook Form and Zod
- **Comments System**: Nested comments on blog posts with full CRUD operations and row-level security
- **Like System**: Post likes with real-time tracking and user engagement
- **Analytics Dashboard**: Track views, likes, and engagement
- **Post Search**: Medium-style debounced search on blog list with Load More compatibility
- **Responsive Design**: Mobile-first, works on all devices
- **Multilingual**: English and Bangla support with runtime switching
- **Infinite Scroll Pagination**: Load More button for seamless content browsing (9 posts per page)
- **Testing Ready**: Jest and React Testing Library configured

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 5.x
- **Routing**: React Router DOM v6
- **State Management**: Zustand 4.x
- **Form Management**: React Hook Form 7.x
- **Validation**: Zod 3.x
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.x
- **Rich Text Editor**: Tiptap 2.x
- **Icons**: Lucide React
- **Charts**: Recharts 2.x

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for avatars and images)
  - File upload with progress tracking
  - Image preview and management
  - 500KB limit for avatars, 500KB for featured images

### Testing
- **Unit Tests**: Jest 29.x
- **Component Tests**: React Testing Library 14.x
- **Test Utilities**: @testing-library/jest-dom

### Development Tools
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript 5.x
- **CSS Processing**: PostCSS with Autoprefixer

## 📁 Project Structure

```
devcanvas-blog/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx                # Form input with label & error props
│   │   │   ├── dialog.tsx               # Dialog modal component
│   │   │   ├── password-input.tsx       # Password field with visibility toggle
│   │   │   ├── file-upload.tsx          # File upload with progress
│   │   │   └── ...
│   │   ├── common/         # Common reusable components
│   │   └── layout/         # Layout components (Header, Footer)
│   ├── features/           # Feature-based modules (micro-frontends)
│   │   ├── auth/          # Authentication features
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── UpdatePasswordDialog.tsx  # Password update modal
│   │   ├── blog/          # Blog post features
│   │   ├── dashboard/     # Dashboard features
│   │   ├── profile/       # User profile with avatar upload
│   │   └── analytics/     # Analytics features
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party library configurations
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   └── assets/            # Static assets
├── public/                # Public static files
└── tests/                 # Test files

```

## 🎨 Design System

### Color Palette (Modern Tech Theme)

- **Primary Background**: `#F8FAFC` (Off-white/Gray)
- **Secondary Text**: `#0F172A` (Deep Navy - easier on eyes)
- **Accent**: `#3B82F6` (Electric Blue)
- **Border/Muted**: `#E2E8F0` (Soft Gray)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Features**: Variable font with multiple weights (300-900)
- **Font Features**: CV02, CV03, CV04, CV11 for improved readability

## 💬 Comments System

The application features a comprehensive nested comments system on blog posts:

- **Nested Comments**: Support for parent comments and replies
- **Full CRUD Operations**: Create, read, update, and delete comments
- **Real-time Updates**: Supabase subscriptions for live comment updates
- **Row-Level Security (RLS)**:
  - Anyone can read comments on published posts
  - Authenticated users can create comments on published posts
  - Users can only update/delete their own comments
  - Comments are automatically deleted when posts are deleted (CASCADE)
- **User Experience**:
  - Display author information with timestamps
  - Show parent comment context for replies
  - Beautiful comment threads with proper indentation
  - Toast notifications for all comment actions
- **Bilingual Support**: Available in English and Bengali
- **Database Table**: `comments` with fields:
  - `id` (UUID primary key)
  - `post_id` (reference to posts table)
  - `user_id` (reference to auth.users)
  - `parent_id` (for nested replies, references comments table)
  - `content` (comment text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## 👍 Like System

Post engagement tracking with real-time likes:

- **Post Likes**: Track user engagement on blog posts
- **Like Tracking**: Toggle likes with real-time count updates
- **Unique Constraints**: One like per user per post
- **Real-time Updates**: Supabase RPC function `toggle_post_like()` for atomic operations
- **Analytics**: Like counts aggregated in the posts table
- **User Experience**:
  - Visual feedback on liked status
  - Real-time like count updates
  - Toast notifications for like actions
- **Row-Level Security**: Authenticated users can manage their own likes
- **Database Table**: `post_likes` with:
  - Composite primary key (user_id, post_id)
  - Foreign key constraints for data integrity

## 🔐 Password Management

The application includes a secure password update feature integrated in the user profile dropdown:

- **Change Password Dialog**: Accessible from the user avatar dropdown menu in the header
- **Security Features**:
  - Current password verification required
  - New password must be 6+ characters
  - Confirmation password validation
  - Password visibility toggles
  - Prevents using same password as current one
- **User Experience**:
  - Beautiful modal dialog with smooth animations
  - Clear validation error messages
  - Loading states during submission
  - Toast notifications for success/error feedback
- **Bilingual Support**: Available in English and Bengali
- **Location**: `src/features/auth/UpdatePasswordDialog.tsx`

## 🚦 Getting Started

## 🌓 Theme / Dark Mode

This project supports Light, Dark, and System themes.

- Toggle: use the theme button in the header to cycle between `Light` → `Dark` → `System`.
- System: when `System` is selected the app follows your operating system color scheme (prefers-color-scheme). If you change your OS theme while `System` is active the UI will update automatically.
- Persistence: the selected theme is stored in `localStorage` under the key `devcanvas-theme` so your choice is remembered across visits.

Troubleshooting:

- If the UI does not match your OS when `System` is selected, try reloading the page and verify the value in the browser console:

```js
localStorage.getItem('devcanvas-theme')
```

- To force a specific theme from the console:

```js
localStorage.setItem('devcanvas-theme', 'dark') // or 'light' or 'system'
location.reload()
```

The theme implementation uses CSS custom properties (variables) so Tailwind-generated classes reference those variables and switch styles by toggling the `.dark` class on the document root.


### Prerequisites

### Internationalization

The app includes a simple i18n framework. Keys are defined in an `enum` (`src/i18n.ts`) and referenced via a `useTranslation` hook. To ensure keys stay in sync, a CLI helper extracts used keys from components:

```bash
npm run extract:i18n
```

The output reports missing or unused translation entries so you can clean up or add new strings.

A language selector appears in the header next to theme toggle and stores the choice in `localStorage` under `devcanvas-language`.

---

### Prerequisites

- Node.js 18+ or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd devcanvas-blog
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase Database**

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
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

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Tags junction table
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own record" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for posts
CREATE POLICY "Anyone can read published posts" ON posts FOR SELECT USING (published = true OR author_id = auth.uid());
CREATE POLICY "Users can create own posts" ON posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (author_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Anyone can read comments on published posts or own comments"
  ON comments
  FOR SELECT
  USING (
    (SELECT published FROM posts WHERE posts.id = comments.post_id) = true
    OR author_id = auth.uid()
  );
CREATE POLICY "Users can create own comments"
  ON comments
  FOR INSERT
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  USING (author_id = auth.uid());
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  USING (author_id = auth.uid());

-- RLS Policies for categories (read-only for everyone)
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);

-- RLS Policies for tags (read-only for everyone)
CREATE POLICY "Anyone can read tags" ON tags FOR SELECT USING (true);

-- RLS Policies for post_tags (read-only for everyone, managed through posts)
CREATE POLICY "Anyone can read post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage tags for own posts" ON post_tags 
  FOR ALL 
  USING ((SELECT author_id FROM posts WHERE posts.id = post_tags.post_id) = auth.uid());

-- Post Likes Feature Setup
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

-- RLS Policies for post_likes
CREATE POLICY "Users can view all likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create the toggle_post_like RPC function
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM post_likes 
    WHERE post_id = p_post_id 
    AND user_id = auth.uid()
  ) THEN
    -- Unlike: Remove the like and decrement count
    DELETE FROM post_likes 
    WHERE post_id = p_post_id 
    AND user_id = auth.uid();
    
    UPDATE posts 
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = p_post_id;
  ELSE
    -- Like: Add the like and increment count
    INSERT INTO post_likes (post_id, user_id)
    VALUES (p_post_id, auth.uid());
    
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

5. **Set up Supabase Storage** (for avatar uploads)

See [STORAGE_SETUP.md](./STORAGE_SETUP.md) for detailed instructions.

Quick setup via SQL:
```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 512000, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
  ('featured-images', 'featured-images', true, 512000, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies (see STORAGE_SETUP.md for complete policies)
CREATE POLICY "Allow public to read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Allow users to upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

6. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3012`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run extract:i18n` - Extract and verify translation keys

## 🏗️ Architecture

### Micro-Frontend Architecture

The project follows a feature-based architecture where each feature is self-contained:

- **Features are independent modules** with their own components, hooks, and logic
- **Shared components** live in `components/common` and `components/ui`
- **State management** is modular using Zustand stores
- **Easy to scale** by adding new features without affecting existing ones

### State Management Strategy

- **Auth State**: Global authentication state (Zustand with persistence)
- **Blog State**: Blog posts, categories, tags management
- **UI State**: Toast notifications, modals, loading states
- **Form State**: Local form state (React Hook Form)

### Toast Notification System

The application uses a global toast notification system for user feedback:

```typescript
import { useGlobalToast } from '@/contexts/ToastContext';

const { success, error, warning, info } = useGlobalToast();

// Show success message
success('Success!', 'Operation completed successfully');

// Show error message
error('Error!', 'Something went wrong');
```

**Best Practice**: Use toast notifications instead of inline error states for better UX.

### Component Patterns

1. **UI Components** (`components/ui/`): Primitive, reusable components
   - `input.tsx` - Form input with optional label and error props
   - `password-input.tsx` - Password field with visibility toggle (Eye/EyeOff icons)
   - `file-upload.tsx` - File upload with progress bar and preview
   - `button.tsx`, `card.tsx` - Base UI elements
2. **Common Components** (`components/common/`): Composed, reusable business components
3. **Feature Components** (`features/*/`): Feature-specific components
4. **Layout Components** (`components/layout/`): Page layout components

### Password Input Component

The app includes a reusable `PasswordInput` component for all password fields:

- **Password visibility toggle** with Eye/EyeOff icons
- **React Hook Form compatible** - spreads register props directly
- **Error message display** with validation feedback
- **Disabled state support** for loading states
- **Customizable styling** via className props
- **Accessibility features** (aria-labels, semantic HTML)
- **Bilingual support** (EN/BN)

Usage example:
```tsx
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const [showPassword, setShowPassword] = useState(false);
const { register, formState: { errors } } = useForm();

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
```

**Used in:**
- LoginPage - Password field
- SignupPage - Password & Confirm Password fields
- ResetPasswordPage - Password & Confirm Password fields
- UpdatePasswordDialog - Current, New, & Confirm Password fields

### Input Component

The app includes an enhanced `Input` component that supports optional `label` and `error` props:

- **Optional label prop** - Renders a Label component automatically
- **Optional error prop** - Displays error message with validation feedback
- **React Hook Form compatible** - spreads register props directly
- **Disabled state support** for loading states
- **Customizable styling** via className, labelClassName, containerClassName props
- **Backward compatible** - Works without label/error props for simple inputs
- **Bilingual support** (EN/BN) for labels

Usage example:
```tsx
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

// Without label/error (backward compatible)
<Input
  id="name"
  type="text"
  placeholder="Enter your name"
  {...register('name')}
/>
```

**Used in:**
- LoginPage - Email field
- SignupPage - Name & Email fields
- ForgotPasswordPage - Email field
- PostForm - Title & Excerpt fields
- ProfilePage - Name field (with custom styling)

### File Upload System

The app includes a beautiful file upload component with:

- **Real-time progress tracking** (0-100%)
- **Image preview** with Change/Remove buttons
- **Drag & drop ready** UI
- **File validation** (size & type)
- **Error handling** with user-friendly messages
- **Bilingual support** (EN/BN)
- **Supabase Storage integration**

Usage example:
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

### Pagination Pattern

The blog uses a "Load More" pagination strategy (similar to Facebook, Medium, Twitter):

- **Page Size**: 9 posts per page (optimized for 3-column grid)
- **Strategy**: Append mode - new posts are added to existing list
- **Components**: 
  - `LoadMoreButton` - Reusable button with loading/count states
  - Shows "Showing X of Y posts" counter
  - Automatically hides when all posts loaded
- **State Management**: 
  - `fetchPosts(page, limit, append)` - Fetch with optional append
  - `loadMorePosts()` - Convenience method to load next page
  - `resetPagination()` - Reset to page 1
- **Used In**: BlogListPage, DashboardPage (with filters)

### Blog Search Pattern

The blog list supports a reusable, responsive search experience:

- **Component**: `SearchBar` in `src/components/common/SearchBar.tsx`
- **Behavior**:
  - Debounced input via `useDebounce` (400ms)
  - Searches title, excerpt, and content
  - Keeps pagination and Load More behavior in sync with current query
- **Dark Mode**:
  - Explicit `text-foreground` and dark-mode text color classes for readable input text
  - Proper placeholder and caret contrast
- **i18n**:
  - Uses translation keys for placeholder, helper text, clear button, and result summary

Example usage:

```tsx
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

Example usage:
```typescript
const { posts, pagination, loadMorePosts, resetPagination } = useBlogStore();

// Initial load
useEffect(() => {
  resetPagination();
  fetchPosts();
}, []);

// Load more
const hasMore = pagination.page < pagination.totalPages;
<LoadMoreButton 
  isLoading={isLoading} 
  hasMore={hasMore}
  onLoadMore={loadMorePosts}
  currentCount={posts.length}
  totalCount={pagination.total}
/>
```

### Rich Text Editor Component

The app includes an enhanced `RichTextEditor` component with optional `label` and `error` props:

- **Optional label prop** - Displays label above editor
- **Optional error prop** - Shows validation error message below editor
- **Rich formatting toolbar** - Bold, Italic, Strikethrough, Headings (H1-H4), Lists, Quotes, Code blocks
- **Color picker** - Text color customization with preset colors
- **Link & image insertion** - Add URLs and images to content
- **Undo/Redo** - Full edit history navigation
- **Customizable styling** via className, containerClassName, labelClassName
- **Min height 300px** - Comfortable writing space
- **Read-only mode** - Via editable prop
- **Prose styling** - Beautiful typography with dark mode support

Usage example:
```tsx
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
      placeholder="Start writing your post..."
    />
  )}
/>

// Minimal usage (backward compatible)
<RichTextEditor
  content={contentValue}
  onChange={setContentValue}
/>
```

**Used in:**
- PostForm - Blog post content creation
- PostDetailPage - View-only mode (editable={false})

### Dialog Form Reset Pattern

When closing a dialog/modal with a form, reset the form validation errors and field values:

```tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MyDialog: React.FC<DialogProps> = ({ open, onOpenChange }) => {
  const { register, formState: { errors }, reset } = useForm();

  // Reset form and validation errors when modal is closed
  useEffect(() => {
    if (!open) {
      reset();
      // Reset any other local state (e.g., password visibility)
      setShowPassword(false);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

**Key Pattern:**
- Add `useEffect` hook that listens to the `open` prop
- When `open` is false (modal closing), call `reset()` to clear all form state and validation errors
- Also reset any local UI state (e.g., password visibility toggles)
- Include `reset` in dependency array to avoid stale closures

**Used in:**
- UpdatePasswordDialog - Resets password fields and validation errors on close
- Any form-based dialog or modal component

## 🔐 Authentication Flow

1. User signs up with email/password
2. Supabase creates auth user
3. Profile created in `users` table
4. JWT token stored in localStorage (via Zustand persist)
5. Protected routes check authentication status
6. Auto-refresh token on app load

## 📝 Content Creation Flow

1. User navigates to Create Post page
2. Fills in title, excerpt, featured image
3. Writes content using Tiptap rich text editor
4. Chooses to save as draft or publish
5. Post saved to Supabase with proper associations
6. Redirected to post view or dashboard

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
src/
  __tests__/
    components/
    hooks/
    utils/
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deployment Options

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or use CLI
- **AWS Amplify**: Connect repo and configure build settings
- **Cloudflare Pages**: Connect GitHub and deploy

### Environment Variables

Make sure to set these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_APP_NAME=DevCanvas Blog
VITE_APP_URL=https://your-domain.com
```

## 📚 Key Libraries & Documentation

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
  - [Supabase Storage](https://supabase.com/docs/guides/storage) - File uploads
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tiptap](https://tiptap.dev/)
- [React Router](https://reactrouter.com/)

## 📖 Additional Documentation

- [STORAGE_SETUP.md](./STORAGE_SETUP.md) - Supabase Storage setup guide
- [AGENTS.md](./AGENTS.md) - AI development guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
