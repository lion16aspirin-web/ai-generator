/**
 * Animation Models - Конфігурація моделей анімації
 */

import { AnimationModel } from '../types';
import { ANIMATION_MODELS, getAnimationModel } from '../config';

// ============================================
// ТИПИ АНІМАЦІЇ
// ============================================

export type AnimationType = 
  | 'portrait' // Оживлення портретів
  | 'landscape' // Анімація пейзажів
  | 'product' // Анімація товарів
  | 'artistic'; // Художня анімація

// ============================================
// ПРЕСЕТИ АНІМАЦІЇ
// ============================================

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  prompt: string;
  type: AnimationType;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'gentle-motion',
    name: 'Легкий рух',
    description: 'Ледь помітна анімація',
    prompt: 'subtle gentle motion, breathing effect',
    type: 'portrait',
  },
  {
    id: 'head-turn',
    name: 'Поворот голови',
    description: 'Плавний поворот голови',
    prompt: 'slow head turn, natural movement',
    type: 'portrait',
  },
  {
    id: 'blink-smile',
    name: 'Моргання та усмішка',
    description: 'Природне моргання та легка усмішка',
    prompt: 'natural eye blink, slight smile',
    type: 'portrait',
  },
  {
    id: 'wind-hair',
    name: 'Вітер у волоссі',
    description: 'Волосся розвивається на вітрі',
    prompt: 'hair blowing in wind, gentle breeze',
    type: 'portrait',
  },
  {
    id: 'water-reflection',
    name: 'Відображення води',
    description: 'Анімація водної поверхні',
    prompt: 'water ripples, reflection movement',
    type: 'landscape',
  },
  {
    id: 'clouds-moving',
    name: 'Рух хмар',
    description: 'Хмари повільно пливуть',
    prompt: 'clouds slowly moving across sky',
    type: 'landscape',
  },
  {
    id: 'leaves-falling',
    name: 'Падіння листя',
    description: 'Листя падає з дерев',
    prompt: 'autumn leaves falling, gentle wind',
    type: 'landscape',
  },
  {
    id: 'product-rotate',
    name: 'Обертання',
    description: '360° огляд продукту',
    prompt: 'slow 360 rotation, product showcase',
    type: 'product',
  },
  {
    id: 'zoom-in',
    name: 'Наближення',
    description: 'Плавний зум до деталей',
    prompt: 'slow zoom in, focus on details',
    type: 'product',
  },
  {
    id: 'dreamy-effect',
    name: 'Мрійливий ефект',
    description: 'Художня анімація з розмиттям',
    prompt: 'dreamy ethereal movement, soft blur',
    type: 'artistic',
  },
  {
    id: 'glitch-art',
    name: 'Гліч арт',
    description: 'Цифрові спотворення',
    prompt: 'glitch effect, digital distortion',
    type: 'artistic',
  },
];

/**
 * Отримати пресети по типу
 */
export function getPresetsByType(type: AnimationType): AnimationPreset[] {
  return ANIMATION_PRESETS.filter(p => p.type === type);
}

/**
 * Отримати пресет по ID
 */
export function getPreset(id: string): AnimationPreset | undefined {
  return ANIMATION_PRESETS.find(p => p.id === id);
}

// ============================================
// КАЛЬКУЛЯТОР
// ============================================

export function calculateAnimationCost(modelId: string): number {
  const model = getAnimationModel(modelId);
  return model?.pricePerAnimation || 0.08;
}

export function estimateAnimationTime(durationSeconds: number): number {
  // Базовий час + час на кожну секунду
  return 30 + durationSeconds * 10;
}

// ============================================
// ЕКСПОРТ
// ============================================

export { ANIMATION_MODELS, getAnimationModel };
