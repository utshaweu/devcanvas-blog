import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/helpers';
import { PasswordInputProps } from '@/types';

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      label,
      placeholder = '••••••••',
      disabled = false,
      error,
      visible,
      onVisibilityChange,
      containerClassName,
      labelClassName,
      inputClassName,
      ...inputProps
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <Label
            htmlFor={id}
            className={cn('text-sm font-medium', labelClassName)}
          >
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('pr-10', inputClassName)}
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => onVisibilityChange(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={disabled}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
