'use client';

/**
 * ChatItem - Елемент списку чатів
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatListItem } from '@/hooks/useChats';

interface ChatItemProps {
  chat: ChatListItem;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (title: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onExport: (format: 'md' | 'json') => void;
}

export function ChatItem({
  chat,
  isSelected,
  onSelect,
  onRename,
  onDelete,
  onExport,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Фокус на інпут при редагуванні
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Закриття меню при кліку поза ним
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Збереження нової назви
  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      await onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  // Обробка клавіш при редагуванні
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(chat.title);
      setIsEditing(false);
    }
  };

  // Видалення з підтвердженням
  const handleDelete = async () => {
    setShowMenu(false);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    await onDelete();
    setIsDeleting(false);
  };

  // Форматування дати
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сьогодні';
    if (days === 1) return 'Вчора';
    if (days < 7) return `${days} дн. тому`;
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <div className="relative">
      {/* Діалог підтвердження видалення */}
      {isDeleting && (
        <div className="absolute inset-0 z-10 bg-zinc-900/95 rounded-lg flex flex-col items-center justify-center p-2 gap-2">
          <span className="text-xs text-zinc-300 text-center">Видалити чат?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeleting(false)}
              className="px-2 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600"
            >
              Ні
            </button>
            <button
              onClick={confirmDelete}
              className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
            >
              Так
            </button>
          </div>
        </div>
      )}

      {/* Основний елемент */}
      <div
        onClick={isEditing ? undefined : onSelect}
        className={`
          group relative p-3 rounded-lg cursor-pointer transition-all
          ${isSelected 
            ? 'bg-violet-600/20 border border-violet-500/50' 
            : 'hover:bg-zinc-800/50 border border-transparent'
          }
        `}
      >
        {/* Назва чату */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-800 border border-violet-500 rounded px-2 py-1 text-sm text-white outline-none"
          />
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {chat.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">
                  {formatDate(chat.updatedAt)}
                </span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-500">
                  {chat.messageCount} повід.
                </span>
              </div>
            </div>

            {/* Меню дій */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-700 transition-opacity"
              >
                <MoreIcon />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 z-20 w-36 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                  >
                    ✏️ Перейменувати
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onExport('md');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                  >
                    📄 Експорт MD
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onExport('json');
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                  >
                    📦 Експорт JSON
                  </button>
                  <hr className="my-1 border-zinc-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                  >
                    🗑️ Видалити
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Іконка меню
function MoreIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

export default ChatItem;
