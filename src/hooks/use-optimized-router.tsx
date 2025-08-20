import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export function useOptimizedRouter() {
  const router = useRouter();
  const navigationCache = useRef<Set<string>>(new Set());

  const push = useCallback((href: string) => {
    // Add to cache to prevent duplicate navigations
    if (navigationCache.current.has(href)) {
      return;
    }
    
    navigationCache.current.add(href);
    
    // Clear cache after a short delay
    setTimeout(() => {
      navigationCache.current.delete(href);
    }, 1000);

    // Use router.push for navigation
    router.push(href);
  }, [router]);

  const prefetch = useCallback((href: string) => {
    // Prefetch the route for faster navigation
    router.prefetch(href);
  }, [router]);

  return {
    push,
    prefetch,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
  };
}
