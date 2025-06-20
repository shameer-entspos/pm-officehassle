'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import ResetPassword from '../resetPassword/resetPassword';
import { getUserId } from '@/lib/api';
import Loader from '../../loading/loading';

const formSchema = z.object({
  email: z.string().min(1),
});

const ForgotPassword = () => {
  const [currentForm, setCurrentForm] = useState('forgotPassword');

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await getUserId(values.email)
        .then((res) => {
          if (res.status === 200) {
            setUserId(res.data?.data?.user_id);
            setCurrentForm('resetPassword');
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error('Error finding account!');
        });
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <div className="flex w-full flex-col items-center justify-between gap-1 sm:gap-2">
        <h1 className="flex flex-col text-2xl">
          <span className="from-primary to-chart-4 text-primary bg-clip-text font-semibold dark:bg-gradient-to-r dark:text-transparent">
            Project Mangement
          </span>
        </h1>
        <span className="font-light">Forgot your password? </span>
      </div>

      {currentForm === 'forgotPassword' && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-4 py-10"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant={'custom'} type="submit">
              {loading ? <Loader /> : 'Find Account'}
            </Button>
          </form>
        </Form>
      )}
      {currentForm === 'resetPassword' && <ResetPassword userId={userId} />}
    </div>
  );
};

export default ForgotPassword;
