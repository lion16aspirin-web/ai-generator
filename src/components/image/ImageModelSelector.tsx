'use client';

/**
 * ImageModelSelector - Вибір моделі для зображень
 */

import React, { useState } from 'react';
import { getImageModelsByProvider } from '@/lib/ai/image/models';
import { ImageModel } from '@/lib/ai/types';

interface ImageModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ImageModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ImageModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modelGroups = getImageModelsByProvider();

  const currentModel = modelGroups
    .flatMap(g => g.models)
    .find(m => m.id === selectedModel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
          text-sm font-medium transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span>{currentModel?.name || 'Виберіть модель'}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto
            bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-20">
            {modelGroups.map(group => (
              <div key={group.provider}>
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 
                  uppercase tracking-wider bg-zinc-800/50 sticky top-0">
                  {group.name}
                </div>
                
                {group.models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-3 py-2 flex items-center justify-between text-left
                      hover:bg-zinc-800 transition-colors
                      ${model.id === selectedModel ? 'bg-zinc-800' : ''}
                    `}
                  >
                    <div>
                      <div className="font-medium text-white text-sm">
                        {model.name}
                        {model.id === selectedModel && (
                          <span className="ml-2 text-emerald-500">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {model.description}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">
                      ${model.pricePerImage}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 9l-7 7-7-7" 
      />
    </svg>
  );
}

export default ImageModelSelector;
