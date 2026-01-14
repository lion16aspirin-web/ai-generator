'use client';

/**
 * StreamingMessage - Компонент для відображення streaming тексту
 */

import React from 'react';

interface StreamingMessageProps {
  content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <span className="whitespace-pre-wrap">{content}</span>
      <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
    </div>
  );
}

export default StreamingMessage;
