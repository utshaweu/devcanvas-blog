# DevCanvas Blog Platform

A modern, full-featured blog platform built with React, TypeScript, and Supabase, following micro-frontend architecture principles.

## 🚀 Features

- **Authentication & Authorization**: Secure user authentication with Supabase
- **Rich Text Editor**: Powerful content creation with Tiptap
- **Modern UI**: Beautiful interface using Shadcn/ui components
- **State Management**: Efficient state handling with Zustand
- **Type Safety**: Full TypeScript support throughout
- **Form Validation**: Robust validation with React Hook Form and Zod
- **Analytics Dashboard**: Track views, likes, and engagement
- **Responsive Design**: Mobile-first, works on all devices
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
- **Storage**: Supabase Storage (for images)

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
│   │   ├── common/         # Common reusable components
│   │   └── layout/         # Layout components (Header, Footer)
│   ├── features/           # Feature-based modules (micro-frontends)
│   │   ├── auth/          # Authentication features
│   │   ├── blog/          # Blog post features
│   │   ├── dashboard/     # Dashboard features
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

## 🚦 Getting Started

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

-- RLS Policies for users
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
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
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

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

### Component Patterns

1. **UI Components** (`components/ui/`): Primitive, reusable components
2. **Common Components** (`components/common/`): Composed, reusable business components
3. **Feature Components** (`features/*/`): Feature-specific components
4. **Layout Components** (`components/layout/`): Page layout components

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
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tiptap](https://tiptap.dev/)
- [React Router](https://reactrouter.com/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
