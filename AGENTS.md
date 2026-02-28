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

### Form & Validation
- **Forms:** React Hook Form with Controller for custom components
- **Validation:** Zod 3.x for schema validation
- **Pattern:** Schema-first approach with TypeScript inference

### UI Components
- **Base Library:** Shadcn/ui (copy-paste components)
- **Primitives:** Radix UI for accessibility
- **Icons:** Lucide React
- **Rich Text:** Tiptap 2.x with StarterKit

### Backend & Database
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth with JWT tokens
- **Storage:** Supabase Storage for images

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

// 4. Handle submission
const onSubmit = async (data: FormData) => {
  try {
    await submitData(data);
  } catch (error) {
    // Handle error
  }
};
```

### 5. Protected Routes Pattern

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

### 6. Error Handling Pattern

```typescript
// In stores
try {
  const result = await operation();
  set({ data: result, error: null });
} catch (error: any) {
  set({ error: error.message || 'Operation failed' });
  throw error; // Re-throw for component to handle
}

// In components
const [error, setError] = useState<string | null>(null);

try {
  await store.action();
} catch (err: any) {
  setError(err.message);
}

// Display error
{error && (
  <div className="p-3 rounded-md bg-destructive/10 text-destructive">
    {error}
  </div>
)}
```

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

### Row Level Security (RLS) Policies

```sql
-- Users can read all profiles
CREATE POLICY "Users can read all profiles" ON users
  FOR SELECT USING (true);

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
```

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
