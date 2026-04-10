import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/helpers';
import { CommentComposerProps } from '@/types';


export const CommentComposer: React.FC<CommentComposerProps> = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  placeholder,
  submitLabel,
  cancelLabel,
  onCancel,
  className,
}) => {
  const isDisabled = isSubmitting || value.trim().length === 0;

  return (
    <div className={cn('space-y-3', className)}>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[96px]"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && cancelLabel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={onSubmit}
          disabled={isDisabled}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

