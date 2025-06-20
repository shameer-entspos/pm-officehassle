import { UserProfile } from '@/zustand/user/userStore';
import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

const SidebarHeader = ({
  isSidebarOpen,
  profile,
}: {
  isSidebarOpen: boolean;
  profile: UserProfile | null;
}) => {
  return (
    <div
      className={clsx(
        `flex min-w-0 items-center justify-start gap-2 overflow-hidden rounded-lg text-nowrap sm:items-start sm:p-2`,
        {
          'flex-col': !isSidebarOpen,
          'flex-col md:flex-row': isSidebarOpen,
        }
      )}
    >
      <div className="size-10 flex-shrink-0 rounded-lg bg-zinc-700 p-1 sm:size-12 dark:bg-zinc-800">
        <Image
          src="/officehassle.png"
          alt="site-logo"
          className="h-full object-contain"
          width={40}
          height={40}
        />
      </div>

      {isSidebarOpen && (
        <div className="hidden md:block">
          <h2
            className={clsx(
              'from-primary to-chart-4 truncate overflow-hidden bg-clip-text text-lg font-bold text-ellipsis whitespace-nowrap text-black lg:text-xl dark:bg-gradient-to-r dark:text-transparent'
            )}
          >
            PM Officehassle
          </h2>

          <h2
            className={clsx(
              'text-secondary-foreground/80 overflow-hidden text-xs font-light text-ellipsis whitespace-nowrap md:text-sm'
            )}
          >
            {profile?.company_name || 'Officehassle'}
          </h2>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
