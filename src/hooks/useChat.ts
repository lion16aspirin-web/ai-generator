'use client';

/**
 * useChat - Хук для чату з AI
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatResponse } from '@/lib/ai/types';
import { parseSSEStream } from '@/lib/ai/text/stream';
import { useTokens } from './useTokens';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentModel: string;
  currentChatId: string | null;
  enableWebSearch: boolean;
}

interface SendMessageOptions {
  stream?: boolean;
  images?: string[];
  enableWebSearch?: boolean;
}

interface UseChatReturn extends ChatState {
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  setModel: (modelId: string) => void;
  clearMessages: () => void;
  regenerate: () => Promise<void>;
  stop: () => void;
}

export function useChat(initialModel: string = 'gpt-4o', chatId?: string): UseChatReturn {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    currentModel: initialModel,
    currentChatId: chatId || null,
    enableWebSearch: true, // За замовчуванням увімкнено
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentModelRef = useRef<string>(initialModel);
  const messagesRef = useRef<ChatMessage[]>([]);
  const chatIdRef = useRef<string | null>(chatId || null);
  const { } = useTokens();

  // Коли chatId змінюється - оновлюємо стан
  useEffect(() => {
    chatIdRef.current = chatId || null;
    setState(prev => ({ ...prev, currentChatId: chatId || null }));
    
    if (chatId) {
      loadChatHistory(chatId);
    } else {
      // Новий чат - очищаємо
      messagesRef.current = [];
      setState(prev => ({ 
        ...prev, 
        messages: [], 
        currentChatId: null,
        error: null,
      }));
    }
  }, [chatId]);

  // Завантаження історії чату
  const loadChatHistory = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/chat/history/${id}`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages = data.messages || [];
        messagesRef.current = loadedMessages;
        currentModelRef.current = data.model || currentModelRef.current;
        
        setState(prev => ({
          ...prev,
          messages: loadedMessages,
          currentModel: data.model || prev.currentModel,
          currentChatId: id,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Відправка повідомлення
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ) => {
    const { stream = true, images, enableWebSearch = state.enableWebSearch } = options;
    const modelToUse = currentModelRef.current;
    
    // Оновлюємо стан enableWebSearch якщо змінився
    if (enableWebSearch !== state.enableWebSearch) {
      setState(prev => ({ ...prev, enableWebSearch }));
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      images,
      createdAt: new Date(),
    };

    setState(prev => {
      const newMessages = [...prev.messages, userMessage];
      messagesRef.current = newMessages;
      return {
        ...prev,
        messages: newMessages,
        isLoading: true,
        isStreaming: stream,
        error: null,
      };
    });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages: messagesRef.current,
          stream,
          chatId: chatIdRef.current,
          enableWebSearch: options.enableWebSearch !== false, // За замовчуванням true
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      // Отримуємо chatId з SSE headers або body
      const newChatId = response.headers.get('X-Chat-Id');
      if (newChatId && !chatIdRef.current) {
        chatIdRef.current = newChatId;
        setState(prev => ({ ...prev, currentChatId: newChatId }));
      }

      if (stream) {
        await handleStreamResponse(response);
      } else {
        const data: ChatResponse = await response.json();
        
        // Оновлюємо chatId якщо отримали
        if (data.chatId && !chatIdRef.current) {
          chatIdRef.current = data.chatId;
          setState(prev => ({ ...prev, currentChatId: data.chatId! }));
        }
        
        const assistantMessage: ChatMessage = {
          id: data.id,
          role: 'assistant',
          content: data.content,
          createdAt: new Date(),
        };

        setState(prev => {
          const newMessages = [...prev.messages, assistantMessage];
          messagesRef.current = newMessages;
          return {
            ...prev,
            messages: newMessages,
            isLoading: false,
            isStreaming: false,
          };
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Обробка streaming відповіді
  const handleStreamResponse = async (response: Response) => {
    const assistantId = crypto.randomUUID();
    
    setState(prev => {
      const newMessages = [...prev.messages, {
        id: assistantId,
        role: 'assistant' as const,
        content: '',
        createdAt: new Date(),
      }];
      messagesRef.current = newMessages;
      return {
        ...prev,
        messages: newMessages,
      };
    });

    let fullContent = '';

    for await (const chunk of parseSSEStream(response)) {
      if (chunk.done) {
        // Перевіряємо чи є chatId в останньому чанку
        if (chunk.chatId && !chatIdRef.current) {
          chatIdRef.current = chunk.chatId;
          setState(prev => ({ ...prev, currentChatId: chunk.chatId! }));
        }
        break;
      }

      fullContent += chunk.content;

      setState(prev => {
        const updatedMessages = prev.messages.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: fullContent }
            : msg
        );
        messagesRef.current = updatedMessages;
        return {
          ...prev,
          messages: updatedMessages,
        };
      });
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
    }));
  };

  // Зміна моделі
  const setModel = useCallback((modelId: string) => {
    setState(prev => ({ ...prev, currentModel: modelId }));
    currentModelRef.current = modelId;
    
    if (chatIdRef.current) {
      fetch(`/api/chat/${chatIdRef.current}/model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      }).catch(console.error);
    }
  }, []);

  // Очищення повідомлень
  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    chatIdRef.current = null;
    setState(prev => ({ 
      ...prev, 
      messages: [], 
      error: null,
      currentChatId: null,
    }));
  }, []);

  // Редагування повідомлення
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    const messageIndex = messagesRef.current.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messagesRef.current[messageIndex].role !== 'user') {
      return;
    }

    // Оновлюємо повідомлення та видаляємо всі після нього
    const updatedMessages = messagesRef.current.slice(0, messageIndex);
    const editedMessage = {
      ...messagesRef.current[messageIndex],
      content: newContent,
    };
    updatedMessages.push(editedMessage);
    
    messagesRef.current = updatedMessages;
    setState(prev => ({
      ...prev,
      messages: updatedMessages,
      isLoading: true,
      isStreaming: true,
      error: null,
    }));

    // Відправляємо оновлене повідомлення
    abortControllerRef.current = new AbortController();
    const modelToUse = currentModelRef.current;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse,
          messages: updatedMessages,
          stream: true,
          chatId: chatIdRef.current,
          enableWebSearch: state.enableWebSearch,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      const newChatId = response.headers.get('X-Chat-Id');
      if (newChatId && !chatIdRef.current) {
        chatIdRef.current = newChatId;
        setState(prev => ({ ...prev, currentChatId: newChatId }));
      }

      await handleStreamResponse(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Регенерація останньої відповіді
  const regenerate = useCallback(async () => {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find(m => m.role === 'user');

    if (!lastUserMessage) return;

    setState(prev => ({
      ...prev,
      messages: prev.messages.slice(0, -1),
    }));

    await sendMessage(lastUserMessage.content, {
      images: lastUserMessage.images,
      enableWebSearch: state.enableWebSearch,
    });
  }, [state.messages, sendMessage]);

  // Зупинка генерації
  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    editMessage,
    setModel,
    clearMessages,
    regenerate,
    stop,
  };
}
