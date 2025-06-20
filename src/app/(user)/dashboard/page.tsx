import Dashboard from '@/components/app/dashboard/dashboard';
// import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const DashboardPage = () => {
  return (
    <div className="custom-scrollbar space-y-5 overflow-auto">
      <Dashboard />
      {/* <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[170px] xl:h-[200px]" />
        <Skeleton className="h-[170px] xl:h-[200px]" />
        <Skeleton className="h-[170px] xl:h-[200px]" />
        <Skeleton className="h-[170px] xl:h-[200px]" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div> */}
    </div>
  );
};

export default DashboardPage;
