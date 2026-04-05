import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugifyLib from 'slugify';

/**
 * Default featured image for blog posts
 */
export const DEFAULT_FEATURED_IMAGE = 'https://images.pexels.com/photos/19825351/pexels-photo-19825351.jpeg';

/**
 * Merges Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Generate slug from string
 * Supports Bengali (Bangla), Arabic, and other Unicode characters via transliteration
 */
export function generateSlug(text: string): string {
  // Use slugify library which handles Unicode properly
  const slug = slugifyLib(text, {
    lower: true,           // Convert to lowercase
    strict: true,          // Strip special characters
    trim: true,            // Trim leading/trailing replacement chars
    locale: 'en',          // Use English locale for transliteration
    replacement: '-',      // Replace spaces with -
  });
  
  // If slugify returns empty (all non-Latin chars that couldn't be transliterated),
  // generate a unique slug with timestamp
  if (!slug || slug.length === 0) {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `post-${timestamp}-${randomPart}`;
  }
  
  return slug;
}

/**
 * Generate a unique slug by checking database for existing slugs
 * If a slug already exists, appends a timestamp to ensure uniqueness
 */
export async function generateUniqueSlug(
  text: string,
  checkSlugFn: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(text);
  
  // Check if the base slug already exists
  const existsSlug = await checkSlugFn(baseSlug);
  
  if (!existsSlug) {
    return baseSlug;
  }
  
  // If it exists, append timestamp to make it unique
  const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  
  return uniqueSlug;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
