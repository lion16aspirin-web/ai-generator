'use client';

/**
 * useChat - Хук для чату з AI
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChatResponse, StreamChunk } from '@/lib/ai/types';
import { parseSSEStream } from '@/lib/ai/text/stream';
import { useTokens } from './useTokens';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentModel: string;
}

interface SendMessageOptions {
  stream?: boolean;
  images?: string[];
}

interface UseChatReturn extends ChatState {
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  setModel: (modelId: string) => void;
  clearMessages: () => void;
  regenerate: () => Promise<void>;
  stop: () => void;
}

export function useChat(initialModel: string = 'gpt-5.1', chatId?: string): UseChatReturn {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    currentModel: initialModel,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentModelRef = useRef<string>(initialModel); // Ref для актуальної моделі
  const messagesRef = useRef<ChatMessage[]>([]); // Ref для актуальних повідомлень
  const { deduct, hasEnough } = useTokens();

  // Завантаження історії чату
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
    }
  }, [chatId]);

  // Завантаження історії чату
  const loadChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setState(prev => {
          const loadedMessages = data.messages || [];
          messagesRef.current = loadedMessages; // Оновлюємо ref
          return {
            ...prev,
            messages: loadedMessages,
            currentModel: data.model || prev.currentModel,
          };
        });
        currentModelRef.current = data.model || currentModelRef.current;
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // Відправка повідомлення
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ) => {
    const { stream = true, images } = options;

    // Використовуємо актуальну модель з ref
    const modelToUse = currentModelRef.current;

    // Створюємо повідомлення користувача
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      images,
      createdAt: new Date(),
    };

    // Додаємо до стейту
    setState(prev => {
      const newMessages = [...prev.messages, userMessage];
      messagesRef.current = newMessages; // Оновлюємо ref
      return {
        ...prev,
        messages: newMessages,
        isLoading: true,
        isStreaming: stream,
        error: null,
      };
    });

    // Створюємо AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelToUse, // Використовуємо актуальну модель
          messages: messagesRef.current, // Використовуємо актуальні повідомлення з ref
          stream,
          chatId, // Передаємо chatId для збереження
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      if (stream) {
        // Streaming response
        await handleStreamResponse(response);
      } else {
        // Regular response
        const data: ChatResponse = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: data.id,
          role: 'assistant',
          content: data.content,
          createdAt: new Date(),
        };

        setState(prev => {
          const newMessages = [...prev.messages, assistantMessage];
          messagesRef.current = newMessages; // Оновлюємо ref
          return {
            ...prev,
            messages: newMessages,
            isLoading: false,
            isStreaming: false,
          };
        });
      }

      // Оновлюємо chatId якщо отримали його з відповіді
      if (response.ok && !chatId) {
        try {
          const data = await response.clone().json();
          if (data.chatId) {
            // Можна зберегти chatId для подальшого використання
          }
        } catch {
          // Ігноруємо помилку парсингу для streaming
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Скасовано користувачем
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
  }, [chatId]); // Використовуємо функціональне оновлення для messages

  // Обробка streaming відповіді
  const handleStreamResponse = async (response: Response) => {
    // Створюємо пусте повідомлення асистента
    const assistantId = crypto.randomUUID();
    
    setState(prev => {
      const newMessages = [...prev.messages, {
        id: assistantId,
        role: 'assistant' as const,
        content: '',
        createdAt: new Date(),
      }];
      messagesRef.current = newMessages; // Оновлюємо ref
      return {
        ...prev,
        messages: newMessages,
      };
    });

    let fullContent = '';

    for await (const chunk of parseSSEStream(response)) {
      if (chunk.done) break;

      fullContent += chunk.content;

      // Оновлюємо повідомлення
      setState(prev => {
        const updatedMessages = prev.messages.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: fullContent }
            : msg
        );
        messagesRef.current = updatedMessages; // Оновлюємо ref
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
    currentModelRef.current = modelId; // Оновлюємо ref
    // Оновлюємо модель в чаті на сервері
    if (chatId) {
      fetch(`/api/chat/${chatId}/model`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      }).catch(console.error);
    }
  }, [chatId]);

  // Очищення повідомлень
  const clearMessages = useCallback(() => {
    messagesRef.current = []; // Очищаємо ref
    setState(prev => ({ ...prev, messages: [], error: null }));
  }, []);

  // Регенерація останньої відповіді
  const regenerate = useCallback(async () => {
    const lastUserMessage = [...state.messages]
      .reverse()
      .find(m => m.role === 'user');

    if (!lastUserMessage) return;

    // Видаляємо останню відповідь
    setState(prev => ({
      ...prev,
      messages: prev.messages.slice(0, -1),
    }));

    // Відправляємо знову
    await sendMessage(lastUserMessage.content, {
      images: lastUserMessage.images,
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
    setModel,
    clearMessages,
    regenerate,
    stop,
  };
}
