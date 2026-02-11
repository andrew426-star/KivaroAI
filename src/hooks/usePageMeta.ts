import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonicalPath?: string;
}

/**
 * Sets per-page <title> and <meta name="description"> for GEO / SEO.
 * Each page should provide a clear, "answer-first" summary in the description.
 */
export function usePageMeta({ title, description, canonicalPath }: PageMeta) {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', description);
      document.head.appendChild(metaDesc);
    }

    // Also update OG description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    // Update OG URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const fullUrl = `https://www.kivaro.ai${canonicalPath || '/'}`;
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);

    // Set canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = fullUrl;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = fullUrl;
      document.head.appendChild(canonical);
    }

    return () => {
      // Reset to default on unmount
      document.title = 'Kivaro AI — AI Automation & Intelligence for Hedge Funds';
    };
  }, [title, description, canonicalPath]);
}
