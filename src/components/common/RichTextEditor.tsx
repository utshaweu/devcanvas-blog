import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Palette,
  Code, 
  FileCode,
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered,
  Quote,
  Check,
  Undo,
  Redo,
  Link as LinkIcon,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EmojiPicker } from '@/components/common/EmojiPicker';
import { RichTextEditorProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';


export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder,
  className,
  editable = true,
  label,
  error,
  containerClassName,
  labelClassName,
}) => {
  const { t } = useTranslation();
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const placeholderText = placeholder || t(TranslationKey.START_WRITING_PLACEHOLDER);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholderText,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline hover:text-accent-hover',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes (for edit mode)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Tiptap normalises an empty string to '<p></p>'.
      // Treat both as equivalent so we don't fire onChange (and mark the
      // RHF form as dirty) when the editor is just initialising on a blank form.
      const isEmpty = (html: string | null | undefined) =>
        !html || html === '<p></p>';
      if (isEmpty(content) && isEmpty(editor.getHTML())) return;
      editor.commands.setContent(content ?? '');
    }
  }, [content, editor]);

  // Update placeholder when language changes
  useEffect(() => {
    if (editor) {
      const placeholderExt = editor.extensionManager.extensions.find(
        (ext) => ext.name === 'placeholder'
      );
      if (placeholderExt) {
        placeholderExt.options.placeholder = placeholderText;
        // Dispatch an empty transaction to force ProseMirror to recompute decorations
        editor.view.dispatch(editor.state.tr.setMeta('placeholderChange', true));
      }
    }
  }, [placeholderText, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt(t(TranslationKey.RTE_ENTER_URL_PROMPT));
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt(t(TranslationKey.RTE_ENTER_IMAGE_URL_PROMPT));
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const textColors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const applyTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setSelectedColor(color);
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <Label className={labelClassName}>{label}</Label>
      )}
      <div className={cn(
        'border border-border rounded-lg overflow-hidden bg-background',
        error && 'border-destructive bg-destructive/5',
        className
      )}>
        {editable && (
          <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_BOLD)}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_ITALIC)}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_STRIKETHROUGH)}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_INLINE_CODE)}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_CODE_BLOCK)}
          >
            <FileCode className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_HEADING_1)}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_HEADING_2)}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_HEADING_3)}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <EmojiPicker
            buttonLabel={t(TranslationKey.INSERT_EMOJI)}
            buttonVariant="ghost"
            buttonSize="sm"
            mobileCentered={false}
            onEmojiSelect={(emoji) => {
              editor.chain().focus().insertContent(emoji).run();
            }}
          />

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_BULLET_LIST)}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_ORDERED_LIST)}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            title={t(TranslationKey.RTE_BLOCK_QUOTE)}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={addLink}
            title={t(TranslationKey.RTE_ADD_LINK)}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={addImage}
            title={t(TranslationKey.RTE_ADD_IMAGE)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowColorPicker((previous) => !previous)}
            title={t(TranslationKey.RTE_TEXT_COLOR)}
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="flex items-center gap-1">
              {textColors.map((colorItem) => (
                <button
                  key={colorItem.value}
                  type="button"
                  onClick={() => applyTextColor(colorItem.value)}
                  className={cn(
                    'relative h-5 w-5 rounded-full border border-border transition-transform hover:scale-110',
                    selectedColor === colorItem.value ? 'ring-2 ring-ring ring-offset-1 ring-offset-background' : ''
                  )}
                  style={{ backgroundColor: colorItem.value }}
                  title={colorItem.name}
                >
                  {selectedColor === colorItem.value && (
                    <Check className="absolute inset-0 m-auto h-3 w-3 text-white" />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={selectedColor || '#3b82f6'}
                onChange={(event) => applyTextColor(event.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-border bg-background p-0"
                title={t(TranslationKey.RTE_CUSTOM_COLOR)}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setSelectedColor(null);
                  setShowColorPicker(false);
                }}
                className="h-6 px-2 text-xs"
                title={t(TranslationKey.RTE_CLEAR_COLOR)}
              >
                {t(TranslationKey.RTE_CLEAR)}
              </Button>
            </div>
          )}

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title={t(TranslationKey.RTE_UNDO)}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title={t(TranslationKey.RTE_REDO)}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className="prose prose-slate dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-hr:border-border max-w-none p-4 min-h-[300px] max-h-[60vh] overflow-y-auto scrollbar-hidden focus:outline-none"
      />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
};
