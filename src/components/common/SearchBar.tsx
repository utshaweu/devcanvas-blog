import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/helpers';
import { SearchBarProps } from '@/types';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder,
  clearButtonLabel,
  label,
  helperText,
  className,
}) => {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-slate-50 via-background to-blue-50/60 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.65)] sm:p-5 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40',
      className
    )}>
      <div className="relative">
        <Input
          id="post-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          label={label}
          placeholder={placeholder}
          containerClassName="space-y-0"
          className="h-12 rounded-xl border-border/70 bg-background/90 pl-11 pr-11 text-[15px] text-foreground caret-blue-500 placeholder:text-muted-foreground/90 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-400"
        />

        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-full text-muted-foreground hover:bg-blue-100 hover:text-foreground dark:hover:bg-blue-900/40"
            aria-label={clearButtonLabel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {helperText && (
        <p className="mt-3 text-sm text-muted-foreground dark:text-slate-300">{helperText}</p>
      )}
    </div>
  );
};