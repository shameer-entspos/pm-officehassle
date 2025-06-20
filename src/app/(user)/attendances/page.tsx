import Attendances from '@/components/attendances/attendances';
import React from 'react';

const Attendancepage = () => {
  return (
    <div className="bg-bground-1 custom-scrollbar flex w-full flex-col overflow-auto rounded-3xl">
      <Attendances />
    </div>
  );
};

export default Attendancepage;
