import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from './button';
import { supabase } from '@/lib/supabase';
import { FileUploadProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  onRemove,
  accept = 'image/*',
  maxSize = 0.5,
  bucket = 'avatars',
  path = '',
  disabled = false,
  className,
  label,
  showPreview = true,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setUploadSuccess(false);
    
    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(t(TranslationKey.FILE_TOO_LARGE));
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(t(TranslationKey.INVALID_FILE_TYPE));
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Create a preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      setUploadSuccess(true);
      
      // Call onChange with the public URL
      onChange?.(publicUrl);

      // Reset success indicator after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : t(TranslationKey.UPLOAD_FAILED));
      setPreviewUrl(value || null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
    setUploadSuccess(false);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          'hover:border-accent hover:bg-accent/5',
          uploading && 'border-accent bg-accent/5',
          error && 'border-destructive bg-destructive/5',
          uploadSuccess && 'border-green-500 bg-green-50/50',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !uploading && 'cursor-pointer',
          previewUrl && showPreview ? 'p-2' : 'p-8'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />

        {previewUrl && showPreview ? (
          // Image Preview
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-contain rounded-md"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={disabled || uploading}
                className="shadow-lg"
              >
                <Upload className="w-4 h-4 mr-1" />
                {t(TranslationKey.CHANGE_IMAGE)}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled || uploading}
                className="shadow-lg"
              >
                <X className="w-4 h-4 mr-1" />
                {t(TranslationKey.REMOVE_IMAGE)}
              </Button>
            </div>

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">{progress}%</p>
                </div>
              </div>
            )}

            {/* Success Indicator */}
            {uploadSuccess && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
        ) : (
          // Upload Prompt
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-accent animate-spin mb-3" />
                <p className="text-sm font-medium text-secondary mb-1">{t(TranslationKey.UPLOADING)}</p>
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-sm font-medium text-green-600">{t(TranslationKey.UPLOAD_SUCCESS)}</p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                <p className="text-sm font-medium text-destructive mb-1">{t(TranslationKey.UPLOAD_FAILED)}</p>
                <p className="text-xs text-muted-foreground">{t(TranslationKey.CLICK_TO_TRY_AGAIN)}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon className="w-8 h-8 text-accent" />
                </div>
                <p className="text-sm font-medium text-secondary mb-1">{label || t(TranslationKey.UPLOAD_AVATAR)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(TranslationKey.CLICK_TO_BROWSE_OR_DRAG_AND_DROP)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t(TranslationKey.MAX_SIZE).replace('{maxSize}', String(maxSize))}
                </p>
              </>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Info Text */}
      {!error && !uploading && (
        <p className="text-xs text-muted-foreground">
          {t(TranslationKey.SUPPORTED_FORMATS)}: {accept.replace(/image\/\*/g, 'JPG, PNG, GIF, WebP')}
        </p>
      )}
    </div>
  );
};
