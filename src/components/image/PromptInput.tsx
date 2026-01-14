'use client';

/**
 * PromptInput - Поле вводу промпту для зображень
 */

import React, { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function PromptInput({
  onGenerate,
  isGenerating,
  disabled = false,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || disabled) return;
    onGenerate(prompt.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
      <div className="flex gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={disabled ? 'Недостатньо токенів...' : 'Опишіть зображення...'}
          disabled={isGenerating || disabled}
          rows={2}
          className="flex-1 px-4 py-3 bg-zinc-800 rounded-xl resize-none
            text-white placeholder-zinc-500
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating || disabled}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 
            text-white font-medium transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner />
              Генерація...
            </span>
          ) : (
            '🎨 Створити'
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
        <span>Детальний опис = кращий результат</span>
        <span>{prompt.length}/1000</span>
      </div>
    </form>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
      />
    </svg>
  );
}

export default PromptInput;
