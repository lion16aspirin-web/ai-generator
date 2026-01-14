/**
 * Token Utils - Утиліти для роботи з токенами
 */

import prisma from '@/lib/prisma';

// ============================================
// ОПЕРАЦІЇ З ТОКЕНАМИ
// ============================================

/**
 * Отримати токени користувача
 */
export async function getUserTokens(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokens: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    available: user.tokens,
    used: 0, // TODO: Track used tokens
    total: user.tokens,
    plan: user.role === 'ADMIN' ? 'admin' : 'free',
  };
}

/**
 * Списати токени
 */
export async function deductTokens(
  userId: string, 
  amount: number,
  reason?: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true },
  });

  if (!user || user.tokens < amount) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: { decrement: amount },
    },
  });

  // TODO: Log transaction
  console.log(`Deducted ${amount} tokens from user ${userId}. Reason: ${reason}`);

  return true;
}

/**
 * Додати токени
 */
export async function addTokens(
  userId: string, 
  amount: number,
  reason?: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: { increment: amount },
    },
  });

  console.log(`Added ${amount} tokens to user ${userId}. Reason: ${reason}`);
}

/**
 * Встановити токени
 */
export async function setTokens(
  userId: string, 
  amount: number
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { tokens: amount },
  });
}

// ============================================
// ФОРМАТУВАННЯ
// ============================================

/**
 * Форматувати кількість токенів
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Конвертувати USD в токени
 */
export function usdToTokens(usd: number): number {
  // 1 токен = $0.0001
  return Math.ceil(usd / 0.0001);
}

/**
 * Конвертувати токени в USD
 */
export function tokensToUsd(tokens: number): number {
  return tokens * 0.0001;
}
