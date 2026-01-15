'use client';

/**
 * ChatSidebar - Мінімалістична бокова панель
 */

import React from 'react';
import { useChats } from '@/hooks/useChats';
import { ChatItem } from './ChatItem';

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  selectedChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const {
    filteredChats,
    isLoading,
    searchText,
    setSearchText,
    renameChat,
    deleteChat,
    exportChat,
  } = useChats();

  return (
    <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-neutral-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 
            bg-neutral-800 hover:bg-neutral-750 rounded text-neutral-400 
            hover:text-neutral-200 text-xs transition-colors border border-neutral-700"
        >
          <span>+</span>
          <span>New chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-neutral-800">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded 
            px-2 py-1.5 text-xs text-neutral-300 placeholder-neutral-500
            focus:outline-none focus:border-neutral-600 transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-neutral-500">
            Loading...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-500">
            {searchText ? 'Not found' : 'No chats'}
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

      {/* Footer */}
      <div className="p-2 border-t border-neutral-800">
        <div className="text-[10px] text-neutral-600 text-center">
          {filteredChats.length} chats
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar;
