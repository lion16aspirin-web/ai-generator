'use client';

/**
 * useTokens - Хук для роботи з токенами користувача
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface TokenState {
  available: number;
  used: number;
  total: number;
  plan: string;
  loading: boolean;
  error: string | null;
}

interface UseTokensReturn extends TokenState {
  refresh: () => Promise<void>;
  deduct: (amount: number) => Promise<boolean>;
  hasEnough: (required: number) => boolean;
}

export function useTokens(): UseTokensReturn {
  const { data: session } = useSession();
  
  const [state, setState] = useState<TokenState>({
    available: 0,
    used: 0,
    total: 0,
    plan: 'free',
    loading: true,
    error: null,
  });

  // Завантаження токенів
  const refresh = useCallback(async () => {
    if (!session?.user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/user/tokens');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      
      setState({
        available: data.available ?? 0,
        used: data.used ?? 0,
        total: data.total ?? 0,
        plan: data.plan ?? 'free',
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [session?.user]);

  // Списання токенів
  const deduct = useCallback(async (amount: number): Promise<boolean> => {
    if (state.available < amount) {
      return false;
    }

    try {
      const response = await fetch('/api/user/tokens/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        return false;
      }

      // Оновлюємо локальний стан
      setState(prev => ({
        ...prev,
        available: prev.available - amount,
        used: prev.used + amount,
      }));

      return true;
    } catch {
      return false;
    }
  }, [state.available]);

  // Перевірка достатності токенів
  const hasEnough = useCallback((required: number): boolean => {
    return state.available >= required;
  }, [state.available]);

  // Завантажуємо при зміні сесії
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    deduct,
    hasEnough,
  };
}

// ============================================
// ХЕЛПЕРИ ДЛЯ ФОРМАТУВАННЯ
// ============================================

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function getTokenPercentage(available: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((available / total) * 100);
}
