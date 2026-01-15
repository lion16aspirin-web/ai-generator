'use client';

/**
 * ChatSidebar - Бокова панель зі списком чатів
 */

import React from 'react';
import { useChats, ChatListItem } from '@/hooks/useChats';
import { ChatItem } from './ChatItem';

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onNewChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({
  selectedChatId,
  onSelectChat,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) {
  const {
    filteredChats,
    isLoading,
    error,
    searchText,
    setSearchText,
    renameChat,
    deleteChat,
    exportChat,
  } = useChats();

  // Мобільна версія - колапс
  if (isCollapsed) {
    return (
      <div className="w-12 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-3 gap-2">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
          title="Розгорнути"
        >
          <MenuIcon />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white"
          title="Новий чат"
        >
          <PlusIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300">Чати</h2>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400"
            >
              <MenuIcon />
            </button>
          )}
        </div>

        {/* Кнопка нового чату */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 
            bg-violet-600 hover:bg-violet-500 rounded-lg text-white text-sm 
            font-medium transition-colors"
        >
          <PlusIcon />
          Новий чат
        </button>
      </div>

      {/* Пошук */}
      <div className="p-3 border-b border-zinc-800">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Пошук чатів..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg 
              pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500
              focus:outline-none focus:border-violet-500 transition-colors"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 
                rounded hover:bg-zinc-700 text-zinc-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Список чатів */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-sm text-red-400">
            {error}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-500">
            {searchText ? 'Нічого не знайдено' : 'Немає чатів'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onSelect={() => onSelectChat(chat.id)}
              onRename={(title) => renameChat(chat.id, title)}
              onDelete={async () => {
                const success = await deleteChat(chat.id);
                if (success && chat.id === selectedChatId) {
                  onSelectChat(null);
                }
                return success;
              }}
              onExport={(format) => exportChat(chat.id, format)}
            />
          ))
        )}
      </div>

      {/* Footer з кількістю */}
      <div className="p-3 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 text-center">
          {filteredChats.length} {getChatsWord(filteredChats.length)}
        </div>
      </div>
    </div>
  );
}

// Хелпер для відмінювання слова "чат"
function getChatsWord(count: number): string {
  if (count === 1) return 'чат';
  if (count >= 2 && count <= 4) return 'чати';
  return 'чатів';
}

// Іконки
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default ChatSidebar;
