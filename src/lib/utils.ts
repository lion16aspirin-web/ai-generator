import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateTokenCost(
  type: 'text' | 'image' | 'video' | 'animate',
  model: string
): number {
  const costs: Record<string, Record<string, number>> = {
    text: {
      'gpt-5-nano': 50,
      'gpt-4.1': 100,
      'gpt-5': 200,
      'claude-4-sonnet': 100,
      'claude-4-opus': 200,
      'gemini-2.5-pro': 80,
      'gemini-2.5-flash': 40,
      'deepseek-r1': 60,
      'llama-4': 30,
      'grok-3': 100,
    },
    image: {
      'nano-banana': 500,
      'dall-e-3': 2000,
      'flux-pro': 1500,
      'flux-dev': 1000,
      'midjourney-6': 2500,
      'stable-diffusion-3': 800,
      'ideogram-2': 1200,
      'recraft-v3': 1000,
      'leonardo': 1100,
      'playground-v3': 900,
      'imagen-3': 1800,
    },
    video: {
      'veo-2.1-fast': 15000,
      'veo-3.1': 25000,
      'sora-2': 30000,
      'kling-1.6-pro': 20000,
      'pixverse-v3': 12000,
      'minimax-video': 18000,
      'wan-2.1': 16000,
      'runway-gen3': 22000,
    },
    animate: {
      default: 20000,
    },
  };

  return costs[type]?.[model] || costs[type]?.default || 1000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}


