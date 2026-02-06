import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  allowClear?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder = 'Select an option', error, label, onChange, allowClear = true, value, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(event.target.value);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onChange) {
        onChange('');
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-lg border border-input',
              'bg-background px-4 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'appearance-none cursor-pointer',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            onChange={handleChange}
            {...props}
          >
            <option value="">
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {allowClear && value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
