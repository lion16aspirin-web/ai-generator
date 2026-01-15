'use client';

/**
 * ChatInterface - Мінімалістичний інтерфейс чату
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useTokens, formatTokens } from '@/hooks/useTokens';
import { ModelSelector } from './ModelSelector';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatShortcuts } from './useChatShortcuts';

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
    editMessage,
    setModel,
    clearMessages,
    stop,
  } = useChat(initialModel, chatId || undefined);

  const { available, loading: tokensLoading } = useTokens();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousModelRef = useRef<string>(currentModel);

  // Гарячі клавіші
  useChatShortcuts({
    onFocusInput: () => {
      inputRef.current?.focus();
    },
    onClear: () => {
      if (messages.length > 0 && !isLoading) {
        clearMessages();
      }
    },
  });

  const showNotification = useCallback((text: string) => {
    setNotification(text);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 1500);
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    if (modelId === previousModelRef.current) return;
    setModel(modelId);
    previousModelRef.current = modelId;
    showNotification('Model changed');
  }, [setModel, showNotification]);

  useEffect(() => {
    previousModelRef.current = currentModel;
  }, [currentModel]);

  useEffect(() => {
    if (currentChatId && !chatId && onChatCreated) {
      onChatCreated(currentChatId);
    }
  }, [currentChatId, chatId, onChatCreated]);

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Notification */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50
          px-3 py-1.5 bg-slate-900 text-slate-300 rounded text-xs
          border border-slate-800 animate-fadeIn">
          {notification}
        </div>
      )}
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ModelSelector
            selectedModel={currentModel}
            onModelChange={handleModelChange}
            disabled={isLoading || isStreaming}
          />
          
          {(isLoading || isStreaming) && (
            <button
              onClick={stop}
              className="px-2 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 
                text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
            >
              Stop
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Tokens */}
          <span className="text-xs text-slate-500">
            {tokensLoading ? '...' : formatTokens(available)}
          </span>

          {/* Clear */}
          {messages.length > 0 && !isLoading && (
            <button
              onClick={clearMessages}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded text-xs bg-red-900/20 border border-red-900/50 text-red-400">
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList 
        messages={messages} 
        isStreaming={isStreaming}
        onEditMessage={editMessage}
      />

      {/* Input */}
      <MessageInput
        ref={inputRef}
        onSend={(content, images) => sendMessage(content, { images })}
        disabled={isLoading || isStreaming || available < 10}
        placeholder={available < 10 ? 'No tokens...' : 'Message...'}
      />
    </div>
  );
}

export default ChatInterface;
