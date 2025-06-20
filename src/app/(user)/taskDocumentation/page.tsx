'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const TaskDocumentations = dynamic(
  () => import('@/components/taskDocumentation/taskDocumentations'),
  {
    ssr: false, // Disable server-side rendering
  }
);

const TaskDocumentationPage = () => {
  return (
    <div className="bg-bground-1 custom-scrollbar flex h-full w-full flex-col overflow-auto rounded-3xl">
      <TaskDocumentations />
    </div>
  );
};

export default TaskDocumentationPage;
