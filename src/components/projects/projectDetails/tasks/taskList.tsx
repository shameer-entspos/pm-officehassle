'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Project } from '@/zustand/project/projectStore';
import {
  createProjectTaskStatusAPI,
  deleteProjectTaskAPI,
  getProjectAllTasksAPI,
  getProjectEmployeeTasksAPI,
} from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Loader from '@/components/app/loading/loading';
import UpdateTaskModal from './modals/updateTaskModal';
import { useProfile } from '@/zustand/user/userStore';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status: { status: string };
  start_date: string;
  end_date?: string | null;
  assign_to?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TasksListProps {
  project: Project;
  taskCreated: boolean;
  filter: string;
}

const PAGE_SIZE = 10;

const TasksList = ({ project, taskCreated, filter }: TasksListProps) => {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const [projectAllTasks, setProjectAllTasks] = useState<Task[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [itemSelectedForDelete, setItemSelectedForDelete] =
    useState<Task | null>(null);
  const [itemSelectedForUpdate, setItemSelectedForUpdate] =
    useState<Task | null>(null);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [showUpdateItemModal, setShowUpdateItemModal] = useState(false);
  const [taskUpdated, setTaskUpdated] = useState(false);

  const createProjectTaskStatus = (taskId: string, crrStatus: string) => {
    const reqData = {
      project_task: taskId,
      status: crrStatus,
    };
    createProjectTaskStatusAPI(reqData, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        // Update the local state to reflect the new status
        setProjectAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: { status: crrStatus } }
              : task
          )
        );
        setProjectTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: { status: crrStatus } }
              : task
          )
        );
        handleTaskUpdated();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  const handleOpenDeleteItemModal = (task: Task) => {
    setItemSelectedForDelete(task);
    setShowDeleteItemModal(true);
  };
  const handleCloseDeleteItemModal = () => {
    setShowDeleteItemModal(false);
    setItemSelectedForDelete(null);
  };

  const handleOpenUpdateItemModal = (task: Task) => {
    setItemSelectedForUpdate(task);
    setShowUpdateItemModal(true);
  };
  const handleCloseUpdateItemModal = () => {
    setShowUpdateItemModal(false);
    setItemSelectedForUpdate(null);
  };
  const handleTaskUpdated = () => {
    setTaskUpdated(!taskUpdated);
  };

  useEffect(() => {
    if (project?.id && session?.user?.access) {
      if (profile?.role === 'admin') {
        getProjectAllTasks(project.id);
      } else {
        getProjectEmployeeAllTasks(project.id);
      }
    }
  }, [project, taskCreated, taskUpdated, filter, session]);

  useEffect(() => {
    if (!project?.id) return;

    const ws = new WebSocket(
      `${process.env.API_WS_PREFIX}/sync_project_tasks/${project.id}`
    );

    ws.onopen = () => {
      console.log('ws connection created!');
    };

    ws.onmessage = (msg) => {
      const myPromise = new Promise((resolve) =>
        setTimeout(() => resolve(''), 3000)
      );
      toast.promise(myPromise, {
        loading: 'Syncing...',
        success: 'Sync successfully.',
        error: 'Could not sync.',
      });

      const data = JSON.parse(msg.data)['payload'];
      console.log('ws message received', data);
      const filteredData =
        filter === 'pending' ||
        filter === 'in progress' ||
        filter === 'completed'
          ? data.filter((t: Task) => t.status?.status === filter)
          : data;
      handleRenderTasks(filteredData);
    };

    ws.onclose = () => {
      console.log('ws connection closed');
    };

    ws.onerror = (err) => {
      console.error('ws error', err);
    };

    return () => {
      ws.close();
    };
  }, [project, filter]);

  const getProjectAllTasks = async (projectId: string) => {
    try {
      const res = await getProjectAllTasksAPI(
        projectId,
        session?.user?.access ?? ''
      );
      console.log(res.data.data);

      const tasks =
        filter === 'pending' ||
        filter === 'completed' ||
        filter === 'in progress'
          ? res.data.data.filter((t: Task) => t.status.status === filter)
          : res.data.data;
      handleRenderTasks(tasks);
    } catch (error: any) {
      if (error.response) {
        const err = `Unable to fetch project tasks. error(${error.response.data.message})`;
        toast.error(err);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const getProjectEmployeeAllTasks = async (projectId: string) => {
    try {
      const res = await getProjectEmployeeTasksAPI(
        projectId,
        session?.user?.access ?? ''
      );
      console.log(res.data.data);

      const tasks =
        filter === 'pending' ||
        filter === 'completed' ||
        filter === 'in progress'
          ? res.data.data.filter((t: Task) => t.status.status === filter)
          : res.data.data;
      handleRenderTasks(tasks);
    } catch (error: any) {
      if (error.response) {
        const err = `Unable to fetch project tasks. error(${error.response.data.message})`;
        toast.error(err);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteProjectTask = () => {
    if (!itemSelectedForDelete) {
      toast.error('Unable to delete item.');
      return;
    }

    deleteProjectTaskAPI(itemSelectedForDelete.id, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleCloseDeleteItemModal();
        getProjectAllTasks(project.id);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(
            `Unable to delete task. error(${error.response.data.message})`
          );
        } else {
          toast.error(error.message);
        }
      });
  };

  const handleRenderTasks = (tasks: Task[]) => {
    setProjectAllTasks(tasks);
    setProjectTasks(tasks.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setTotalPages(Math.ceil(tasks.length / PAGE_SIZE));
  };

  const handleNextPage = () => {
    if (currentPage === totalPages) return;
    const lastIdx = (currentPage + 1) * PAGE_SIZE;
    const startIdx = lastIdx - PAGE_SIZE;
    const visibleTasks = projectAllTasks.slice(startIdx, lastIdx);
    setProjectTasks(visibleTasks);
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;
    const lastIdx = (currentPage - 1) * PAGE_SIZE;
    const startIdx = lastIdx - PAGE_SIZE;
    const visibleTasks = projectAllTasks.slice(startIdx, lastIdx);
    setProjectTasks(visibleTasks);
    setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center py-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      {showDeleteItemModal && (
        <Dialog open={true} onOpenChange={handleCloseDeleteItemModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mt-2 font-medium capitalize">
                {itemSelectedForDelete?.title}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDeleteItemModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteProjectTask}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showUpdateItemModal && (
        <UpdateTaskModal
          handleCloseUpdateItemModal={handleCloseUpdateItemModal}
          itemSelectedForUpdate={itemSelectedForUpdate}
          setItemSelectedForUpdate={setItemSelectedForUpdate}
          handleTaskUpdated={handleTaskUpdated}
        />
      )}

      {projectTasks.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center">
          No tasks found for this filter.
        </p>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-2xl"
            style={{
              boxShadow: '0px 0px 8px 0px #00000010',
            }}
          >
            <Table className="bg-bground-2 overflow-hidden rounded-2xl">
              <TableHeader>
                <TableRow className="bg-bground h-12 rounded-t-3xl">
                  <TableHead className="w-[50px] text-center">Sr.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead style={{ width: '10%', textAlign: 'right' }}>
                    Due Date
                  </TableHead>
                  <TableHead style={{ width: '20%', textAlign: 'center' }}>
                    Status
                  </TableHead>
                  {profile?.role === 'admin' && (
                    <TableHead style={{ width: '10%', textAlign: 'right' }}>
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTasks.map((task, index) => (
                  <TableRow key={task.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      {task.assign_to
                        ? `${task.assign_to.first_name} ${task.assign_to.last_name}`
                        : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      {new Date(task.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {task.end_date
                        ? new Date(task.end_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="flex justify-center">
                      {profile?.role !== 'client' ? (
                        <Select
                          name="task_status"
                          onValueChange={(value) =>
                            createProjectTaskStatus(task.id, value)
                          }
                          value={task?.status?.status || 'pending'}
                        >
                          <SelectTrigger className="w-[130px] capitalize">
                            <SelectValue placeholder="Select Task Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="capitalize">
                              Pending
                            </SelectItem>
                            <SelectItem
                              value="in progress"
                              className="capitalize"
                            >
                              In Progress
                            </SelectItem>
                            <SelectItem
                              value="completed"
                              className="capitalize"
                            >
                              Completed
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2 capitalize">
                          {task?.status?.status || 'pending'}
                        </p>
                      )}
                    </TableCell>
                    {profile?.role === 'admin' && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenUpdateItemModal(task)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleOpenDeleteItemModal(task)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksList;
