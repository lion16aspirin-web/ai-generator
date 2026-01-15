'use client';

/**
 * ModelSelector - Мінімалістичний селектор моделі
 */

import React, { useState } from 'react';
import { getModelsByProvider } from '@/lib/ai/text/models';
import { TextModel } from '@/lib/ai/types';

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
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-2.5 py-1.5 rounded
          bg-slate-900 hover:bg-slate-800 border border-slate-800
          text-xs transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-700'}
        `}
      >
        <span className="text-neutral-400">{currentModel?.name || 'Select'}</span>
        <svg 
          className={`w-3 h-3 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto
            bg-slate-950 border border-slate-800 rounded shadow-xl z-20">
            {modelGroups.map(group => (
              <div key={group.provider}>
                <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider 
                  bg-slate-900 sticky top-0 border-b border-slate-800">
                  {group.name}
                </div>
                
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
        w-full px-3 py-2 flex items-center justify-between text-left
        hover:bg-slate-900 transition-colors text-xs
        ${isSelected ? 'bg-slate-900' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <span className={`text-slate-300 ${isSelected ? 'text-slate-100' : ''}`}>
          {model.name}
        </span>
        {isSelected && (
          <span className="text-slate-500">•</span>
        )}
      </div>
      
      <span className="text-slate-600">${avgPrice}</span>
    </button>
  );
}

export default ModelSelector;
