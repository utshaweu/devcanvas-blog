import { VirtuosoGrid } from 'react-virtuoso';
import { cn } from '@/utils/helpers';
import { VirtualizedGridComponent } from '@/types';


export const VirtualizedGrid: VirtualizedGridComponent = ({
  items,
  renderItem,
  className,
  itemClassName = 'h-full',
  overscan = 600,
  useWindowScroll = true,
  getItemKey,
}) => {
  return (
    <VirtuosoGrid
      useWindowScroll={useWindowScroll}
      totalCount={items.length}
      overscan={overscan}
      listClassName={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3', className)}
      itemClassName={itemClassName}
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
  );
};
