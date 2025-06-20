import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import React from 'react';

const VerificationSuccess = () => {
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
            Account Successfull Verfied{' '}
            <X className="size-7 rounded-md bg-red-400 p-1 dark:bg-red-500" />
          </h2>
        </CardContent>
      </Card>
    </>
  );
};

export default VerificationSuccess;
