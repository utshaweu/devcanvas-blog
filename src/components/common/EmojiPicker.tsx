import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { EmojiPickerProps } from '@/types';
import { cn } from '@/utils/helpers';

const DEFAULT_PREFERRED_WIDTH = 352;
const DEFAULT_MAX_HEIGHT = 420;
const DEFAULT_VIEWPORT_PADDING = 8;
const DEFAULT_MOBILE_BREAKPOINT = 640;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  buttonLabel,
  className,
  buttonClassName,
  pickerClassName,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
  buttonContent,
  disabled = false,
  preferredWidth = DEFAULT_PREFERRED_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  viewportPadding = DEFAULT_VIEWPORT_PADDING,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  mobileCentered = true,
}) => {
  const { effectiveTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    top: 0,
    left: 0,
    width: DEFAULT_PREFERRED_WIDTH,
    maxHeight: DEFAULT_MAX_HEIGHT,
  });

  const updatePosition = useCallback(() => {
    if (!triggerButtonRef.current || typeof window === 'undefined') {
      return;
    }

    const triggerRect = triggerButtonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const mobileViewport = viewportWidth < mobileBreakpoint;
    const availableWidth = Math.max(0, viewportWidth - viewportPadding * 2);
    const width = mobileViewport
      ? availableWidth
      : Math.min(preferredWidth, availableWidth);
    const nextMaxHeight = Math.min(maxHeight, viewportHeight - viewportPadding * 2);

    const rawLeft = mobileViewport && mobileCentered
      ? (viewportWidth - width) / 2
      : triggerRect.left;
    const minLeft = viewportPadding;
    const maxLeft = Math.max(viewportPadding, viewportWidth - width - viewportPadding);
    const left = clamp(rawLeft, minLeft, maxLeft);

    const enoughSpaceBelow = viewportHeight - triggerRect.bottom >= nextMaxHeight + viewportPadding;
    const preferredTop = enoughSpaceBelow
      ? triggerRect.bottom + viewportPadding
      : triggerRect.top - nextMaxHeight - viewportPadding;
    const minTop = viewportPadding;
    const maxTop = Math.max(viewportPadding, viewportHeight - nextMaxHeight - viewportPadding);
    const top = clamp(preferredTop, minTop, maxTop);

    setPosition({
      top,
      left,
      width,
      maxHeight: nextMaxHeight,
    });
  }, [maxHeight, mobileBreakpoint, mobileCentered, preferredWidth, viewportPadding]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const clickedOutsidePicker = pickerRef.current && !pickerRef.current.contains(target);

      if (clickedOutsideContainer && clickedOutsidePicker) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('mousedown', handlePointerOutside);
    document.addEventListener('touchstart', handlePointerOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, updatePosition]);

  const emojiPickerTheme = useMemo(() => (effectiveTheme === 'dark' ? 'dark' : 'light'), [effectiveTheme]);

  const handleEmojiSelect = (emoji: unknown) => {
    if (
      typeof emoji === 'object' &&
      emoji !== null &&
      'native' in emoji &&
      typeof (emoji as { native: unknown }).native === 'string'
    ) {
      onEmojiSelect((emoji as { native: string }).native);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative inline-flex', className)} ref={containerRef}>
      <Button
        ref={triggerButtonRef}
        type="button"
        size={buttonSize}
        variant={buttonVariant}
        className={buttonClassName}
        onClick={() => setIsOpen((previous) => !previous)}
        title={buttonLabel}
        aria-label={buttonLabel}
        disabled={disabled}
      >
        {buttonContent ?? <SmilePlus className="h-4 w-4" />}
      </Button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={pickerRef}
            className={cn(
              'fixed z-50 rounded-lg border border-border bg-background shadow-lg',
              pickerClassName
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              maxHeight: `${position.maxHeight}px`,
            }}
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={emojiPickerTheme}
              previewPosition="none"
            />
          </div>,
          document.body
        )}
    </div>
  );
};