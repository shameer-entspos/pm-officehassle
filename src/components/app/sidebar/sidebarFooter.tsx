'use client';
import clsx from 'clsx';
import { LogOut, User } from 'lucide-react';
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const SidebarFooter = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();

  const isActive = pathname.startsWith('/profile');

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };
  return (
    <div className="flex flex-col gap-2 sm:p-2">
      <Link
        className={clsx(
          'from-bground-1 rounded-lg border to-zinc-100 hover:bg-gradient-to-br dark:to-zinc-800',
          isActive
            ? 'dark:border-primary/20 dark:text-primary border-neutral-200 bg-gradient-to-br'
            : 'border-transparent'
        )}
        href={'/profile'}
      >
        <li className="flex items-center justify-center sm:justify-start">
          <div className="flex size-10 flex-shrink-0 items-center justify-center sm:size-12">
            <User
              className={`size-5 sm:size-6 ${
                isActive ? 'dark:text-primary' : 'text-secondary-foreground'
              }`}
            />
          </div>
          {isSidebarOpen && (
            <span
              className={`hidden truncate overflow-hidden text-base text-ellipsis whitespace-nowrap md:block ${
                isActive ? 'font-bold' : 'font-light'
              }`}
            >
              Profile
            </span>
          )}
        </li>
      </Link>

      <button
        className={clsx(
          'from-bground-1 cursor-pointer rounded-lg border border-transparent to-zinc-200 hover:bg-gradient-to-br dark:to-zinc-800'
        )}
        onClick={async () => {
          await signOut();
        }}
      >
        <li className="flex items-center justify-center sm:justify-start">
          <div className="flex size-10 flex-shrink-0 items-center justify-center sm:size-12">
            <LogOut className="h-5 w-5" />
          </div>
          {isSidebarOpen && (
            <span className="hidden truncate overflow-hidden text-base font-light text-ellipsis whitespace-nowrap md:block">
              Logout
            </span>
          )}
        </li>
      </button>

      <button
        className={clsx(
          'from-bground-1 cursor-pointer rounded-lg border border-transparent bg-gradient-to-br to-zinc-200 dark:to-zinc-800'
        )}
        onClick={toggleTheme}
      >
        <li className="flex items-center justify-center sm:justify-start">
          <div className="flex size-10 flex-shrink-0 items-center justify-center sm:size-12">
            {theme === 'dark' ? (
              <Sun className="size-4 sm:size-5" />
            ) : (
              <Moon className="size-4 sm:size-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </div>
          {isSidebarOpen && (
            <span className="hidden truncate overflow-hidden text-base font-light text-ellipsis whitespace-nowrap md:block">
              Toggle Theme
            </span>
          )}
        </li>
      </button>
    </div>
  );
};

export default SidebarFooter;
