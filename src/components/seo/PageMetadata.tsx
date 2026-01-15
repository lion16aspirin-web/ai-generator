'use client';

/**
 * PageMetadata - Client component for dynamic metadata
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageMetadataProps {
  title: string;
  description?: string;
  path?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-generator-lion16aspirins-projects.vercel.app';

export function PageMetadata({ title, description, path }: PageMetadataProps) {
  const pathname = usePathname();
  const currentPath = path || pathname;
  const fullTitle = `${title} | AI Generator`;
  const metaDescription = description || 'Generate text, images, videos and animations with AI. Powered by GPT-5, Claude, Gemini and more.';
  const url = `${siteUrl}${currentPath}`;
  const ogImage = `${siteUrl}/og-image.png`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', metaDescription);
    updateMetaTag('keywords', 'AI, artificial intelligence, GPT, Claude, Gemini, image generation, video generation, chatbot');
    
    // Open Graph
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', metaDescription, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'AI Generator', true);
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', metaDescription);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [fullTitle, metaDescription, url, ogImage, currentPath]);

  return null;
}
