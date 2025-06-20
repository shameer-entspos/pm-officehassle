'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import TaskModal from './modals/taskModal';
import TasksList from './taskList';
import { Project, useProjectStore } from '@/zustand/project/projectStore';
import { useProfile } from '@/zustand/user/userStore';

const tabLinks = ['All', 'Pending', 'In Progress', 'Completed'];

const Tasks = () => {
  const { profile } = useProfile();
  const { project } = useProjectStore();
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [taskCreated, setTaskCreated] = useState<boolean>(false);

  const filter = tabLinks[selectedTab].toLowerCase();

  const handleOpenCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  useEffect(() => {
    // Placeholder for future useEffect logic if needed
  }, [project]);

  return (
    <div>
      {showCreateModal && (
        <TaskModal
          handleCloseCreateModal={handleCloseCreateModal}
          setTaskCreated={setTaskCreated}
          taskCreated={taskCreated}
          startDate={new Date()} // Pass a default start date; adjust as needed
        />
      )}

      <div className="mb-4 flex w-full items-center justify-between gap-2">
        <h1 className="text-lg font-semibold md:text-xl">Tasks</h1>

        <div className="border-chart-1 hidden rounded-2xl border md:flex">
          {tabLinks.map((tab, index) => (
            <Button
              size="sm"
              variant={selectedTab === index ? 'new' : 'ghost'}
              onClick={() => setSelectedTab(index)}
              key={tab}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="block md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                {tabLinks.map((tab, index) => (
                  <DropdownMenuItem
                    className={`${selectedTab === index ? 'bg-chart-1 hover:!bg-chart-1 text-white' : ''} cursor-pointer`}
                    onClick={() => setSelectedTab(index)}
                    key={tab}
                  >
                    {tab}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {profile?.role == 'admin' && (
            <Button variant="outline" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4" /> Create
            </Button>
          )}
        </div>
      </div>

      <TasksList
        project={project as Project}
        taskCreated={taskCreated}
        filter={filter}
      />
    </div>
  );
};

export default Tasks;
