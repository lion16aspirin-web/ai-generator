'use client';

/**
 * useChatShortcuts - Гарячі клавіші для чату
 */

import { useEffect, useRef } from 'react';

interface UseChatShortcutsOptions {
  onNewChat?: () => void;
  onFocusInput?: () => void;
  onClear?: () => void;
  enabled?: boolean;
}

export function useChatShortcuts({
  onNewChat,
  onFocusInput,
  onClear,
  enabled = true,
}: UseChatShortcutsOptions) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K - Новий чат
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onNewChat?.();
        return;
      }

      // Cmd/Ctrl + / - Фокус на input
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onFocusInput?.();
        inputRef.current?.focus();
        return;
      }

      // Cmd/Ctrl + Delete - Очистити чат
      if ((e.metaKey || e.ctrlKey) && e.key === 'Delete') {
        e.preventDefault();
        onClear?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNewChat, onFocusInput, onClear]);

  return { inputRef };
}
