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
    searchText,
    setSearchText,
    renameChat,
    deleteChat,
    exportChat,
  } = useChats();

  // Collapsed version
  if (isCollapsed) {
    return (
      <div className="w-10 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-2 gap-2">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300"
            title="Expand"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <button
          onClick={onNewChat}
          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          title="New chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  // Expanded version
  return (
    <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-slate-800 flex items-center gap-1.5">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 
            bg-slate-900 hover:bg-slate-800 rounded text-slate-400 
            hover:text-slate-200 text-xs transition-colors border border-slate-800"
        >
          <span>+</span>
          <span>New chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-slate-800">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search..."
          className="w-full bg-slate-900 border border-slate-800 rounded 
            px-2 py-1.5 text-xs text-slate-300 placeholder-slate-500
            focus:outline-none focus:border-slate-700 transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Loading...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
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
      <div className="p-2 border-t border-slate-800">
        <div className="text-[10px] text-slate-600 text-center">
          {filteredChats.length} chats
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar;
