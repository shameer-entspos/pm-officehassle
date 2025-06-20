'use client';

import { Notebook } from 'lucide-react';
import React from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { HiOutlineBriefcase } from 'react-icons/hi2';
import { TiTicket } from 'react-icons/ti';
import { RxDashboard } from 'react-icons/rx';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import Link from 'next/link';
import clsx from 'clsx';
import { usePageNameStore } from '@/zustand/app/pageName';
import { useProfile } from '@/zustand/user/userStore';
import Loader from '@/components/app/loading/loading';

const employeeMenuItems = [
  {
    icon: RxDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    name: 'Dashboard',
  },
  {
    icon: IoChatboxEllipsesOutline,
    label: 'Channels',
    href: '/inbox',
    name: 'Inbox',
  },
  {
    icon: HiOutlineBriefcase,
    label: 'Projects',
    href: '/projects',
    name: 'Projects',
  },
  {
    icon: IoMdCheckmarkCircleOutline,
    label: 'Check Ins',
    href: '/checkins',
    name: 'Checkins',
  },
  {
    icon: TiTicket,
    label: 'Task Documentation',
    href: '/taskDocumentation',
    name: 'Task Documentation',
  },
];

const adminMenuItems = [
  {
    icon: RxDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    name: 'Dashboard',
  },
  {
    icon: IoChatboxEllipsesOutline,
    label: 'Channels',
    href: '/inbox',
    name: 'Inbox',
  },
  {
    icon: HiOutlineBriefcase,
    label: 'Projects',
    href: '/projects',
    name: 'Projects',
  },
  {
    icon: IoMdCheckmarkCircleOutline,
    label: 'Check Ins',
    href: '/checkins',
    name: 'Checkins',
  },
  {
    icon: TiTicket,
    label: 'Task Documentation',
    href: '/taskDocumentation',
    name: 'Task Documentation',
  },

  {
    icon: Notebook,
    label: 'Attendance',
    href: '/attendances',
    name: 'Attendances',
  },
];

const guestMenuItems = [
  {
    icon: RxDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    name: 'Dashboard',
  },
  {
    icon: IoChatboxEllipsesOutline,
    label: 'Channels',
    href: '/inbox',
    name: 'Inbox',
  },
];

const clientMenuItems = [
  {
    icon: RxDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    name: 'Dashboard',
  },
  {
    icon: IoChatboxEllipsesOutline,
    label: 'Channels',
    href: '/inbox',
    name: 'Inbox',
  },
  {
    icon: HiOutlineBriefcase,
    label: 'Projects',
    href: '/projects',
    name: 'Projects',
  },
];

// const projectMenu = [
//   {
//     icon: HiOutlineBriefcase,
//     label: 'All Projects',
//     href: '/projects',
//     name: 'Projects',
//   },
// ];

// const projectNames = ['projects', 'project details', 'new project'];

const SidebarMenu = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const { profile } = useProfile();

  const menuItems =
    profile?.role === 'admin'
      ? adminMenuItems
      : profile?.role === 'client'
        ? clientMenuItems
        : profile?.role === 'guest'
          ? guestMenuItems
          : profile?.role === 'employee'
            ? adminMenuItems
            : employeeMenuItems;

  const { name } = usePageNameStore();

  if (!profile)
    return (
      <div className="grid h-full w-full place-content-center">
        <Loader />
      </div>
    );

  return (
    <ul className="flex flex-col gap-2 py-2 sm:p-2">
      <h6 className="hidden py-2 font-medium md:block">Menu</h6>
      {menuItems.map((item) => {
        const isActive = name.name?.toLowerCase() === item.name.toLowerCase();

        return (
          <Link
            key={item.label}
            className={clsx(
              'from-bground-1 rounded-lg border to-zinc-100 hover:bg-gradient-to-br dark:to-zinc-800',
              isActive
                ? 'dark:border-primary/20 dark:text-primary border-neutral-200 bg-gradient-to-br'
                : 'border-transparent'
            )}
            href={item.href}
          >
            <li className="flex items-center justify-center sm:justify-start">
              <div className="flex size-10 flex-shrink-0 items-center justify-center sm:size-12">
                <item.icon
                  className={`size-5 sm:size-6 ${
                    isActive ? 'dark:text-primary' : 'text-secondary-foreground'
                  }`}
                />
              </div>
              {isSidebarOpen && (
                <span
                  className={`hidden truncate overflow-hidden text-base text-ellipsis whitespace-nowrap md:block ${
                    isActive ? 'font-bold' : 'font-light'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </li>
          </Link>
        );
      })}
    </ul>
  );
};

export default SidebarMenu;
