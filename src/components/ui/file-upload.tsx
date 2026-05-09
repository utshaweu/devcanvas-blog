import React, { useEffect, useRef, useState } from 'react';
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
  errors,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  // Refs for active timers/intervals so they can be cancelled on unmount.
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Cancel any in-flight timers / intervals when the component unmounts so we
  // never call setState on a component that is no longer in the tree.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, []);

  const processFileUpload = async (file: File) => {
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

      // Delete old file from storage before uploading new one
      if (value && value.includes(bucket)) {
        try {
          const urlParts = value.split(`/${bucket}/`);
          if (urlParts.length > 1) {
            const oldFilePath = urlParts[1];
            
            const { error: deleteError } = await supabase.storage
              .from(bucket)
              .remove([oldFilePath]);
            
            // Continue with upload even if delete fails
            // This prevents blocking user experience
            if (deleteError) {
              // Silent fail - old file becomes orphaned (rare edge case)
            }
          }
        } catch (err) {
          // Silent fail - continue with upload
        }
      }

      // Create a preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (isMountedRef.current) {
            setPreviewUrl(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Simulate progress for better UX. Store the interval ID in a ref so
      // the cleanup effect can cancel it if the component unmounts mid-upload.
      progressIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          clearInterval(progressIntervalRef.current!);
          progressIntervalRef.current = null;
          return;
        }
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressIntervalRef.current!);
            progressIntervalRef.current = null;
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

      // Always stop the progress interval after the upload settles.
      if (progressIntervalRef.current !== null) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!isMountedRef.current) return;

      setProgress(100);
      setUploadSuccess(true);
      
      // Call onChange with the public URL
      onChange?.(publicUrl);

      // Reset success indicator after 2 seconds. Track the timeout so the
      // cleanup effect can cancel it if the component unmounts first.
      successTimerRef.current = setTimeout(() => {
        successTimerRef.current = null;
        if (isMountedRef.current) {
          setUploadSuccess(false);
        }
      }, 2000);

    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : t(TranslationKey.UPLOAD_FAILED));
      setPreviewUrl(value || null);
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
      // Reset file input regardless of mount state (DOM side-effect, safe).
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || uploading) {
      return;
    }

    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || uploading) {
      return;
    }

    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || uploading) {
      return;
    }

    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || uploading) {
      return;
    }

    dragCounterRef.current = 0;
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    await processFileUpload(file);
  };

  const handleRemove = async () => {
    setRemoving(true);
    
    // If there's a current file in storage, delete it
    if (value && value.includes(bucket)) {
      try {
        // Extract file path from URL
        // URL format: https://.../storage/v1/object/public/bucket/path/to/file.jpg
        const urlParts = value.split(`/${bucket}/`);
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          
          // Delete from Supabase Storage
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (deleteError) {
            setError(t(TranslationKey.UPLOAD_FAILED));
            // Continue with removal even if delete fails
          }
        }
      } catch (err) {
        setError(t(TranslationKey.UPLOAD_FAILED));
        // Continue with local removal even if storage deletion fails
      }
    }
    
    // Clear local state
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
    setUploadSuccess(false);
    setRemoving(false);
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
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          'hover:border-accent hover:bg-accent/5',
          isDragActive && 'border-accent bg-accent/10',
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
                disabled={disabled || uploading || removing}
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
                disabled={disabled || uploading || removing}
                className="shadow-lg"
              >
                {removing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-1" />
                )}
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
          <p className='font-medium'>{error}</p>
        </div>
      )}

      {/* Info Text */}
      {!error && !uploading && (
        <p className="text-xs text-muted-foreground">
          {t(TranslationKey.SUPPORTED_FORMATS)}: {accept.replace(/image\/\*/g, 'JPG, PNG, GIF, WebP')}
        </p>
      )}
      {errors && (
        <p className="mt-1.5 text-sm text-destructive font-medium">{errors}</p>
      )}
    </div>
  );
};
