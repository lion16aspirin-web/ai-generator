'use client';

/**
 * useChats - Хук для управління списком чатів
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ChatListItem {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UseChatsReturn {
  chats: ChatListItem[];
  filteredChats: ChatListItem[];
  isLoading: boolean;
  error: string | null;
  searchText: string;
  setSearchText: (text: string) => void;
  loadChats: () => Promise<void>;
  createChat: (title?: string, model?: string) => Promise<ChatListItem | null>;
  renameChat: (id: string, title: string) => Promise<boolean>;
  deleteChat: (id: string) => Promise<boolean>;
  exportChat: (id: string, format: 'md' | 'json') => Promise<void>;
}

export function useChats(): UseChatsReturn {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  // Фільтрація чатів по пошуку
  const filteredChats = useMemo(() => {
    if (!searchText.trim()) return chats;
    
    const query = searchText.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
  }, [chats, searchText]);

  // Завантаження списку чатів
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/chats');
      
      if (!response.ok) {
        throw new Error('Помилка завантаження чатів');
      }

      const data = await response.json();
      setChats(data.chats || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Створення нового чату
  const createChat = useCallback(async (
    title?: string, 
    model?: string
  ): Promise<ChatListItem | null> => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, model }),
      });

      if (!response.ok) {
        throw new Error('Помилка створення чату');
      }

      const data = await response.json();
      const newChat = data.chat;
      
      // Додаємо на початок списку
      setChats(prev => [newChat, ...prev]);
      
      return newChat;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка створення');
      return null;
    }
  }, []);

  // Перейменування чату
  const renameChat = useCallback(async (id: string, title: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Помилка перейменування');
      }

      // Оновлюємо локально
      setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, title } : chat
      ));

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка перейменування');
      return false;
    }
  }, []);

  // Видалення чату
  const deleteChat = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Помилка видалення');
      }

      // Видаляємо локально
      setChats(prev => prev.filter(chat => chat.id !== id));

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
      return false;
    }
  }, []);

  // Експорт чату
  const exportChat = useCallback(async (id: string, format: 'md' | 'json'): Promise<void> => {
    try {
      const response = await fetch(`/api/chats/${id}/export?format=${format}`);

      if (!response.ok) {
        throw new Error('Помилка експорту');
      }

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `chat-${id}.json`);
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/markdown' });
        downloadBlob(blob, `chat-${id}.md`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка експорту');
    }
  }, []);

  // Завантажуємо чати при монтуванні
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    filteredChats,
    isLoading,
    error,
    searchText,
    setSearchText,
    loadChats,
    createChat,
    renameChat,
    deleteChat,
    exportChat,
  };
}

/**
 * Хелпер для скачування файлу
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
