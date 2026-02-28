// src/hooks/useResourceHints.ts
import { useEffect } from 'react';

interface PreloadConfig {
  href: string;
  as: 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
}

interface PreconnectConfig {
  href: string;
  crossOrigin?: boolean;
}

export const useResourceHints = (
  preloads: PreloadConfig[] = [],
  preconnects: PreconnectConfig[] = [],
  prefetches: string[] = []
) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Preconnect to critical origins
    preconnects.forEach(({ href, crossOrigin = true }) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (crossOrigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical resources
    preloads.forEach(({ href, as, type, crossOrigin, media }) => {
      if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      if (media) link.media = media;
      document.head.appendChild(link);
    });

    // Prefetch likely-to-be-used resources
    prefetches.forEach(href => {
      if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, [preloads, preconnects, prefetches]);
};