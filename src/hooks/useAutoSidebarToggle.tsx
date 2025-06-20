// hooks/useSidebarAutoToggle.ts
'use client';
import { useEffect } from 'react';
import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import { usePathname } from 'next/navigation';

export const useSidebarAutoToggle = () => {
  const { setIsSidebarOpen } = useSidebarState();
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        console.log(pathname);
        if (pathname !== '/inbox') {
          // Screen changed to lg or larger (>=1024px), open the sidebar
          setIsSidebarOpen(true);
        }
      } else {
        // Screen changed to smaller than lg (<1024px), close the sidebar
        setIsSidebarOpen(false);
      }
    };

    // Add listener for changes only (no initial check)
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [setIsSidebarOpen]);
};
