'use client';

/**
 * ModelSelector - Компонент вибору AI моделі
 */

import React, { useState } from 'react';
import { getModelsByProvider, ModelGroup } from '@/lib/ai/text/models';
import { TextModel } from '@/lib/ai/types';
import { formatTokens } from '@/hooks/useTokens';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modelGroups = getModelsByProvider();

  const currentModel = modelGroups
    .flatMap(g => g.models)
    .find(m => m.id === selectedModel);

  return (
    <div className="relative">
      {/* Trigger Button */}
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
        <ModelIcon provider={currentModel?.provider || 'openai'} />
        <span>{currentModel?.name || 'Виберіть модель'}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto
            bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-20">
            {modelGroups.map(group => (
              <div key={group.provider}>
                {/* Provider Header */}
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 
                  uppercase tracking-wider bg-zinc-800/50 sticky top-0">
                  {group.name}
                </div>
                
                {/* Models */}
                {group.models.map(model => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={model.id === selectedModel}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// СУБКОМПОНЕНТИ
// ============================================

interface ModelOptionProps {
  model: TextModel;
  isSelected: boolean;
  onClick: () => void;
}

function ModelOption({ model, isSelected, onClick }: ModelOptionProps) {
  const avgPrice = ((model.inputPrice + model.outputPrice) / 2).toFixed(2);
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-3 py-3 flex items-start gap-3 text-left
        hover:bg-zinc-800 transition-colors
        ${isSelected ? 'bg-zinc-800' : ''}
      `}
    >
      <ModelIcon provider={model.provider} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{model.name}</span>
          {isSelected && (
            <span className="text-emerald-500">✓</span>
          )}
        </div>
        
        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
          {model.description}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          {/* Price */}
          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
            ${avgPrice}/1M
          </span>
          
          {/* Capabilities */}
          {model.capabilities.includes('vision') && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300">
              👁 Vision
            </span>
          )}
          {model.capabilities.includes('reasoning') && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">
              🧠 Reasoning
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ============================================
// ІКОНКИ
// ============================================

interface ModelIconProps {
  provider: string;
}

function ModelIcon({ provider }: ModelIconProps) {
  const icons: Record<string, string> = {
    openai: '🟢',
    anthropic: '🟠',
    google: '🔵',
    deepseek: '🟣',
    xai: '⚫',
    moonshot: '🌙',
  };

  return (
    <span className="text-lg">{icons[provider] || '🤖'}</span>
  );
}

interface ChevronIconProps {
  isOpen: boolean;
}

function ChevronIcon({ isOpen }: ChevronIconProps) {
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

export default ModelSelector;
