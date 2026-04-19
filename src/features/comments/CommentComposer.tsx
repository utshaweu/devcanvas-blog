import React, { useRef } from 'react';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
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
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = isSubmitting || value.trim().length === 0;

  const handleEmojiSelect = (emoji: string) => {
    const textareaElement = textareaRef.current;

    if (!textareaElement) {
      onChange(`${value}${emoji}`);
      return;
    }

    const selectionStart = textareaElement.selectionStart ?? value.length;
    const selectionEnd = textareaElement.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, selectionStart)}${emoji}${value.slice(selectionEnd)}`;
    const nextCaretPosition = selectionStart + emoji.length;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textareaElement.focus();
      textareaElement.setSelectionRange(nextCaretPosition, nextCaretPosition);
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[96px]"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between gap-2">
        <EmojiPicker
          buttonLabel={t(TranslationKey.INSERT_EMOJI)}
          onEmojiSelect={handleEmojiSelect}
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-2">
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
    </div>
  );
};

