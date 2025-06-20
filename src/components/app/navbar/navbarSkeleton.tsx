import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const NavbarSkeleton = () => {
  return (
    <header className="flex h-20 items-center justify-between gap-4 px-2 py-2 md:h-24 md:px-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-1 rounded-none" />
        <Skeleton className="h-6 w-10 rounded-xl lg:w-16 xl:w-24" />
      </div>

      <div className="flex items-center justify-end gap-2 rounded-xl">
        <Skeleton className="h-6 w-10 rounded-xl lg:w-16 xl:w-24" />
        <Skeleton className="h-10 w-1 rounded-none" />
        <Skeleton className="size-10 rounded-full lg:size-12" />
      </div>
    </header>
  );
};

export default NavbarSkeleton;
