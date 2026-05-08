import { useMemo, createContext, useContext } from 'react';
import type React from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { cn } from '@/utils/helpers';
import { VirtualizedGridComponent } from '@/types';

// Module-level context — one stable reference shared by every grid on the page.
// Using context (instead of a ref) means GridFooter is re-rendered by React
// automatically whenever the footer content changes (e.g. hasMore flips to
// false after the last page loads), without ever unmounting/remounting the
// Footer component (which caused the scroll blink).
const FooterCtx = createContext<React.ReactNode>(null);

// GridFooter reads from context so it always reflects the latest footer content.
// It is defined at module scope so its identity is permanently stable — react-
// virtuoso never sees a new component reference and therefore never re-mounts it.
function GridFooter() {
  const content = useContext(FooterCtx);
  if (!content) return null;
  return <div>{content}</div>;
}

// Stable components map — object identity never changes across renders.
const GRID_COMPONENTS = { Footer: GridFooter };

export const VirtualizedGrid: VirtualizedGridComponent = ({
  items,
  renderItem,
  className,
  itemClassName = 'h-full',
  overscan = 1000,
  useWindowScroll = true,
  getItemKey,
  footer,
}) => {
  const listClassName = useMemo(
    () => cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3', className),
    [className],
  );

  return (
    // Providing footer via context means GridFooter re-renders whenever footer
    // changes (e.g. hasMore becomes false) without changing the component ref.
    <FooterCtx.Provider value={footer ?? null}>
      <VirtuosoGrid
        useWindowScroll={useWindowScroll}
        totalCount={items.length}
        overscan={overscan}
        increaseViewportBy={500}
        listClassName={listClassName}
        itemClassName={itemClassName}
        components={GRID_COMPONENTS}
        computeItemKey={(index) => {
          const item = items[index];
          if (typeof item === 'undefined') {
            return `item-${index}`;
          }

          return getItemKey ? getItemKey(item, index) : `item-${index}`;
        }}
        itemContent={(index) => {
          const item = items[index];

          if (typeof item === 'undefined') {
            return null;
          }

          return renderItem(item, index);
        }}
      />
    </FooterCtx.Provider>
  );
};
