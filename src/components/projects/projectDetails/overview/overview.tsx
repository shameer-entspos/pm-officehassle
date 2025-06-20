'use client';
import React, { useState } from 'react';
import ProjectRoles from './members/projectRoles';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProjectResources from './resources/projectResources';
import { useProjectStore } from '@/zustand/project/projectStore';
import Loader from '@/components/app/loading/loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/zustand/user/userStore';

const tabLinks = ['Project Members', 'Project Resources'];

const Overview = () => {
  const { profile } = useProfile();
  const { project } = useProjectStore();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showAddEmpToProjectModal, setShowAddEmpToProjectModal] =
    useState(false);
  const [showUploadResourcesModal, setShowUploadResourcesModal] =
    useState(false);

  const handleOpenEmpToProjectModal = () => setShowAddEmpToProjectModal(true);
  const handleCloseEmpToProjectModal = () => setShowAddEmpToProjectModal(false);
  const handleOpenAssignRoleModal = () => setShowAssignRoleModal(true);
  const handleCloseAssignRoleModal = () => setShowAssignRoleModal(false);

  return project ? (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between gap-2">
        <h1 className="text-lg font-semibold md:text-xl">Overview</h1>

        <div className="border-chart-1 hidden rounded-2xl border lg:flex">
          {tabLinks.map((tab, index) => (
            <Button
              size={'sm'}
              variant={selectedTab === index ? 'new' : 'ghost'}
              onClick={() => setSelectedTab(index)}
              key={tab}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl border lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'sm'} variant={'new'}>
                  {tabLinks[selectedTab]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {tabLinks.map((tab, index) => (
                  <DropdownMenuItem
                    className={`${selectedTab === index ? 'bg-chart-1 hover:!bg-chart-1 !text-white' : ''} cursor-pointer`}
                    onClick={() => setSelectedTab(index)}
                    key={tab}
                  >
                    {tab}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {profile?.role === 'admin' && (
            <Button
              size={'sm'}
              onClick={() =>
                selectedTab === 0
                  ? handleOpenEmpToProjectModal()
                  : setShowUploadResourcesModal(true)
              }
              variant={'outline'}
            >
              <Plus /> <span className="hidden md:inline">Add</span>
            </Button>
          )}
        </div>
      </div>

      {(() => {
        switch (selectedTab) {
          case 0:
            return (
              <ProjectRoles
                // handleOpenEmpToProjectModal={handleOpenEmpToProjectModal}
                handleOpenAssignRoleModal={handleOpenAssignRoleModal}
                handleCloseEmpToProjectModal={handleCloseEmpToProjectModal}
                handleCloseAssignRoleModal={handleCloseAssignRoleModal}
                showAssignRoleModal={showAssignRoleModal}
                showAddEmpToProjectModal={showAddEmpToProjectModal}
                project={project}
              />
            );
          case 1:
            return (
              <ProjectResources
                project={project}
                showUploadResourcesModal={showUploadResourcesModal}
                setShowUploadResourcesModal={setShowUploadResourcesModal}
              />
            );
          default:
            return (
              <ProjectRoles
                // handleOpenEmpToProjectModal={handleOpenEmpToProjectModal}
                handleOpenAssignRoleModal={handleOpenAssignRoleModal}
                handleCloseEmpToProjectModal={handleCloseEmpToProjectModal}
                handleCloseAssignRoleModal={handleCloseAssignRoleModal}
                showAssignRoleModal={showAssignRoleModal}
                showAddEmpToProjectModal={showAddEmpToProjectModal}
                project={project}
              />
            );
        }
      })()}
    </div>
  ) : (
    <div className="grid h-[400px] place-content-center">
      <Loader />
    </div>
  );
};

export default Overview;
