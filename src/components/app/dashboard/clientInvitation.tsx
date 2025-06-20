'use client';

import { useEffect, useState } from 'react';
import { sendClientSignupInvitationAPI } from '@/lib/api';
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
import { Input } from '@/components/ui/input';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

const formSchema = z.object({
  client_email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
});

interface ClientInvitationProps {
  clients: any[];
  handleCloseClientInvitationModal: () => void;
  reload: () => void;
}

const ClientInvitation = ({
  clients,
  reload,
  handleCloseClientInvitationModal,
}: ClientInvitationProps) => {
  const { data: session } = useSession();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoadingEmail(values.client_email);
    try {
      const res = await sendClientSignupInvitationAPI(
        values,
        session?.user?.access ?? ''
      );
      toast.success(res.data.message);
      handleCloseClientInvitationModal();
      form.reset();
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error('No response received from server.');
      } else if (error.message === 'Network Error') {
        toast.error('Network Error: Please check your internet connection');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoadingEmail(null);
      reload();
    }
  };

  useEffect(() => {}, [clients]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        handleCloseClientInvitationModal();
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Client Invitation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="client_email"
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
                      <Button
                        variant="custom"
                        type="submit"
                        disabled={loadingEmail !== null}
                      >
                        {loadingEmail !== null ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Invite'
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            <h6 className="text-base font-semibold">Already Joined</h6>
            {clients && clients.length > 0 ? (
              <ul className="space-y-3">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          client.photo
                            ? `${API_URL_PREFIX}${client.photo}`
                            : '/default-avatar.png'
                        }
                        alt={`${client.first_name} ${client.last_name}`}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {client.first_name} {client.last_name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {client.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="custom"
                      type="button"
                      size="sm"
                      onClick={() => onSubmit({ client_email: client.email })}
                      disabled={loadingEmail === client.email}
                    >
                      {loadingEmail === client.email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Invite'
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No clients have joined yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientInvitation;
