import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = 'Select options', error, label, disabled = false, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (optionValue: string) => {
      if (disabled) return;
      
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      
      onChange(newValue);
    };

    const handleSelectAll = () => {
      if (disabled) return;
      if (value.length === options.length) {
        onChange([]);
      } else {
        onChange(options.map(opt => opt.value));
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange([]);
    };

    const selectedLabels = options
      .filter(opt => value.includes(opt.value))
      .map(opt => opt.label)
      .join(', ');

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown Trigger */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-lg border border-input',
              'bg-background px-4 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive'
            )}
          >
            <span className={cn(
              'truncate',
              !selectedLabels && 'text-muted-foreground'
            )}>
              {selectedLabels || placeholder}
            </span>
            <div className="flex items-center gap-1">
              {value.length > 0 && !disabled && (
                <X 
                  className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" 
                  onClick={handleClear}
                />
              )}
              <ChevronDown className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'transform rotate-180'
              )} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className={cn(
              'absolute z-50 w-full mt-2 py-1',
              'bg-background border border-input rounded-lg shadow-lg',
              'max-h-60 overflow-auto'
            )}>
              {/* Select All Option */}
              <div
                onClick={handleSelectAll}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={value.length === options.length}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-input cursor-pointer"
                />
                <span className="text-sm font-medium">Select all</span>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Options List */}
              {options.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No options available
                </p>
              ) : (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                        isSelected ? 'bg-accent/20' : 'hover:bg-accent/10'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-input cursor-pointer"
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
