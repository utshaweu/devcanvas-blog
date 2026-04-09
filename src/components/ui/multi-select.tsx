import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { MultiSelectProps } from '@/types';

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = 'Select options', error, label, disabled = false, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

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
      setSearchQuery('');
      triggerRef.current?.focus();
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange([]);
    };

    const handleTypeSearch = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
          return;
        }
        if (filteredOptions.length > 0) {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(filteredOptions.length > 0 ? filteredOptions.length - 1 : -1);
          return;
        }
        if (filteredOptions.length > 0) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        if (!isOpen) return;
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleToggle(filteredOptions[highlightedIndex].value);
        }
        return;
      }

      if (event.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        }
        setSearchQuery('');
        setHighlightedIndex(-1);
        return;
      }

      if (event.key === 'Backspace') {
        setSearchQuery((prev) => prev.slice(0, -1));
        return;
      }

      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      }

      setSearchQuery((prev) => `${prev}${event.key.toLowerCase()}`);
    };

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const areAllFilteredSelected =
      filteredOptions.length > 0 &&
      filteredOptions.every((option) => value.includes(option.value));

    const handleSelectAllFiltered = () => {
      if (disabled) return;

      if (areAllFilteredSelected) {
        onChange(value.filter((selected) => !filteredOptions.some((option) => option.value === selected)));
        setSearchQuery('');
        triggerRef.current?.focus();
        return;
      }

      const mergedValues = [...new Set([...value, ...filteredOptions.map((option) => option.value)])];
      onChange(mergedValues);
      setSearchQuery('');
      triggerRef.current?.focus();
    };

    React.useEffect(() => {
      if (!isOpen && searchQuery) {
        setSearchQuery('');
      }
    }, [isOpen, searchQuery]);

    React.useEffect(() => {
      if (!isOpen) {
        setHighlightedIndex(-1);
        return;
      }
      if (filteredOptions.length === 0) {
        setHighlightedIndex(-1);
        return;
      }
      if (highlightedIndex >= filteredOptions.length || highlightedIndex < 0) {
        setHighlightedIndex(0);
      }
    }, [filteredOptions.length, highlightedIndex, isOpen]);

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
            ref={triggerRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleTypeSearch}
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
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSelectAllFiltered}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={areAllFilteredSelected}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-input cursor-pointer"
                />
                <span className="text-sm font-medium">Select all</span>
              </div>

              <div className="h-px bg-border my-1" />

              {/* Options List */}
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                  No matching options
                </p>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  
                  return (
                    <div
                      key={option.value}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                        highlightedIndex === index
                          ? 'bg-accent text-primary'
                          : isSelected
                            ? 'bg-accent/20 hover:bg-accent/30'
                            : 'hover:bg-accent/10'
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
