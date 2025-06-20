import React from 'react';

const AttendancesHeader = () => {
  return (
    <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
      <div>
        <h1 className="text-lg font-bold md:text-xl">Attendances</h1>
      </div>
    </div>
  );
};

export default AttendancesHeader;
