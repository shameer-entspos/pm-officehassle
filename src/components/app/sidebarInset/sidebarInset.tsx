'use client';
import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import { useSidebarAutoToggle } from '@/hooks/useAutoSidebarToggle';
import clsx from 'clsx';
import React from 'react';
import Navbar from '../navbar/navbar';
import { usePathname } from 'next/navigation';

const SidebarInset = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen } = useSidebarState();
  const pathname = usePathname();
  useSidebarAutoToggle();

  return (
    <div
      className={clsx(
        `dark:bg-bground flex-shrink-0 overflow-y-auto bg-neutral-200 transition-all duration-200`,
        {
          'w-[calc(100%_-_60px)] sm:w-[calc(100%_-_80px)]': !isSidebarOpen,
          'w-[calc(100%_-_60px)] sm:w-[calc(100%_-_80px)] md:w-[calc(100%_-_280px)] lg:w-[calc(100%_-_300px)]':
            isSidebarOpen,
        }
      )}
    >
      <Navbar />
      <main
        className={`h-[calc(100%_-_96px)] ${pathname === '/inbox' ? 'p-1' : 'p-3'} !pt-0 sm:p-4 md:p-6 lg:p-8`}
      >
        {children}
      </main>
    </div>
  );
};

export default SidebarInset;
