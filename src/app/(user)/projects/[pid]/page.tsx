import ProjectDetails from '@/components/projects/projectDetails/projectDetails';
import React from 'react';

interface Params {
  pid: string;
}

const ProjectDetailsPage = async ({ params }: { params: Promise<Params> }) => {
  const idParams = await params;

  return (
    <div className="bg-bground-1 custom-scrollbar flex h-full w-full justify-between rounded-3xl">
      <ProjectDetails pid={idParams.pid} />
    </div>
  );
};

export default ProjectDetailsPage;
