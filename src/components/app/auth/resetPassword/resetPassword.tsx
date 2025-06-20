'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { useRouter } from 'next/navigation';
import Loader from '../../loading/loading';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

const formSchema = z
  .object({
    new_pass: z.string().min(1),
    confirm_pass: z.string().min(1),
  })
  .refine((data) => data.new_pass === data.confirm_pass, {
    message: 'Passwords do not match',
    path: ['confirm_pass'],
  });

export default function ResetPassword({ userId }: { userId?: string }) {
  const router = useRouter();

  const [showLoading, setShowLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const updatePassword = async (data: z.infer<typeof formSchema>) => {
    setShowLoading(true);

    const form_data = new FormData();
    // form_data.append('old_password', data?.current_pass);
    form_data.append('password', data.new_pass);

    const url = `${API_URL_PREFIX}/api/user/reset-password/${userId}/`;

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      const response = await axios.put(url, form_data, config);

      if (response.status === 200) {
        toast.success('Password updated successfully');
        router.push('/login');
        form.reset();
      } else if (response.status === 400) {
        toast.error('Error occurred while updating password.');
      } else if (response.status === 401) {
        localStorage.clear();
      }
    } catch (err: any) {
      if (err?.response?.data) {
        Object.values(err.response.data).forEach((value) => {
          toast.error(JSON.stringify(value));
        });
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      setShowLoading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updatePassword(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full space-y-4 py-4"
      >
        <FormField
          control={form.control}
          name="new_pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Confirm new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={showLoading} variant={'custom'}>
          {showLoading ? <Loader /> : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}
