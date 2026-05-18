import { useEffect, useState, RefObject } from 'react';
import { TocHeading } from '@/types';

export function useTableOfContents(
  contentRef: RefObject<HTMLDivElement>,
  dep?: unknown,
) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll('h1, h2, h3'));
    const seen = new Map<string, number>();

    const items: TocHeading[] = nodes.map((node) => {
      const text = node.textContent?.trim() ?? '';
      const base =
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 60) || 'heading';

      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;

      node.id = id;
      return { id, text, level: parseInt(node.tagName[1]) };
    });

    setHeadings(items);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentRef, dep]);

  return headings;
}
