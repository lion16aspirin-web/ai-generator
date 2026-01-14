import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['uk', 'en'],
  
  // Default locale
  defaultLocale: 'uk',
  
  // Locale prefix strategy
  localePrefix: 'as-needed'
});

export type Locale = (typeof routing.locales)[number];




