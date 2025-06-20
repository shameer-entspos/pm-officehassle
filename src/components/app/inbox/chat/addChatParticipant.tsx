'use client';
import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useEmployeeStore } from '@/zustand/employee/employeeStore';
import { Plus, Minus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useChat } from '@/zustand/inbox/chatStore';
import { updateChatGroupAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Client, useClientStore } from '@/zustand/client/clientStore';

// Define the form data type
interface FormData {
  employeeIds: string[];
  clientIds: string[];
}

const AddChatParticipant = ({ type }: { type: string }) => {
  const { chat } = useChat();
  const { employees } = useEmployeeStore();
  const { clients } = useClientStore();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const { data: session }: any = useSession();

  const form = useForm<FormData>({
    defaultValues: {
      employeeIds: [],
      clientIds: [],
    },
  });

  // Handle toggling selection for employees or clients
  const toggleSelection = (id: string, isClient: boolean) => {
    if (isClient) {
      const newSelectedClientIds = selectedClientIds.includes(id)
        ? selectedClientIds.filter((clientId) => clientId !== id)
        : [...selectedClientIds, id];
      setSelectedClientIds(newSelectedClientIds);
      form.setValue('clientIds', newSelectedClientIds);
    } else {
      const newSelectedEmployeeIds = selectedEmployeeIds.includes(id)
        ? selectedEmployeeIds.filter((employeeId) => employeeId !== id)
        : [...selectedEmployeeIds, id];
      setSelectedEmployeeIds(newSelectedEmployeeIds);
      form.setValue('employeeIds', newSelectedEmployeeIds);
    }
  };

  // Handle form submission
  const onSubmit = async () => {
    const token = session?.user?.access;
    let emails = [];

    if (type === 'client') {
      emails = selectedClientIds;
    } else {
      emails = selectedEmployeeIds;
    }

    try {
      if (chat.chatId) {
        const res = await updateChatGroupAPI(chat.chatId, emails, token);
        if (res.data) {
          toast.success('Chat updated!');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update chat');
    }
  };

  return type === 'client' ? (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="clientIds"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel>Clients (optional)</FormLabel>
              <FormControl>
                <div className="overflow-y-auto rounded-md px-2 py-1">
                  {clients && clients.length > 0 ? (
                    clients.map((client: Client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-capitalize text-sm">
                          {client.first_name + ' ' + client.last_name}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            selectedClientIds.includes(client.email as string)
                              ? 'destructive'
                              : 'outline'
                          }
                          onClick={() =>
                            toggleSelection(client.email as string, true)
                          }
                        >
                          {selectedClientIds.includes(
                            client.email as string
                          ) ? (
                            <Minus className="size-4" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-1 text-center text-xs md:text-sm">
                      No Clients found
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">
          <Plus className="size-4" /> Add{' '}
          {selectedClientIds.length > 0 ? `(${selectedClientIds.length})` : ''}
        </Button>
      </form>
    </Form>
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="employeeIds"
          render={() => (
            <FormItem className="space-y-2">
              <FormLabel>Employees (optional)</FormLabel>
              <FormControl>
                <div className="overflow-y-auto rounded-md px-2 py-1">
                  {employees && employees.length > 0 ? (
                    employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-capitalize text-sm">
                          {employee.firstName + ' ' + employee.lastName}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            selectedEmployeeIds.includes(employee.email)
                              ? 'destructive'
                              : 'outline'
                          }
                          onClick={() => toggleSelection(employee.email, false)}
                        >
                          {selectedEmployeeIds.includes(employee.email) ? (
                            <Minus className="size-4" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-1 text-center text-xs md:text-sm">
                      No employees found
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">
          <Plus className="size-4" /> Add{' '}
          {selectedEmployeeIds.length > 0
            ? `(${selectedEmployeeIds.length})`
            : ''}
        </Button>
      </form>
    </Form>
  );
};

export default AddChatParticipant;
