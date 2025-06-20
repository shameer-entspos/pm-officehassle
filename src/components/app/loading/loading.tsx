'use client';

import { LoaderCircle } from 'lucide-react';

export default function Loader() {
  return (
    <LoaderCircle className="dark:text-chart-4 size-8 animate-spin text-green-500" />
  );
}
