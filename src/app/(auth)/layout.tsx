import { ThemeToggle } from '@/components/ui/theme/themeToggle';
import Image from 'next/image';
import React from 'react';

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="dark:bg-bground-2 relative flex h-screen flex-col items-center justify-center overflow-y-auto bg-neutral-200 px-2 md:px-4">
      <div className="bg-card relative grid w-full space-x-4 rounded-3xl p-2 sm:h-max sm:w-[95%] md:w-[600px] lg:w-[1024px] lg:grid-cols-2 xl:w-[1140px]">
        <div className="flex w-full flex-col items-center overflow-auto p-4 transition-all duration-150 sm:p-6 lg:p-10">
          <div className="flex h-full w-full flex-col justify-center gap-2 py-4 md:gap-4 lg:py-0">
            <Image
              className="dark:bg-bground-1 mx-auto mb-2 size-20 rounded-xl bg-zinc-700 object-contain p-3 md:size-24"
              src={'/officehassle.png'}
              alt="site logo"
              width={80}
              height={80}
            />
            {children}
          </div>
        </div>
        <div className="bg-bground-1 relative hidden h-full flex-col items-center justify-center rounded-2xl p-6 sm:p-6 lg:flex">
          <div className="absolute top-5 right-5">
            <ThemeToggle variant={'ghost'} />
          </div>
          <Image
            src="/login-img.png"
            alt="auth-page-dashboard"
            className="w-11/12"
            width={500}
            height={500}
          />
          <footer className="flex h-max w-full flex-col justify-center py-2 sm:py-0">
            <h6 className="text-center text-lg font-semibold lg:text-xl">
              PM OfficeHassle By ENTSPOS
            </h6>
            <p className="text-center text-sm font-light">
              {' '}
              ©OfficeHassle.com 2025
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
