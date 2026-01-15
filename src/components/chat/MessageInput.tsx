'use client';

/**
 * MessageInput - Мінімалістичне поле вводу
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
  placeholder = 'Message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;
    if (disabled) return;
    onSend(message.trim(), images.length > 0 ? images : undefined);
    setMessage('');
    setImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-neutral-800 p-3">
      <div className="max-w-3xl mx-auto">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt=""
                  className="w-14 h-14 object-cover rounded"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-700 
                    rounded-full text-neutral-400 text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2">
          {/* Image upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 px-3 py-2 bg-neutral-800 rounded text-sm resize-none
              text-neutral-200 placeholder-neutral-500 border border-neutral-700
              focus:outline-none focus:border-neutral-600
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && images.length === 0)}
            className="p-2 text-neutral-500 hover:text-neutral-200 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
