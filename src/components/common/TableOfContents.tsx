import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/helpers';
import { List } from 'lucide-react';
import { TableOfContentsProps } from '@/types';


export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  onNavigate,
  variant = 'both',
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const HEADER_OFFSET = 90;

    const handleScroll = () => {
      const nearBottom =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 50;

      if (nearBottom) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      let current = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) {
          current = id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate?.();
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  };

  const TocList = () => (
    <ul className="space-y-0.5">
      {headings.map(({ id, text, level }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => handleClick(e, id)}
            className={cn(
              'block truncate rounded-md py-1.5 text-sm transition-colors hover:text-foreground hover:bg-muted/50 px-2',
              level === 1 ? 'pl-2' : level === 2 ? 'pl-5' : 'pl-8',
              activeId === id
                ? 'font-medium text-accent bg-accent/10'
                : 'text-muted-foreground',
            )}
            title={text}
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      {(variant === 'desktop' || variant === 'both') && (
        <nav className="sticky top-24 rounded-lg border border-border bg-card p-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hidden">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <List className="h-3.5 w-3.5" />
            On this page
          </p>
          <TocList />
        </nav>
      )}

      {/* Mobile collapsible */}
      {(variant === 'mobile' || variant === 'both') && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
          >
            <span className="flex items-center gap-2">
              <List className="h-4 w-4" />
              On this page
            </span>
            <span className="text-muted-foreground text-xs">{mobileOpen ? '▲' : '▼'}</span>
          </button>
          {mobileOpen && (
            <div className="px-2 pb-3">
              <TocList />
            </div>
          )}
        </div>
      )}
    </>
  );
};

