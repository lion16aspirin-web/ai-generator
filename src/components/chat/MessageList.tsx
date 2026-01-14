'use client';

/**
 * MessageList - Список повідомлень чату
 */

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/ai/types';
import { StreamingMessage } from './StreamingMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Автоскрол до низу
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <MessageItem 
          key={message.id} 
          message={message}
          isLast={index === messages.length - 1}
          isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// ============================================
// MESSAGE ITEM
// ============================================

interface MessageItemProps {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
}

function MessageItem({ message, isLast, isStreaming }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 
          flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          AI
        </div>
      )}

      {/* Content */}
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3
        ${isUser 
          ? 'bg-emerald-600 text-white' 
          : 'bg-zinc-800 text-zinc-100'
        }
      `}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {message.images.map((img, i) => (
              <img 
                key={i}
                src={img}
                alt={`Attached ${i + 1}`}
                className="max-w-48 max-h-48 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Text content */}
        {isStreaming && isLast ? (
          <StreamingMessage content={message.content} />
        ) : (
          <MessageContent content={message.content} />
        )}

        {/* Timestamp */}
        <div className={`
          text-xs mt-2 
          ${isUser ? 'text-emerald-200' : 'text-zinc-500'}
        `}>
          {formatTime(message.createdAt)}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 
          flex items-center justify-center text-white text-sm flex-shrink-0">
          👤
        </div>
      )}
    </div>
  );
}

// ============================================
// MESSAGE CONTENT
// ============================================

interface MessageContentProps {
  content: string;
}

function MessageContent({ content }: MessageContentProps) {
  // Простий рендер з підтримкою code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          if (match) {
            const [, lang, code] = match;
            return (
              <CodeBlock key={index} language={lang} code={code.trim()} />
            );
          }
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </div>
  );
}

// ============================================
// CODE BLOCK
// ============================================

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-lg overflow-hidden bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800">
        <span className="text-xs text-zinc-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? '✓ Скопійовано' : '📋 Копіювати'}
        </button>
      </div>
      
      {/* Code */}
      <pre className="p-3 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Почніть розмову
        </h3>
        <p className="text-zinc-400 max-w-md">
          Напишіть повідомлення, щоб почати спілкування з AI. 
          Ви можете ставити питання, просити допомоги з кодом, 
          або просто поспілкуватися.
        </p>
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('uk', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export default MessageList;
