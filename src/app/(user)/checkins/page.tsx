import CheckIns from '@/components/checkins/checkins';
import React from 'react';

const CheckInsPage = () => {
  return (
    <div className="bg-bground-1 custom-scrollbar flex h-full w-full flex-col overflow-auto rounded-3xl">
      <CheckIns />
    </div>
  );
};

export default CheckInsPage;
