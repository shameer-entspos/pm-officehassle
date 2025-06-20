'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getProjectAllTasksAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProjectStore } from '@/zustand/project/projectStore';
import TaskModal from '../tasks/modals/taskModal';
import UpdateTaskModal from '../tasks/modals/updateTaskModal';
import TasksCalendar from './tasksCalendar';

interface Task {
  id: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  priority: string;
  assign_to?: { id: string; first_name: string; last_name: string } | null;
  project_added_employees?: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}

const PMCalendar = () => {
  const { project } = useProjectStore();
  const { data: session } = useSession();
  const [allEvents, setAllEvents] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [itemSelectedForUpdate, setItemSelectedForUpdate] =
    useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showUpdateItemModal, setShowUpdateItemModal] =
    useState<boolean>(false);
  const [taskUpdated, setTaskUpdated] = useState<boolean>(false);

  const handleOpenCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleOpenUpdateItemModal = () => setShowUpdateItemModal(true);
  const handleCloseUpdateItemModal = () => setShowUpdateItemModal(false);

  const handleTaskUpdated = () => setTaskUpdated(!taskUpdated);

  useEffect(() => {
    if (project?.id) {
      getProjectAllTasks(project.id);
    }
  }, [project, taskUpdated]);

  const getProjectAllTasks = (projectId: string) => {
    setLoading(true);
    getProjectAllTasksAPI(projectId, session?.user?.access ?? '')
      .then((res) => {
        const allProjects: Task[] = res.data.data;
        setAllEvents(allProjects);
        setLoading(false);
      })
      .catch((error: any) => {
        setLoading(false);
        if (error.response) {
          toast.error(
            `Unable to fetch project tasks. error(${error.response.data.message})`
          );
        } else {
          toast.error(error.message);
        }
      });
  };

  const handleDateSelect = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    handleOpenCreateModal();
  };

  // const handleActiveStartDateChange = ({
  //   activeStartDate,
  // }: {
  //   activeStartDate: Date;
  // }) => {
  //   setCurrentMonth(activeStartDate);
  // };

  const handleSelectEvent = (event: Task) => {
    setItemSelectedForUpdate(event);
    handleOpenUpdateItemModal();
  };

  return (
    <div className="mx-auto w-full">
      {showUpdateItemModal && itemSelectedForUpdate && (
        <UpdateTaskModal
          handleCloseUpdateItemModal={handleCloseUpdateItemModal}
          itemSelectedForUpdate={itemSelectedForUpdate}
          setItemSelectedForUpdate={setItemSelectedForUpdate}
          handleTaskUpdated={handleTaskUpdated}
        />
      )}
      {showCreateModal && (
        <TaskModal
          handleCloseCreateModal={handleCloseCreateModal}
          setTaskCreated={setTaskUpdated}
          taskCreated={taskUpdated}
          startDate={selectedDate}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      ) : (
        <div className="h-full">
          <div className="h-full w-full">
            <TasksCalendar
              events={allEvents}
              onSelectSlot={handleDateSelect}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PMCalendar;
