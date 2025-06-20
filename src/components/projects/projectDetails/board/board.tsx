/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { toast } from 'sonner';
import { Loader2, Flag, Paperclip } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createProjectTaskStatusAPI, getProjectAllTasksAPI } from '@/lib/api';
import moment from 'moment';
import { useProjectStore } from '@/zustand/project/projectStore';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status: { status: string };
  start_date: string;
  end_date?: string | null;
  assign_to?: { image?: string; first_name: string; last_name: string };
  sub_tasks: { assign_to?: { image?: string } }[];
}

interface BoardData {
  pending: Task[];
  inProgress: Task[];
  completed: Task[];
}

const Board = () => {
  const { project } = useProjectStore();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BoardData>({
    pending: [],
    inProgress: [],
    completed: [],
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceKey =
      source.droppableId === 'in progress' ? 'inProgress' : source.droppableId;
    const destKey =
      destination.droppableId === 'in progress'
        ? 'inProgress'
        : destination.droppableId;
    const newStatus = destKey === 'inProgress' ? 'in progress' : destKey;

    const sourceItems = [...data[sourceKey as keyof BoardData]];
    const [movedItem] = sourceItems.splice(source.index, 1);
    movedItem.status.status = newStatus;

    const destItems =
      sourceKey === destKey
        ? sourceItems
        : [...data[destKey as keyof BoardData]];
    destItems.splice(destination.index, 0, movedItem);

    setData({
      ...data,
      [sourceKey]: sourceItems,
      [destKey]: destItems,
    });

    createProjectTaskStatus(movedItem.id, newStatus);
  };

  useEffect(() => {
    if (project?.id && session?.user?.access) {
      getProjectAllTasks(project.id);
    }
  }, [project, session]);

  const getProjectAllTasks = async (projectId: string) => {
    setLoading(true);
    try {
      const res = await getProjectAllTasksAPI(
        projectId,
        session?.user?.access ?? ''
      );
      const allTasks: Task[] = res.data.data;
      console.log('All Tasks:', allTasks);
      setTasks(allTasks);
      setData({
        pending: allTasks.filter((task) => task.status.status === 'pending'),
        inProgress: allTasks.filter(
          (task) => task.status.status === 'in progress'
        ),
        completed: allTasks.filter(
          (task) => task.status.status === 'completed'
        ),
      });
    } catch (error: any) {
      if (error.response) {
        toast.error(
          `Unable to fetch project tasks. (${error.response.data.message})`
        );
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createProjectTaskStatus = (taskId: string, status: string) => {
    setLoading(true);
    const reqData = { project_task: taskId, status };
    createProjectTaskStatusAPI(reqData, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 lg:flex-row">
          {(['pending', 'inProgress', 'completed'] as const).map((column) => (
            <Droppable
              droppableId={column === 'inProgress' ? 'in progress' : column}
              key={column}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-background w-full rounded-xl border p-4 lg:w-1/3"
                >
                  <h4 className="mb-4 text-center text-lg font-semibold capitalize">
                    {column === 'inProgress' ? 'In Progress' : column}
                  </h4>
                  {data[column].length === 0 ? (
                    <p className="text-muted-foreground text-center text-sm">
                      No tasks
                    </p>
                  ) : (
                    data[column].map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={`${item.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`mb-4 shadow-sm ${snapshot.isDragging ? 'opacity-75' : ''}`}
                          >
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold">
                                  <Badge
                                    variant="secondary"
                                    className={`${
                                      column === 'pending'
                                        ? 'bg-red-100 text-red-800'
                                        : column === 'inProgress'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {item.title}
                                  </Badge>
                                </CardTitle>
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex -space-x-2">
                                    {item.assign_to?.image && (
                                      <img
                                        className="h-6 w-6 rounded-full border-2 border-white"
                                        src={`${API_URL_PREFIX}${item.assign_to.image}`}
                                        alt={`${item.assign_to.first_name} ${item.assign_to.last_name}`}
                                      />
                                    )}
                                    {item.sub_tasks.map(
                                      (subTask, i) =>
                                        subTask.assign_to?.image && (
                                          <img
                                            key={i}
                                            className="h-6 w-6 rounded-full border-2 border-white"
                                            src={`${API_URL_PREFIX}${subTask.assign_to.image}`}
                                            alt=""
                                          />
                                        )
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {item.priority || 'None'}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-muted-foreground mb-2 text-sm">
                                {item.description || 'No description'}
                              </p>
                              <div className="text-muted-foreground flex flex-wrap gap-2 text-sm">
                                <div className="flex items-center">
                                  <Flag className="mr-1 h-4 w-4" />
                                  <span>
                                    {moment(item.start_date).format('D MMMM')}
                                    {item.end_date && ' - '}
                                    {item.end_date &&
                                      moment(item.end_date).format('D MMMM')}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Paperclip className="mr-1 h-4 w-4" />
                                  <span>
                                    {item.sub_tasks.length} Sub Task
                                    {item.sub_tasks.length !== 1 && 's'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
