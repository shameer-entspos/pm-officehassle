'use client';

import { useEffect, useState } from 'react';
import { sendEmployeeSignupInvitationAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { Employee } from '@/zustand/employee/employeeStore';
import { Input } from '@/components/ui/input';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

const formSchema = z.object({
  employee_email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

interface EmployeeInvitationProps {
  handleCloseEmployeeInvitationModal: () => void;
  employees: Employee[];
}

const EmployeeInvitation = ({
  handleCloseEmployeeInvitationModal,
  employees,
}: EmployeeInvitationProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    sendEmployeeSignupInvitationAPI(values, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleCloseEmployeeInvitationModal();
        form.reset();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error('No response received from server.');
        } else if (error.message === 'Network Error') {
          toast.error('Network Error: Please check your internet connection');
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {}, [employees]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        handleCloseEmployeeInvitationModal();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Employee Invitation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email address</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <Button variant="custom" type="submit" disabled={loading}>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Send'
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="space-y-2">
            <h6 className="text-base font-semibold">Already Joined</h6>
            {employees && employees.length > 0 ? (
              <ul className="space-y-3">
                {employees.map((employee) => (
                  <li
                    key={employee.email}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          employee.image
                            ? `${API_URL_PREFIX}${employee.image}`
                            : '/default-avatar.png'
                        }
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm capitalize">
                      {employee.position === 'Admin' ? 'Admin' : 'Employee'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No employees have joined yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeInvitation;
