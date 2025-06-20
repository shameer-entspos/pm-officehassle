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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { changeDateToIsoFormat, changeIsoFormatToDate } from '@/lib/utils';
import { updateProjectTaskAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  user__id?: string;
}

interface UpdateTaskProps {
  handleCloseUpdateItemModal: () => void;
  itemSelectedForUpdate: any;
  setItemSelectedForUpdate: (value: any) => void;
  handleTaskUpdated: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: string;
  start_date: string;
  end_date: string;
  assign_to: string;
}

const UpdateTaskModal = ({
  handleCloseUpdateItemModal,
  itemSelectedForUpdate,
  setItemSelectedForUpdate,
  handleTaskUpdated,
}: UpdateTaskProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      title: itemSelectedForUpdate?.title ?? '',
      description: itemSelectedForUpdate?.description ?? '',
      priority: itemSelectedForUpdate?.priority ?? 'default',
      start_date: itemSelectedForUpdate?.start_date
        ? changeIsoFormatToDate(itemSelectedForUpdate.start_date)
        : '',
      end_date: itemSelectedForUpdate?.end_date
        ? changeIsoFormatToDate(itemSelectedForUpdate.end_date)
        : '',
      assign_to: itemSelectedForUpdate?.assign_to?.id ?? 'default',
    },
  });

  useEffect(() => {
    if (!itemSelectedForUpdate) {
      // Optionally handle case where itemSelectedForUpdate is not provided
    }
  }, [itemSelectedForUpdate]);

  const onSubmit = (data: FormData) => {
    const start_date = new Date(data.start_date);
    const end_date = data.end_date ? new Date(data.end_date) : null;
    if (end_date && end_date < start_date) {
      toast.error('End date must be equal to or greater than start date');
      return;
    }

    const reqData = {
      ...data,
      start_date: changeDateToIsoFormat(start_date),
      end_date: end_date ? changeDateToIsoFormat(end_date) : null,
    };
    console.log(reqData);
    updateProjectTask(reqData);
  };

  const updateProjectTask = (data: any) => {
    setLoading(true);
    updateProjectTaskAPI(
      itemSelectedForUpdate.id,
      data,
      session?.user.access ?? ''
    )
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        setItemSelectedForUpdate({});
        handleCloseUpdateItemModal();
        handleTaskUpdated();
      })
      .catch((error) => {
        setLoading(false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  return (
    <Dialog open={true} onOpenChange={handleCloseUpdateItemModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Update Task
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{
                  required: '*Task title required',
                  minLength: {
                    value: 5,
                    message: '*Task title must be greater than 5 characters',
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>*Task Title</FormLabel>
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
                  <FormItem>
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
                rules={{ required: '*Task priority required' }}
                render={({ field }) => (
                  <FormItem>
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

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_date"
                  rules={{ required: '*Task start date required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>*Task Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date: Date | undefined) =>
                            field.onChange(
                              date
                                ? changeIsoFormatToDate(date.toISOString())
                                : ''
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
                    <FormItem>
                      <FormLabel>Task End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date: Date | undefined) =>
                            field.onChange(
                              date
                                ? changeIsoFormatToDate(date.toISOString())
                                : ''
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

              <FormField
                control={form.control}
                name="assign_to"
                rules={{ required: '*Assignee required' }}
                render={({ field }) => {
                  const currentEmployees =
                    itemSelectedForUpdate?.project_added_employees || [];
                  const selectedEmployee = currentEmployees.find(
                    (emp: Employee) => emp.id === field.value
                  );

                  return (
                    <FormItem>
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
                            {currentEmployees.map((emp: Employee) => (
                              <SelectItem
                                key={emp.id}
                                value={emp.id}
                                className="text-capitalize"
                              >
                                {`${emp.first_name} ${emp.last_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemSelectedForUpdate({});
                    handleCloseUpdateItemModal();
                  }}
                >
                  Cancel
                </Button>
                <Button variant="custom" type="submit">
                  Update
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateTaskModal;
