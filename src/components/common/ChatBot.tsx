import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, UserRound, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useChatBot } from '@/hooks/useChatBot';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/i18n';
import { Message } from '@/types';



export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, isConnected } = useChatBot();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t(TranslationKey.CHATBOT_WELCOME),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  const handleSendMessage = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!input.trim() || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessage(userMessage.content);

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('ChatBot send failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content: t(TranslationKey.CHATBOT_ERROR),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);

      // Keep keyboard flow smooth after sending a message.
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg transition-all duration-300',
          'bg-accent hover:bg-accent/90 text-accent-foreground',
          'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label={t(TranslationKey.CHATBOT_OPEN_ARIA)}
      >
        <MessageCircle className="h-6 w-6" />
        {!isConnected && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
        )}
      </button>

      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 h-[600px] max-h-[calc(100vh-8rem)] w-96 max-w-[calc(100vw-3rem)]',
          'rounded-lg border border-border bg-background shadow-2xl',
          'transition-all duration-300 transform',
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        )}
      >
        <div className="flex items-center justify-between rounded-t-lg border-b border-border bg-accent/5 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="h-6 w-6 text-accent" />
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                  isConnected ? 'bg-emerald-500' : 'bg-destructive'
                )}
              />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{t(TranslationKey.CHATBOT_TITLE)}</h4>
              <p className="text-xs text-muted-foreground">
                {isConnected
                  ? t(TranslationKey.CHATBOT_ONLINE)
                  : t(TranslationKey.CHATBOT_OFFLINE)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 transition-colors hover:bg-muted"
            aria-label={t(TranslationKey.CHATBOT_CLOSE_ARIA)}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="h-[calc(100%-8rem)] space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 animate-in slide-in-from-bottom-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <MessageCircle className="h-4 w-4 text-accent" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
                  message.role === 'user'
                    ? 'rounded-br-none bg-accent text-accent-foreground'
                    : 'rounded-bl-none bg-muted text-foreground'
                )}
              >
                <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">{formatTime(message.timestamp)}</p>
              </div>

              {message.role === 'user' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  {isAuthenticated ? (
                    user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold uppercase">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    )
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="animate-in slide-in-from-bottom-2 flex items-start gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                <MessageCircle className="h-4 w-4 text-accent" />
              </div>
              <div className="rounded-2xl rounded-bl-none bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="rounded-b-lg border-t border-border bg-background p-4"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t(TranslationKey.CHATBOT_PLACEHOLDER)}
              disabled={!isConnected}
              className={cn(
                'flex-1 rounded-full border border-border bg-background px-4 py-2',
                'placeholder:text-muted-foreground',
                'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            <button
              type="submit"
              onMouseDown={(event) => event.preventDefault()}
              disabled={!input.trim() || !isConnected || isTyping}
              className={cn(
                'rounded-full bg-accent p-2 text-accent-foreground transition-colors',
                'hover:bg-accent/90',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              aria-label={t(TranslationKey.CHATBOT_SEND_ARIA)}
            >
              {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
