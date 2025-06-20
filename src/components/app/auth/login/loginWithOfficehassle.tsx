'use client';
import Loader from '@/components/app/loading/loading';
import { Button } from '@/components/ui/button';
import { delay } from '@/lib/utils';
import { Check } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const LoginWithOfficehassle = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    (async () => {
      await delay(3000);
      if (token && email) {
        const loginRes = await signIn('credentials', {
          email: email,
          access: token,
          redirect: false,
        });

        if (loginRes?.error) {
          toast.error(loginRes.error);
          return;
        }
        if (loginRes?.ok) {
          toast.success('Login successfully!');

          router.push('/');
        }
      }

      setIsloading(false);
    })();
  }, [searchParams]);

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
          Admin Login
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader />
        </div>
      ) : (
        <Button
          variant={'outline'}
          disabled={true}
          className="mx-auto w-max border-green-500 text-center text-green-400 disabled:opacity-100"
        >
          Logged in <Check className="size-4" />
        </Button>
      )}
    </>
  );
};

export default LoginWithOfficehassle;
