'use client';
import React from 'react';
import TaskDocsHeader from './taskDocsHeader';
import TaskDocsTable from './taskDocsTable';

const TaskDocumentations = () => {
  const [reload, setReload] = React.useState(false);

  return (
    <>
      <TaskDocsHeader reload={reload} setReload={setReload} />
      <div className="flex flex-col gap-4 p-3 md:p-6">
        <TaskDocsTable reload={reload} setReload={setReload} />
      </div>
    </>
  );
};

export default TaskDocumentations;
