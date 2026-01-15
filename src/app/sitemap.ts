/**
 * sitemap.xml
 */

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://ai-generator-lion16aspirins-projects.vercel.app';
  const locales = ['uk', 'en'];
  const routes = [
    '',
    '/chat',
    '/images',
    '/video',
    '/animate',
    '/pricing',
    '/docs',
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    }
  }

  return urls;
}
