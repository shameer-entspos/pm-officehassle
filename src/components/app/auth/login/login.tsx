'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { employeeLoginAPI, getUserProfileDataAPI } from '@/lib/api'; // Adjust import path as needed
import { toast } from 'sonner';
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';
import Loader from '@/components/app/loading/loading';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/zustand/user/userStore';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().min(1, '*Email required').email('*Invalid email address'),
  password: z.string().min(1, '*Password required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { setUserProfile } = useProfile();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const employeeLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await employeeLoginAPI(data);

      if (response.status === 200) {
        const { access, refresh } = response.data;

        const loginRes = await signIn('credentials', {
          email: data.email,
          access: access,
          refresh: refresh,
          redirect: false,
        });

        if (loginRes?.error) {
          toast.error(loginRes.error);
          return;
        }
        if (loginRes?.ok) {
          getUserProfileData(response.data.access);
        }
      }
    } catch (error: any) {
      console.log(error?.response);
      toast.error(`Login Error! ${error?.response?.data?.detail}`);
    } finally {
      setIsLoading(false);
    }
  };

  // const refreshLoginToken = (data: { refresh: string }) => {
  //   refreshLoginTokenAPI(data)
  //     .then((res) => {
  //       console.log(res.data);
  //       localStorage.setItem('token', res.data.access);
  //     })
  //     .catch((error) => {
  //       if (error.response) {
  //         toast.error(error.response.data.message);
  //         if (error.response.status === 401) {
  //           logout();
  //         }
  //       } else {
  //         toast.error(error.message);
  //       }
  //     });
  // };

  const getUserProfileData = (token: string) => {
    getUserProfileDataAPI(token)
      .then((res) => {
        console.log(res.data);

        if (res.status === 200) {
          console.log(res.data.role);
          toast.success('Login successfully!');

          setUserProfile({
            id: res.data?.id,
            first_name: res.data?.first_name,
            last_name: res.data?.last_name,
            username: res.data?.username,
            email: res.data?.email,
            phone_no: res.data?.phone_no,
            company_name: res.data?.company_name,
            city: res.data?.city,
            postal_code: res.data?.postal_code,
            country: res.data?.country,
            address: res.data?.address,
            about: res.data?.about,
            photo: res.data?.photo,
            company_logo: res.data?.company_logo,
            is_active: res.data?.is_active,
            currency: res.data?.currency,
            smtp_email: res.data?.smtp_email,
            smtp_email_password: res.data?.smtp_email_password,
            role: res.data?.role,
            two_factor_auth: res.data?.two_factor_auth,
            is_superuser: res.data?.is_superuser,
            is_staff: res.data?.is_staff,
            company_contacts: res.data?.company_contacts,
            has_subscription: res.data?.has_subscription,
          });

          router.push('/dashboard');
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          toast.error(error.response.data.message);
          if (error.response.status === 401) {
            logout();
          }
        } else {
          toast.error(error.message);
        }
      });
  };

  const logout = () => {
    // Implement logout logic (e.g., clear localStorage, redirect)
  };

  const onSubmit = (values: LoginFormValues) => {
    console.log(values);
    employeeLogin(values);
  };

  return (
    <>
      <div className="flex w-full flex-col items-center justify-between gap-1 sm:gap-2">
        <h1 className="text-2xl">
          <span className="font-light">Login to </span>
          <span className="from-primary to-chart-4 text-primary bg-clip-text font-semibold dark:bg-gradient-to-r dark:text-transparent">
            Project Mangement
          </span>
        </h1>
        <span className="text-sm font-extralight sm:text-base">
          Keep track of your projects and tasks with ease.
        </span>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="johndoe@example.com"
                    autoComplete="off"
                    className="form-control form-control-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    placeholder="******"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end">
            <Link href="/forgotPassword">
              <Button variant={'link'} className="!h-auto" type="button">
                Forgot Password?
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="custom"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader /> : 'Login'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Login;
