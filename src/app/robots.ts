/**
 * robots.txt
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://ai-generator-lion16aspirins-projects.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/_next/',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
