import { useCallback, useEffect, useRef, useState } from 'react';
import { TranslationKey } from '@/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import { ChatBotHook, McpContentPart, McpMessage, PendingRequest } from '@/types';

function resolveMcpWsUrl(): string {
  const configuredUrl = import.meta.env.VITE_MCP_WS_URL;

  if (configuredUrl && configuredUrl.trim().length > 0) {
    if (configuredUrl.startsWith('http://')) {
      return configuredUrl.replace('http://', 'ws://');
    }

    if (configuredUrl.startsWith('https://')) {
      return configuredUrl.replace('https://', 'wss://');
    }

    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isLocalhost) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
  }

  return 'ws://localhost:8080';
}

const MCP_WS_URL = resolveMcpWsUrl();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractTextResult(result: unknown): string | null {
  if (!isRecord(result) || !Array.isArray(result.content)) {
    return null;
  }

  const textPart = result.content.find((part: unknown) => {
    if (!isRecord(part)) {
      return false;
    }

    return part.type === 'text' && typeof part.text === 'string';
  }) as McpContentPart | undefined;

  return textPart?.text ?? null;
}

export function useChatBot(): ChatBotHook {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const pendingRequestsRef = useRef<Map<string | number, PendingRequest>>(new Map());
  const isUnmountedRef = useRef(false);

  const clearPendingRequests = useCallback((reason: string) => {
    pendingRequestsRef.current.forEach((pending, id) => {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(reason));
      pendingRequestsRef.current.delete(id);
    });
  }, []);

  const sendMcpMessage = useCallback((message: McpMessage): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const socket = wsRef.current;

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      if (message.id !== undefined) {
        const timeoutId = setTimeout(() => {
          const pending = pendingRequestsRef.current.get(message.id as string | number);
          if (pending) {
            pendingRequestsRef.current.delete(message.id as string | number);
            pending.reject(new Error('Request timeout'));
          }
        }, 30000);

        pendingRequestsRef.current.set(message.id, { resolve, reject, timeoutId });
      }

      socket.send(JSON.stringify(message));

      if (message.id === undefined) {
        resolve(null);
      }
    });
  }, []);

  useEffect(() => {
    isUnmountedRef.current = false;

    const connect = () => {
      if (isUnmountedRef.current) {
        return;
      }

      setConnectionStatus('connecting');

      try {
        const ws = new WebSocket(MCP_WS_URL);

        ws.onopen = async () => {
          setIsConnected(true);
          setConnectionStatus('connected');

          try {
            await sendMcpMessage({
              jsonrpc: '2.0',
              id: 'init',
              method: 'initialize',
              params: {
                protocolVersion: '2024-11-05',
                clientInfo: {
                  name: 'devcanvas-blog-client',
                  version: '1.0.0',
                },
                capabilities: {},
              },
            });

            ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                method: 'notifications/initialized',
                params: {},
              })
            );
          } catch (error) {
            console.error('MCP initialize failed:', error);
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data as string) as McpMessage;

            if (message.id === undefined) {
              return;
            }

            const pending = pendingRequestsRef.current.get(message.id);
            if (!pending) {
              return;
            }

            clearTimeout(pending.timeoutId);
            pendingRequestsRef.current.delete(message.id);

            if (message.error) {
              pending.reject(new Error(message.error.message));
              return;
            }

            pending.resolve(message.result);
          } catch (error) {
            console.error('Error parsing MCP message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('MCP WebSocket error:', error);
          setConnectionStatus('error');
        };

        ws.onclose = () => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          wsRef.current = null;
          clearPendingRequests('WebSocket disconnected');

          if (!isUnmountedRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, 5000);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connect();

    return () => {
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      clearPendingRequests('ChatBot hook unmounted');

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [clearPendingRequests, sendMcpMessage]);

  const callTool = useCallback(
    async (toolName: string, args: Record<string, unknown> = {}): Promise<string> => {
      const id = ++messageIdRef.current;

      const result = await sendMcpMessage({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      });

      return extractTextResult(result) ?? t(TranslationKey.CHATBOT_NO_RESPONSE);
    },
    [sendMcpMessage, t]
  );

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      const lowerMessage = message.toLowerCase().trim();

      try {
        if (
          (lowerMessage.includes('today') || lowerMessage.includes('আজ')) &&
          (lowerMessage.includes('post') || lowerMessage.includes('পোস্ট'))
        ) {
          return await callTool('get_posts_today');
        }

        if (
          (lowerMessage.includes('how many') ||
            lowerMessage.includes('total') ||
            lowerMessage.includes('মোট') ||
            lowerMessage.includes('কত')) &&
          (lowerMessage.includes('post') || lowerMessage.includes('পোস্ট'))
        ) {
          if (lowerMessage.includes('published') || lowerMessage.includes('প্রকাশ')) {
            return await callTool('get_published_posts');
          }
          return await callTool('get_total_posts');
        }

        if (
          (lowerMessage.includes('view') || lowerMessage.includes('ভিউ')) &&
          (lowerMessage.includes('total') || lowerMessage.includes('মোট'))
        ) {
          return await callTool('get_total_views');
        }

        if (
          (lowerMessage.includes('like') || lowerMessage.includes('লাইক')) &&
          (lowerMessage.includes('total') || lowerMessage.includes('মোট'))
        ) {
          return await callTool('get_total_likes');
        }

        if (
          lowerMessage.includes('popular') ||
          lowerMessage.includes('most viewed') ||
          lowerMessage.includes('top post') ||
          lowerMessage.includes('জনপ্রিয়')
        ) {
          return await callTool('get_popular_posts', { limit: 5 });
        }

        if (
          lowerMessage.includes('recent') ||
          lowerMessage.includes('latest') ||
          lowerMessage.includes('সাম্প্রতিক')
        ) {
          return await callTool('get_recent_posts', { limit: 5 });
        }

        if (lowerMessage.includes('category') || lowerMessage.includes('ক্যাটাগরি')) {
          return await callTool('get_categories');
        }

        if (lowerMessage.includes('tag') || lowerMessage.includes('ট্যাগ')) {
          return await callTool('get_tags', { limit: 10 });
        }

        if (lowerMessage.includes('comment') || lowerMessage.includes('মন্তব্য')) {
          return await callTool('get_comment_stats');
        }

        if (
          lowerMessage.includes('help') ||
          lowerMessage.includes('what can you') ||
          lowerMessage.includes('command') ||
          lowerMessage.includes('সাহায্য')
        ) {
          return t(TranslationKey.CHATBOT_HELP_MESSAGE);
        }

        if (
          lowerMessage.includes('hello') ||
          lowerMessage.includes('hi') ||
          lowerMessage.includes('hey') ||
          lowerMessage.includes('হ্যালো')
        ) {
          return t(TranslationKey.CHATBOT_GREETING_MESSAGE);
        }

        return t(TranslationKey.CHATBOT_UNKNOWN_MESSAGE);
      } catch (error) {
        console.error('ChatBot error:', error);
        return t(TranslationKey.CHATBOT_CONNECTION_ERROR);
      }
    },
    [callTool, t]
  );

  return {
    sendMessage,
    isConnected,
    connectionStatus,
  };
}
