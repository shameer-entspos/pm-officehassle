'use client';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelRightOpen,
  User,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import React from 'react';
import clsx from 'clsx';
import { useProfile } from '@/zustand/user/userStore';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { getGreeting } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePageNameStore } from '@/zustand/app/pageName';
import Link from 'next/link';
import NavbarSkeleton from './navbarSkeleton';

const Navbar = () => {
  const { name } = usePageNameStore();
  const { isSidebarOpen, toggleSidebar } = useSidebarState();
  const { profile } = useProfile();
  const pathname = usePathname();

  return !profile ? (
    <NavbarSkeleton />
  ) : (
    <header className="flex h-20 items-center justify-between px-2 py-2 md:h-24 md:px-6">
      <div className="flex shrink-0 items-center gap-1 lg:gap-2">
        <Button
          onClick={toggleSidebar}
          variant={'secondary'}
          className={`dark:bg-secondary bg-white ${pathname !== '/inbox' ? 'hidden md:flex' : 'hidden lg:flex'}`}
          size={'icon'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose />
          ) : (
            <PanelRightOpen className={clsx('rotate-180')} />
          )}
        </Button>
        <Separator
          orientation="vertical"
          className="bg-primary mx-2 data-[orientation=vertical]:h-6"
        />
        <h1 className="text-lg font-semibold capitalize md:text-xl lg:text-2xl">
          {/* {pathname.startsWith('/inbox') ? 'Inbox' : pathname.split('/')[2]} */}
          {name.name}
        </h1>
      </div>

      <div className="flex items-center justify-end gap-2 rounded-xl">
        <div className="flex flex-col items-end">
          <h3 className="text-foreground flex gap-1 text-base font-normal capitalize">
            <span className="capitalize">
              {profile?.first_name + ' ' + profile?.last_name}
            </span>
          </h3>

          {/* <p className="text-muted-foreground w-max text-xs font-light capitalize lg:text-sm">
          </p> */}
          <Badge variant={'outline'} className="border-none !p-0 capitalize">
            {profile?.role}
          </Badge>
        </div>

        <Separator
          orientation="vertical"
          className="bg-primary mx-2 hidden data-[orientation=vertical]:h-6 sm:block"
        />

        <Popover>
          <PopoverTrigger className="flex cursor-pointer items-center gap-1">
            <Avatar className="size-11 lg:size-12">
              <AvatarImage
                src={`${process.env.API_URL_PREFIX}${profile?.photo}`}
                alt="avatar"
              />
              <AvatarFallback className="uppercase">
                {profile?.first_name?.charAt(0)}
                {profile?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <ChevronDown className="text-muted-foreground size-5" />
          </PopoverTrigger>
          <PopoverContent className="relative flex w-max flex-col items-center gap-2 p-6 pb-4 md:p-8">
            <Badge variant={'custom'} className="absolute top-2 right-2">
              {profile?.role === 'admin' ? 'Admin' : 'Employee'}
            </Badge>

            <Avatar className="size-20 flex-shrink-0">
              <AvatarImage
                src={`${process.env.API_URL_PREFIX}${profile?.photo}`}
                alt="avatar"
              />
              <AvatarFallback className="uppercase">
                {profile?.first_name?.charAt(0)}
                {profile?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center">
              <span className="gradient-text block !text-xs sm:hidden">
                {getGreeting()}!{' '}
              </span>

              <h2 className="text-base capitalize md:text-lg">
                {profile?.first_name + ' ' + profile?.last_name}
              </h2>

              <p className="text-muted-foreground text-xs md:text-sm">
                {profile?.email}
              </p>

              <Separator className="my-3 md:my-4" />

              <Link href={'/profile'} className="w-full">
                <Button
                  variant={'outline'}
                  className="w-full rounded-md"
                  size={'sm'}
                >
                  <User className="size-4" />
                  Profile
                </Button>
              </Link>

              <Button variant={'ghost'} className="mt-2 w-full" size={'sm'}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};

export default Navbar;
