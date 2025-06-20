import Loader from '@/components/app/loading/loading';
import Projects from '@/components/projects/projects';
import React, { Suspense } from 'react';

const ProjectsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="grid h-[400px] place-content-center">
          <Loader />
        </div>
      }
    >
      <div className="bg-bground-1 custom-scrollbar flex h-full w-full justify-between overflow-auto rounded-3xl">
        <Projects />
      </div>
    </Suspense>
  );
};

export default ProjectsPage;
