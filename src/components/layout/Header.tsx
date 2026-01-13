'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Coins, 
  Globe,
  Bell,
  Search,
  LogOut,
  Settings,
  Crown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  locale: string;
  tokens?: number;
}

export function Header({ locale, tokens: propTokens }: HeaderProps) {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const otherLocale = locale === 'uk' ? 'en' : 'uk';
  const newPathname = pathname.replace(`/${locale}`, `/${otherLocale}`);

  // Use tokens from session if available, otherwise use prop
  const tokens = (session?.user as { tokens?: number })?.tokens ?? propTokens ?? 0;
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === 'ADMIN';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${locale}` });
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder={t('search')}
            className="w-full h-10 rounded-xl bg-slate-800/50 border border-slate-700 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Tokens - show only when logged in */}
          {session && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">
                {tokens.toLocaleString()} {t('tokens')}
              </span>
            </div>
          )}

          {/* Notifications - show only when logged in */}
          {session && (
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-500" />
            </button>
          )}

          {/* Language Switcher */}
          <Link
            href={newPathname}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium uppercase">{otherLocale}</span>
          </Link>

          {/* User Menu or Login */}
          {status === 'loading' ? (
            <div className="h-10 w-24 rounded-xl bg-slate-800 animate-pulse" />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/50"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-white flex items-center gap-1">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                    {isAdmin && <Crown className="h-3 w-3 text-amber-400" />}
                  </div>
                  <div className="text-xs text-slate-400">{session.user?.email}</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <div className="text-sm font-medium text-white">{session.user?.name}</div>
                    <div className="text-xs text-slate-400">{session.user?.email}</div>
                    <div className="text-xs text-amber-400 mt-1">
                      {tokens.toLocaleString()} токенів
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/settings`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {locale === 'uk' ? 'Налаштування' : 'Settings'}
                  </Link>

                  {isAdmin && (
                    <Link
                      href={`/${locale}/admin`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-amber-400 hover:bg-slate-800 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Crown className="h-4 w-4" />
                      {locale === 'uk' ? 'Адмін панель' : 'Admin Panel'}
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {locale === 'uk' ? 'Вийти' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                {t('login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
