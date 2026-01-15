'use client';

/**
 * ChatItem - Мінімалістичний елемент чату
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      await onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setEditTitle(chat.title);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = async () => {
    if (confirmDelete) {
      await onDelete();
      setConfirmDelete(false);
      setShowMenu(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      onClick={isEditing ? undefined : onSelect}
      className={`
        group relative px-2 py-1.5 rounded cursor-pointer text-xs
        ${isSelected 
          ? 'bg-neutral-800 text-neutral-200' 
          : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300'
        }
      `}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={handleKeyDown}
          className="w-full bg-neutral-700 border border-neutral-600 rounded px-1.5 py-0.5 text-xs text-neutral-200 outline-none"
        />
      ) : (
        <div className="flex items-center justify-between gap-1">
          <span className="truncate flex-1">{chat.title}</span>
          
          {/* Menu trigger */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-700 transition-opacity"
            >
              <svg className="w-3 h-3 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-5 z-20 w-28 bg-neutral-800 border border-neutral-700 rounded shadow-lg py-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="w-full px-2 py-1 text-left text-[10px] text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                >
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onExport('md');
                  }}
                  className="w-full px-2 py-1 text-left text-[10px] text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                >
                  Export MD
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onExport('json');
                  }}
                  className="w-full px-2 py-1 text-left text-[10px] text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                >
                  Export JSON
                </button>
                <hr className="my-0.5 border-neutral-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick();
                  }}
                  className={`w-full px-2 py-1 text-left text-[10px] hover:bg-neutral-700 ${
                    confirmDelete ? 'text-red-400' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {confirmDelete ? 'Click to confirm' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatItem;
