'use client';

import Loader from '@/components/app/loading/loading';
import {
  deleteProjectAPI,
  getEmployeeProjectAPI,
  getProjectAPI,
  updateProjectAPI,
} from '@/lib/api';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteItem from './deleteProject';
import ProjectHeader from './projectDetailsHeader';
import { Button } from '@/components/ui/button';
import Overview from './overview/overview';
import Tasks from './tasks/tasks';
import Board from './board/board';
import PMCalendar from './calendar/calendar';
import { useProjectTabs } from '@/zustand/projectTabs/projectTabsStore';
import Attachments from './attachments/attachments';
import { useProfile } from '@/zustand/user/userStore';

const tabLinks = [
  'Overview',
  'Tasks',
  'Attachments',
  'Timeline',
  'Calendar',
  'Messages',
  'Board',
];

interface Project {
  id: string;
  title: string;
  status?: { status: string } | null;
  all_statuses?: [string, string][];
}

const tabComponents: { [key: string]: React.ReactNode } = {
  Overview: <Overview />,
  Tasks: <Tasks />,
  Attachments: <Attachments />,
  Timeline: <div>Timeline</div>,
  Calendar: <PMCalendar />,
  Messages: <div>Messages</div>,
  Board: <Board />,
  'Unknown Tab': <div>Unknown Tab</div>,
};

const ProjectDetails = ({ pid }: { pid: string }) => {
  const { profile } = useProfile();
  const { tab, changeTab } = useProjectTabs();

  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: session }: any = useSession();

  useEffect(() => {
    if (pid && session?.user?.access) {
      if (profile?.role === 'admin') {
        fetchProjectDetails();
      } else {
        fetchEmployeeProjectDetails();
      }
    }
  }, [pid, session?.user]);

  useEffect(() => {
    return () => {
      changeTab('Overview');
    };
  }, []);

  // employee project
  const fetchEmployeeProjectDetails = async () => {
    try {
      const response = await getEmployeeProjectAPI(pid, session?.user?.access);
      if (response) {
        setProject(response.data.data);
      }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || error.message || 'Unexpected error';
      toast.error(`Unable to fetch dashboard data. (${errMsg})`);
    } finally {
      setLoading(false);
    }
  };

  // admin project
  const fetchProjectDetails = async () => {
    try {
      const response = await getProjectAPI(pid, session?.user?.access);
      if (response) {
        setProject(response.data.data);
      }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || error.message || 'Unexpected error';
      toast.error(`Unable to fetch dashboard data. (${errMsg})`);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = (data: { status: string }) => {
    updateProjectAPI(project!.id, session?.user?.access ?? '', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
        fetchProjectDetails(); // Refresh project data after update
      })
      .catch((error) => {
        if (error.response) {
          const err = `Unable to update project. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      });
  };

  const handleDeleteItem = async () => {
    try {
      await deleteProjectAPI(project!.id, session?.user?.access);
      toast.success(`Project ${project!.title} deleted successfully`);
      setShowDeleteModal(false);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || error.message || 'Unexpected error';
      toast.error(`Unable to delete project. (${errMsg})`);
    }
  };

  const handleCancelDeleteItem = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteItemModal = () => {
    setShowDeleteModal(true);
  };

  return loading ? (
    <div className="grid h-full w-full place-content-center">
      <Loader />
    </div>
  ) : (
    <div className="w-full overflow-auto">
      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteItem
          item={project!.title}
          deleteItem={handleDeleteItem}
          cancelDeleteItem={handleCancelDeleteItem}
        />
      )}

      {/* Use ProjectHeader component */}
      <ProjectHeader
        project={project as Project}
        updateProject={updateProject}
        handleOpenDeleteItemModal={handleOpenDeleteItemModal}
      />

      {/* Tabs */}
      <div className="hidden w-full items-center gap-2 overflow-x-auto border-b px-3 py-3 [scrollbar-width:none] md:flex md:px-6 [&::-webkit-scrollbar]:hidden">
        {tabLinks.map((tb, index) => (
          <Button
            key={index}
            size="sm"
            variant={tb === tab ? 'custom' : 'ghost'}
            onClick={() => changeTab(tb)}
          >
            {tb}
          </Button>
        ))}
      </div>

      <div className="overflow-auto px-3 py-3 md:px-6">
        {/* Render component based on tab using loop */}
        {tabComponents[tab] || tabComponents['Unknown Tab']}
      </div>
    </div>
  );
};

export default ProjectDetails;
