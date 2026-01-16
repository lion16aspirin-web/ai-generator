'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  locale: string;
  tokens?: number;
}

export function MainLayout({ children, locale, tokens }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar locale={locale} />
      <Header locale={locale} tokens={tokens} />
      <main className="ml-64 pt-16 min-h-screen fixed top-0 left-64 right-0 bottom-0 overflow-hidden">
        <div className="p-6 h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}




