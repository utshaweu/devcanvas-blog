import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, CornerDownLeft, TextSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/helpers';
import { SpotlightSearchProps, SpotlightSearchResult } from '@/types';

const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 8;

const cleanExcerpt = (excerpt: string | null | undefined): string => {
  if (!excerpt) return '';
  return excerpt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ className }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotlightSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Keyboard navigation state ───────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(-1);

  // Refs
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  const normalizedQuery = useMemo(() => {
    return debouncedQuery
      .trim()
      .replace(/[,%]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [debouncedQuery]);

  // ─── Reset when dialog closes ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setIsLoading(false);
      setActiveIndex(-1);
      itemRefs.current = [];
    }
  }, [open]);

  // ─── Reset active index when results change ───────────────────────────────
  useEffect(() => {
    setActiveIndex(-1);
    itemRefs.current = [];
  }, [results]);

  // ─── Search query ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || normalizedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const searchPosts = async () => {
      setIsLoading(true);

      const pattern = `%${normalizedQuery}%`;
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt')
        .eq('published', true)
        .or(`title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern}`)
        .order('published_at', { ascending: false })
        .limit(RESULTS_LIMIT);

      if (!isMounted) return;

      if (error) {
        console.error('Failed to search posts for spotlight:', error);
        setResults([]);
        setIsLoading(false);
        return;
      }

      setResults((data || []) as SpotlightSearchResult[]);
      setIsLoading(false);
    };

    searchPosts();

    return () => {
      isMounted = false;
    };
  }, [normalizedQuery, open]);

  // ─── Scroll active item into view ────────────────────────────────────────
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // ─── Navigate to result ───────────────────────────────────────────────────
  const handleResultClick = useCallback(
    (slug: string) => {
      navigate(`/blog/${slug}`);
      setOpen(false);
    },
    [navigate]
  );

  // ─── Keyboard handler on the input ───────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
          break;
        }

        case 'Enter': {
          e.preventDefault();
          if (activeIndex >= 0 && results[activeIndex]) {
            handleResultClick(results[activeIndex].slug);
          }
          break;
        }

        case 'Escape': {
          setOpen(false);
          break;
        }

        default:
          break;
      }
    },
    [results, activeIndex, handleResultClick]
  );

  const hasQuery = normalizedQuery.length >= MIN_QUERY_LENGTH;
  const openLabel = t(TranslationKey.SEARCH_POSTS_LABEL);

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        title={openLabel}
        className={className}
      >
        <TextSearch className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-3 p-4 sm:p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle>{t(TranslationKey.SEARCH_POSTS_LABEL)}</DialogTitle>
            <DialogDescription>{t(TranslationKey.SEARCH_POSTS_HELPER)}</DialogDescription>
          </DialogHeader>

          {/* Search input */}
          <Input
            id="spotlight-post-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(TranslationKey.SEARCH_POSTS_PLACEHOLDER)}
            autoFocus
            containerClassName="space-y-0"
            className="h-11"
            aria-activedescendant={
              activeIndex >= 0 ? `spotlight-result-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            aria-controls="spotlight-results-list"
            role="combobox"
            aria-expanded={results.length > 0}
          />

          {/* Results container */}
          <div className="max-h-[360px] overflow-y-auto rounded-md border border-border/70 bg-background">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : !hasQuery ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                {t(TranslationKey.SEARCH_POSTS_HELPER)}
              </p>
            ) : results.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                {t(TranslationKey.NO_SEARCH_RESULTS)}
              </p>
            ) : (
              <ul
                id="spotlight-results-list"
                ref={listRef}
                role="listbox"
                aria-label={openLabel}
                className="divide-y divide-border/70"
              >
                {results.map((result, index) => {
                  const excerpt = cleanExcerpt(result.excerpt);
                  const isActive = index === activeIndex;

                  return (
                    <li key={result.id} role="option" aria-selected={isActive}>
                      <button
                        id={`spotlight-result-${index}`}
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        type="button"
                        onClick={() => handleResultClick(result.slug)}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(-1)}
                        className={cn(
                          'w-full px-4 py-3 text-left transition-all duration-150',
                          'focus-visible:outline-none',
                          'space-y-1',
                          // ── Active/highlighted state ──────────────────────
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/10 text-foreground'
                        )}
                      >
                        {/* Title row with keyboard hint */}
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              'line-clamp-1 text-sm font-semibold',
                              isActive ? 'text-accent-foreground' : 'text-foreground'
                            )}
                          >
                            {result.title}
                          </p>

                          {/* Show ↵ hint only on active row */}
                          {isActive && (
                            <span className="flex shrink-0 items-center gap-1 rounded border border-accent-foreground/30 bg-accent-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground/80">
                              <CornerDownLeft className="h-2.5 w-2.5" />
                              Enter
                            </span>
                          )}
                        </div>

                        {/* Excerpt */}
                        {excerpt && (
                          <p
                            className={cn(
                              'line-clamp-2 text-xs',
                              isActive ? 'text-accent-foreground/80' : 'text-muted-foreground'
                            )}
                          >
                            {excerpt}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Keyboard hint footer ─────────────────────────────────────── */}
          {results.length > 0 && (
            <div className="flex items-center gap-4 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
                  <ArrowUp className="h-2.5 w-2.5" />
                </kbd>
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
                  <ArrowDown className="h-2.5 w-2.5" />
                </kbd>
                to navigate
              </span>

              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                to open
              </span>

              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] leading-none">
                  Esc
                </kbd>
                to close
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};