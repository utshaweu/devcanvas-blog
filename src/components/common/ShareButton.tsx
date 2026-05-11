import React, { useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { useGlobalToast } from '@/contexts/ToastContext';
import { ShareButtonProps } from '@/types';

/**
 * ShareButton — reusable share / copy-link button.
 *
 * Behaviour:
 * 1. Copies `url` to the clipboard and shows a success toast immediately.
 * 2. If the browser supports the Web Share API (mobile / Win 11+), the
 *    native OS share sheet is opened afterwards so the user can also forward
 *    the link via WhatsApp, Telegram, Facebook, etc.
 * 3. If clipboard access is denied, an error toast is shown.
 * 4. Cancelling the native share sheet is silently ignored.
 */
export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  text,
  className,
  iconClassName,
}) => {
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useGlobalToast();

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const shareUrl = url ?? window.location.href;

      // Step 1 — always copy to clipboard and show immediate feedback
      try {
        await navigator.clipboard.writeText(shareUrl);
        toastSuccess(
          t(TranslationKey.LINK_COPIED),
          t(TranslationKey.LINK_COPIED_MESSAGE)
        );
      } catch {
        toastError(t(TranslationKey.COPY_LINK_FAILED));
      }

      // Step 2 — additionally open the native share sheet when available
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: text ?? title,
            url: shareUrl,
          });
        } catch (err) {
          // AbortError = user dismissed the sheet — silently ignore
        }
      }
    },
    [url, title, text, t, toastSuccess, toastError]
  );

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t(TranslationKey.SHARE_POST)}
      title={t(TranslationKey.SHARE_POST)}
      className={cn(
        'flex items-center gap-1 rounded p-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      <Share2 className={cn('h-3.5 w-3.5', iconClassName)} />
    </button>
  );
};
