'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/zustand/user/userStore';
import { createProjectTaskAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useProjectStore } from '@/zustand/project/projectStore';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  user__id?: string;
}

interface CreateTaskProps {
  handleCloseCreateModal: () => void;
  setTaskCreated: (value: boolean) => void;
  taskCreated: boolean;
  startDate?: Date;
}

interface FormData {
  project: string;
  title: string;
  description: string;
  priority: string;
  start_date: string;
  end_date: string;
  assign_to: string;
}

const CreateTask = ({
  handleCloseCreateModal,
  setTaskCreated,
  taskCreated,
  startDate = new Date(),
}: CreateTaskProps) => {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const { project }: any = useProjectStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      project: project ? JSON.stringify(project) : 'default',
      title: '',
      description: '',
      priority: 'default',
      start_date: startDate.toISOString().split('T')[0],
      end_date: '',
      assign_to: 'default',
    },
  });

  useEffect(() => {
    if (!project) {
      // Optionally fetch projects if needed
    }
    const projectValue = form.watch('project');
    const parsedProject = JSON.parse(
      projectValue === 'default' ? '{}' : projectValue
    );
    if (parsedProject?.added_employees && profile?.role === 'employee') {
      const emp = parsedProject.added_employees.find(
        (e: any) => e.user__id === profile.id
      );
      if (emp) {
        form.setValue('assign_to', emp.id);
        console.log('Employee ID set:', emp.id);
      }
    }
  }, [form.watch('project'), profile, project, form.setValue]);

  useEffect(() => {
    const value = form.getValues('assign_to');
    console.log('-->', value);
  }, [form.watch('assign_to')]);

  const onSubmit = (data: FormData) => {
    const parsedProject = JSON.parse(
      data.project === 'default' ? '{}' : data.project
    );
    if (!parsedProject?.id) {
      toast.error('Project required');
      return;
    }

    const start_date = new Date(data.start_date);
    const end_date = data.end_date ? new Date(data.end_date) : null;
    if (end_date && end_date < start_date) {
      toast.error('End date must be equal to or greater than start date');
      return;
    }

    const reqData = {
      ...data,
      project: parsedProject.id,
      priority: data.priority === 'default' ? '' : data.priority,
      assign_to: data.assign_to === 'default' ? '' : data.assign_to,
      start_date: start_date.toISOString(),
      end_date: end_date?.toISOString() || null,
    };
    console.log(reqData);
    createProjectTask(reqData);
  };

  const createProjectTask = (data: any) => {
    setLoading(true);
    createProjectTaskAPI(data, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        setTaskCreated(!taskCreated);
        // handleCloseCreateModal();
      })
      .catch((error) => {
        setLoading(false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={true} onOpenChange={handleCloseCreateModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Task
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {project && (
                <FormField
                  control={form.control}
                  name="project"
                  rules={{ required: 'Project required' }}
                  render={() => (
                    <FormItem className="w-full space-y-2">
                      <FormLabel>Project</FormLabel>
                      <FormControl>
                        <Input
                          value={
                            project ? project.title : 'No project selected'
                          }
                          readOnly
                          className="w-full"
                          placeholder="No project selected"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="title"
                rules={{
                  required: 'Task title required',
                  minLength: {
                    value: 5,
                    message: 'Task title must be greater than 5 characters',
                  },
                }}
                render={({ field }) => (
                  <FormItem className="w-full space-y-2">
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Explain what the Task Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full space-y-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any extra details about the task"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                rules={{ required: 'Task priority required' }}
                render={({ field }) => (
                  <FormItem className="w-full space-y-2">
                    <FormLabel>Task Priority</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">
                            Select Priority
                          </SelectItem>
                          <SelectItem value="low" className="text-capitalize">
                            Low
                          </SelectItem>
                          <SelectItem
                            value="medium"
                            className="text-capitalize"
                          >
                            Medium
                          </SelectItem>
                          <SelectItem value="high" className="text-capitalize">
                            High
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="start_date"
                  rules={{ required: '*Task start date required' }}
                  render={({ field }) => (
                    <FormItem className="w-full space-y-2">
                      <FormLabel>Task Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date: Date | undefined) =>
                            field.onChange(
                              date ? date.toISOString().split('T')[0] : ''
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="w-full space-y-2">
                      <FormLabel>Task End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date: Date | undefined) =>
                            field.onChange(
                              date ? date.toISOString().split('T')[0] : ''
                            )
                          }
                          minDate={
                            form.watch('start_date')
                              ? new Date(form.watch('start_date'))
                              : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {profile?.role !== 'employee' && (
                <FormField
                  control={form.control}
                  name="assign_to"
                  rules={{ required: 'Assignee required' }}
                  render={({ field }) => {
                    const currentProject = JSON.parse(
                      form.watch('project') === 'default'
                        ? '{}'
                        : form.watch('project')
                    );
                    const selectedEmployee =
                      currentProject?.added_employees?.find(
                        (emp: Employee) => emp.id === field.value
                      );

                    return (
                      <FormItem className="w-full space-y-2">
                        <FormLabel className="text-capitalize text-sm font-medium">
                          Assign To
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Assignee">
                                {selectedEmployee
                                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                                  : 'Select Assignee'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">
                                Select Assignee
                              </SelectItem>
                              {currentProject?.added_employees?.map(
                                (emp: Employee) => (
                                  <SelectItem
                                    key={emp.id}
                                    value={emp.id}
                                    className="text-capitalize"
                                  >
                                    {`${emp.first_name} ${emp.last_name}`}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseCreateModal}>
                  Cancel
                </Button>
                <Button variant="custom" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateTask;
