'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const VerificationSuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-light">
          <span className="from-primary to-chart-4 bg-gradient-to-r bg-clip-text font-semibold text-transparent dark:bg-gradient-to-r dark:text-transparent">
            Project Management
          </span>
        </h1>
        <p className="text-sm font-extralight">
          Keep track of your projects and tasks with ease.
        </p>
      </div>
      <Card className="flex items-center justify-center">
        <CardContent className="w-full space-y-3 text-center">
          <h2 className="flex items-center justify-center gap-2 text-lg">
            Account Successfully Verified{' '}
            <Check className="size-7 rounded-md bg-emerald-400 p-1 dark:bg-emerald-500" />
          </h2>
          <p className="text-muted-foreground text-sm">
            Redirecting to login in {countdown} second
            {countdown !== 1 ? 's' : ''}...
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default VerificationSuccess;
