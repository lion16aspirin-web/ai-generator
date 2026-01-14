'use client';

/**
 * useChat - Хук для чату з AI
 */

import { useState, useCallback, useRef } from 'react';
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

export function useChat(initialModel: string = 'gpt-5.1'): UseChatReturn {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    currentModel: initialModel,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { deduct, hasEnough } = useTokens();

  // Відправка повідомлення
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ) => {
    const { stream = true, images } = options;

    // Створюємо повідомлення користувача
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      images,
      createdAt: new Date(),
    };

    // Додаємо до стейту
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isStreaming: stream,
      error: null,
    }));

    // Створюємо AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: state.currentModel,
          messages: [...state.messages, userMessage],
          stream,
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

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          isStreaming: false,
        }));
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
  }, [state.currentModel, state.messages]);

  // Обробка streaming відповіді
  const handleStreamResponse = async (response: Response) => {
    // Створюємо пусте повідомлення асистента
    const assistantId = crypto.randomUUID();
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }],
    }));

    let fullContent = '';

    for await (const chunk of parseSSEStream(response)) {
      if (chunk.done) break;

      fullContent += chunk.content;

      // Оновлюємо повідомлення
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: fullContent }
            : msg
        ),
      }));
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
  }, []);

  // Очищення повідомлень
  const clearMessages = useCallback(() => {
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
