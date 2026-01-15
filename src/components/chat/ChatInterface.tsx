'use client';

/**
 * ChatInterface - Головний компонент чату
 */

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useTokens, formatTokens } from '@/hooks/useTokens';
import { ModelSelector } from './ModelSelector';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  initialModel?: string;
  chatId?: string | null;
  onChatCreated?: (chatId: string) => void;
}

export function ChatInterface({ 
  initialModel = 'gpt-4o',
  chatId,
  onChatCreated,
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    currentModel,
    currentChatId,
    sendMessage,
    setModel,
    clearMessages,
    stop,
  } = useChat(initialModel, chatId || undefined);

  const { available, loading: tokensLoading } = useTokens();

  // Сповіщаємо батьківський компонент про створення нового чату
  useEffect(() => {
    if (currentChatId && !chatId && onChatCreated) {
      onChatCreated(currentChatId);
    }
  }, [currentChatId, chatId, onChatCreated]);

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <ModelSelector
            selectedModel={currentModel}
            onModelChange={setModel}
            disabled={isLoading || isStreaming}
          />
          
          {(isLoading || isStreaming) && (
            <button
              onClick={stop}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-600 hover:bg-red-500 
                text-white transition-colors"
            >
              ⏹ Зупинити
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Token counter */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">Токени:</span>
            <span className={`font-medium ${
              available < 100 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {tokensLoading ? '...' : formatTokens(available)}
            </span>
          </div>

          {/* Clear button */}
          {messages.length > 0 && !isLoading && (
            <button
              onClick={clearMessages}
              className="px-3 py-1.5 text-sm rounded-lg 
                bg-zinc-800 hover:bg-zinc-700 text-zinc-300 
                transition-colors"
            >
              🗑 Очистити
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
          <span className="font-medium">Помилка:</span> {error}
        </div>
      )}

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isStreaming={isStreaming} 
      />

      {/* Input */}
      <MessageInput
        onSend={(content, images) => sendMessage(content, { images })}
        disabled={isLoading || isStreaming || available < 10}
        placeholder={
          available < 10 
            ? 'Недостатньо токенів...' 
            : 'Напишіть повідомлення...'
        }
      />
    </div>
  );
}

export default ChatInterface;
