'use client';
import React from 'react';
import AttendancesTable from './attandancesTable';
import AttendancesHeader from './attendancesHeader';

const Attendances = () => {
  const [reload, setReload] = React.useState(false);

  return (
    <>
      <AttendancesHeader />

      <div className="flex flex-col gap-4 p-3 md:p-6">
        <AttendancesTable reload={reload} setReload={setReload} />
      </div>
    </>
  );
};

export default Attendances;
