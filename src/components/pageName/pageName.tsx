'use client';
import { usePageNameStore } from '@/zustand/app/pageName';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const pathNameMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/checkins': 'Checkins',
  '/taskDocumentation': 'Task Documentation',
  '/attendances': 'Attendances',
  '/inbox': 'Inbox',
  '/projects': 'Projects',
  '/profile': 'Profile',
};

const getPageNameFromPath = (pathname: string): string => {
  // Remove role prefix from the path
  const cleanedPath =
    pathname.replace(/^\/admin/, '').replace(/^\/employee/, '') || '/dashboard';

  // Exact match
  if (pathNameMap[cleanedPath]) return pathNameMap[cleanedPath];

  if (cleanedPath.startsWith('/projects/')) return 'Projects';

  // Fallback
  const segments = cleanedPath.split('/').filter(Boolean);
  return segments
    .map((segment) =>
      segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(' / ');
};

export const GetPageName = () => {
  const pathname = usePathname();
  const { setName } = usePageNameStore();

  useEffect(() => {
    const pageName = getPageNameFromPath(pathname);
    setName(pageName);
  }, [pathname]);

  return null;
};
