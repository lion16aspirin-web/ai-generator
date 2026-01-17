'use client';

/**
 * StreamingMessage - Компонент для відображення streaming тексту
 */

import React from 'react';

interface StreamingMessageProps {
  content: string;
  status?: 'thinking' | 'searching' | 'streaming';
  toolCalls?: any[];
}

export function StreamingMessage({ content, status, toolCalls }: StreamingMessageProps) {
  // Показуємо індикацію thinking/searching
  if (status === 'thinking' || status === 'searching') {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <span>
          {status === 'searching' ? '🔍 Шукаю в інтернеті...' : '🤔 Думаю...'}
        </span>
        {toolCalls && toolCalls.length > 0 && (
          <span className="text-xs text-slate-500">
            (викликано {toolCalls.length} інструмент{toolCalls.length > 1 ? 'ів' : ''})
          </span>
        )}
      </div>
    );
  }

  // Звичайний streaming контент
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <span className="whitespace-pre-wrap">{content}</span>
      <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
    </div>
  );
}

export default StreamingMessage;
