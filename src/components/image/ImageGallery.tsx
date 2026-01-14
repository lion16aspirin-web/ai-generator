'use client';

/**
 * ImageGallery - Галерея згенерованих зображень
 */

import React, { useState } from 'react';
import { GeneratedImage } from '@/lib/ai/types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDownload: (url: string, filename?: string) => void;
}

export function ImageGallery({ images, onDownload }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square max-w-2xl mx-auto rounded-xl overflow-hidden
        bg-zinc-800 group">
        <img
          src={selectedImage.url}
          alt="Generated"
          className="w-full h-full object-contain"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
          transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={() => window.open(selectedImage.url, '_blank')}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 
              text-white transition-colors"
          >
            🔍 Відкрити
          </button>
          <button
            onClick={() => onDownload(selectedImage.url, `image-${Date.now()}.png`)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 
              text-white transition-colors"
          >
            ⬇️ Завантажити
          </button>
        </div>
      </div>

      {/* Revised prompt */}
      {selectedImage.revisedPrompt && (
        <div className="max-w-2xl mx-auto p-3 rounded-lg bg-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">Оптимізований промпт:</p>
          <p className="text-sm text-zinc-200">{selectedImage.revisedPrompt}</p>
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                w-16 h-16 rounded-lg overflow-hidden transition-all
                ${index === selectedIndex 
                  ? 'ring-2 ring-emerald-500 scale-105' 
                  : 'opacity-60 hover:opacity-100'
                }
              `}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
