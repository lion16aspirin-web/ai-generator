'use client';

/**
 * MessageInput - Поле вводу повідомлень
 */

import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Напишіть повідомлення...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Автоматична висота textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Відправка повідомлення
  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;
    if (disabled) return;

    onSend(message.trim(), images.length > 0 ? images : undefined);
    setMessage('');
    setImages([]);
  };

  // Обробка Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Завантаження зображень
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Скидаємо input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Видалення зображення
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/50 p-4">
      {/* Прев'ю зображень */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Upload ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 
                  rounded-full text-white text-sm opacity-0 group-hover:opacity-100
                  transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        {/* Кнопка завантаження */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 
            text-zinc-400 hover:text-white transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-zinc-800 rounded-xl resize-none
              text-white placeholder-zinc-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Кнопка відправки */}
        <button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && images.length === 0)}
          className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 
            text-white transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-emerald-600"
        >
          <SendIcon />
        </button>
      </div>

      {/* Підказка */}
      <p className="text-xs text-zinc-500 mt-2 text-center">
        Enter — відправити, Shift+Enter — новий рядок
      </p>
    </div>
  );
}

// ============================================
// ІКОНКИ
// ============================================

function ImageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
      />
    </svg>
  );
}

export default MessageInput;
