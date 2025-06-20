import React from 'react';
import CreateTaskDocsModal from './modals/createTaskDocsModal';

const TaskDocsHeader = ({ reload, setReload }: any) => {
  return (
    <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
      <h1 className="text-lg font-bold md:text-xl">Task Documentation</h1>

      <CreateTaskDocsModal reload={reload} setReload={setReload} />
    </div>
  );
};

export default TaskDocsHeader;
