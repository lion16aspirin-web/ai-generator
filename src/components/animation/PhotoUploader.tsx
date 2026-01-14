'use client';

/**
 * PhotoUploader - Завантаження фото для анімації
 */

import React, { useRef, useState } from 'react';

interface PhotoUploaderProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
}

export function PhotoUploader({ image, onImageChange }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (image) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="relative max-w-lg">
          <img
            src={image}
            alt="Uploaded"
            className="w-full rounded-xl shadow-lg"
          />
          <button
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 w-10 h-10 bg-red-500 rounded-full
              text-white flex items-center justify-center text-xl
              hover:bg-red-400 transition-colors"
          >
            ×
          </button>
          <p className="text-center mt-4 text-zinc-400">
            Готово до анімації! Виберіть ефект праворуч →
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-full max-w-lg aspect-square rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center cursor-pointer
          transition-colors
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-900/20' 
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30'
          }
        `}
      >
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Завантажте фото
        </h3>
        <p className="text-zinc-400 text-center px-4">
          Перетягніть зображення сюди або клікніть для вибору
        </p>
        <p className="text-zinc-500 text-sm mt-4">
          Підтримуються: JPG, PNG, WebP
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default PhotoUploader;
