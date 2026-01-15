/**
 * SEO Metadata utilities
 */

import { Metadata } from 'next';

const siteUrl = process.env.NEXTAUTH_URL || 'https://ai-generator-lion16aspirins-projects.vercel.app';
const siteName = 'AI Generator';
const defaultDescription = 'Generate text, images, videos and animations with AI. Powered by GPT-5, Claude, Gemini and more.';

interface GenerateMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Generate metadata for pages
 */
export function generateMetadata({
  title,
  description = defaultDescription,
  path = '',
  image = '/og-image.png',
  noIndex = false,
}: GenerateMetadataOptions): Metadata {
  const url = `${siteUrl}${path}`;
  const ogImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return {
    title: `${title} | ${siteName}`,
    description,
    keywords: [
      'AI',
      'artificial intelligence',
      'GPT',
      'Claude',
      'Gemini',
      'image generation',
      'video generation',
      'chatbot',
      'AI chat',
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'uk_UA',
      url,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Default metadata
 */
export const defaultMetadata: Metadata = generateMetadata({
  title: 'AI Generator',
  description: defaultDescription,
});
