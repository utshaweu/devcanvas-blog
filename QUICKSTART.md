# DevCanvas Blog - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd devcanvas-blog
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to get your credentials
4. Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Set Up Database Tables

Go to your Supabase project → SQL Editor and run:

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

### Step 4: Start Development Server

```bash
npm run dev
```

Your app will be running at `http://localhost:3000`!

## 📋 What You Get

✅ Complete authentication system (login/signup)
✅ Rich text editor for writing posts
✅ Dashboard with analytics
✅ Responsive design
✅ Type-safe with TypeScript
✅ Production-ready code

## 🎯 First Steps After Installation

1. **Sign up** for a new account at `/signup`
2. **Create your first post** at `/create`
3. **View your dashboard** at `/dashboard`
4. **Customize** the design and colors in `tailwind.config.js`

## 🛠️ Customization Tips

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR',
  },
  accent: {
    DEFAULT: '#YOUR_COLOR',
  },
}
```

### Change Font

Edit `src/styles/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;500;600;700&display=swap');

body {
  font-family: 'YourFont', sans-serif;
}
```

### Add New Features

1. Create new feature folder in `src/features/`
2. Add components, hooks, and stores
3. Register routes in `src/App.tsx`

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `ARCHITECTURE.md` for system design
- Explore the codebase structure
- Start building your blog!

## 🆘 Need Help?

Common issues and solutions:

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Supabase errors:**
- Verify your `.env` file has correct credentials
- Check if tables are created properly
- Verify RLS policies are enabled

## 🎉 You're Ready!

Happy coding! Build something amazing! 🚀
