'use client';

/**
 * MessageList - Мінімалістичний список повідомлень
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/lib/ai/types';
import { StreamingMessage } from './StreamingMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message, index) => (
          <MessageItem 
            key={message.id} 
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ============================================
// MESSAGE ITEM
// ============================================

interface MessageItemProps {
  message: ChatMessage;
  isStreaming: boolean;
}

function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium
        ${isUser ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-400'}
      `}>
        {isUser ? 'U' : 'A'}
      </div>

      {/* Content */}
      <div className={`
        flex-1 min-w-0
        ${isUser ? 'text-right' : ''}
      `}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className={`flex gap-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
            {message.images.map((img, i) => (
              <img 
                key={i}
                src={img}
                alt=""
                className="max-w-40 max-h-40 rounded object-cover"
              />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div className={`
          inline-block max-w-full rounded-lg px-3 py-2 text-sm
          ${isUser 
            ? 'bg-slate-800 text-slate-100' 
            : 'bg-slate-900/50 text-slate-200'
          }
          ${!isUser ? 'text-left' : ''}
        `}>
          {isStreaming ? (
            <StreamingMessage content={message.content} />
          ) : (
            <MarkdownContent content={message.content} isUser={isUser} />
          )}
        </div>

        {/* Time */}
        <div className={`text-[10px] text-slate-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MARKDOWN CONTENT
// ============================================

interface MarkdownContentProps {
  content: string;
  isUser: boolean;
}

function MarkdownContent({ content, isUser }: MarkdownContentProps) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),
        
        // Headers
        h1: ({ children }) => (
          <h1 className="text-base font-semibold mt-4 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-semibold mt-3 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-medium mt-2 mb-1 first:mt-0">{children}</h3>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-neutral-200">{children}</li>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 underline hover:text-slate-200 transition-colors"
          >
            {children}
          </a>
        ),
        
        // Inline code
        code: ({ className, children }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            const language = className?.replace('language-', '') || '';
            return (
              <CodeBlock language={language} code={String(children).trim()} />
            );
          }
          return (
            <code className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
              {children}
            </code>
          );
        },
        
        // Code blocks
        pre: ({ children }) => <>{children}</>,
        
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-slate-700 pl-3 my-2 text-slate-400 italic">
            {children}
          </blockquote>
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-800 px-2 py-1 bg-slate-900 text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-800 px-2 py-1">{children}</td>
        ),
        
        // Horizontal rule
        hr: () => <hr className="my-3 border-slate-800" />,
        
        // Strong & Em
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-300">{children}</em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============================================
// CODE BLOCK
// ============================================

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-2 rounded overflow-hidden bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border-b border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      
      {/* Code */}
      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
        <code className="text-slate-300 font-mono">{code}</code>
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
      <div className="text-center max-w-sm px-4">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-900 flex items-center justify-center">
          <span className="text-slate-500 text-xl">?</span>
        </div>
        <p className="text-sm text-slate-400">
          Ask anything to start a conversation
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
