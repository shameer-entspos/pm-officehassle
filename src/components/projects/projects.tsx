'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import CreateProject from './createProjects';
import { useSession } from 'next-auth/react';
import {
  getAllProjectsAPI,
  getClientAllProjectsAPI,
  getEmployeeAllProjectsAPI,
} from '@/lib/api';
import { toast } from 'sonner';
import clsx from 'clsx';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useSearchParams } from 'next/navigation';
import { useProjectStore } from '@/zustand/project/projectStore';
import { useProfile } from '@/zustand/user/userStore';
import Link from 'next/link';

const borderColors = [
  'bg-[#ff8ed6]',
  'bg-[#69b4ff]',
  'bg-[#5ef2d1]',
  'bg-[#9993ff]',
  'bg-[#ffd666]',
  'bg-[#ff8b82]',
  'bg-[#5af5aa]',
  'bg-[#6c7dff]',
  'bg-[#ffd48a]',
  'bg-[#c3bfff]',
];

const borderColorsDark = [
  'dark:bg-[#b25e9c]',
  'dark:bg-[#4b8ecf]',
  'dark:bg-[#41b89e]',
  'dark:bg-[#6b68cc]',
  'dark:bg-[#b39d4d]',
  'dark:bg-[#b26961]',
  'dark:bg-[#3fb282]',
  'dark:bg-[#5361bf]',
  'dark:bg-[#b39b6e]',
  'dark:bg-[#958cd1]',
];

// const borderColorsDark = [
//   'dark:border-t-[#ff8ed69d]',
//   'dark:border-t-[#69b4ff9d]',
//   'dark:border-t-[#5ef2d19d]',
//   'dark:border-t-[#9993ff9d]',
//   'dark:border-t-[#ffd6669d]',
//   'dark:border-t-[#ff8b829d]',
//   'dark:border-t-[#5af5aa9d]',
//   'dark:border-t-[#6c7dff9d]',
//   'dark:border-t-[#ffd48a9d]',
//   'dark:border-t-[#c3bfff9d]',
// ];

const Projects = () => {
  const { profile } = useProfile();
  const [openModel, setOpenModel] = useState(false);
  const { projects, setProjects, setProject } = useProjectStore();
  const [loading, setLoading] = useState(true);

  const { data: session }: any = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [prevCount, setPrevCount] = useState(0);
  const [shuffledBorderColors, setShuffledBorderColors] =
    useState(borderColors);
  const [shuffledBorderColorsDark, setShuffledBorderColorsDark] =
    useState(borderColorsDark);

  function shuffleArray(array: string[]) {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  useEffect(() => {
    if (projects.length > prevCount) {
      setShuffledBorderColors(shuffleArray(borderColors));
      setShuffledBorderColorsDark(shuffleArray(borderColorsDark));
    }
    setPrevCount(projects.length);
  }, [projects]);

  useEffect(() => {
    if (query) {
      setOpenModel(true);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (profile?.role === 'admin') {
        getProjects(session.user.access);
      } else if (profile?.role === 'client') {
        getClientProjects(session.user.access);
      } else {
        getEmployeeProjects(session.user.access);
      }
    }
  }, [session?.user, profile]);

  const getClientProjects = async (atoken: string) => {
    try {
      const res = await getClientAllProjectsAPI(atoken);
      setProjects(res.data.data);
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeProjects = async (atoken: string) => {
    try {
      const res = await getEmployeeAllProjectsAPI(atoken);
      setProjects(res.data.data);
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProjects = async (atoken: string) => {
    try {
      const res = await getAllProjectsAPI(atoken);
      setProjects(res.data.data);
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chats flex h-full w-full flex-col overflow-y-auto">
      <Dialog open={openModel} onOpenChange={setOpenModel}>
        <CreateProject />
      </Dialog>

      {/* header */}
      <div className="flex h-16 w-full items-center justify-between rounded-t-3xl border-b px-3 md:h-20 md:px-6">
        <div>
          <h1 className="text-lg font-bold md:text-xl">All Projects</h1>
        </div>
        <div>
          {profile?.role === 'admin' && (
            <Button
              variant={'custom'}
              className="rounded-xl"
              onClick={() => setOpenModel(true)}
            >
              <Plus /> Create Project
            </Button>
          )}
        </div>
      </div>

      {/* content */}
      <div className="chats flex h-full w-full flex-col gap-4 overflow-y-auto p-3 md:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project, index) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div
                  onClick={() => {
                    setProject(project);
                  }}
                  style={{
                    boxShadow: '0px 0px 15px 0px #00000010',
                  }}
                  className={clsx(
                    'cursor-pointer overflow-hidden rounded-2xl pt-2 md:pt-3',
                    shuffledBorderColors[index % shuffledBorderColors.length],
                    shuffledBorderColorsDark[
                      index % shuffledBorderColorsDark.length
                    ]
                  )}
                >
                  <div className="bg-card relative p-3 !pt-3 md:p-4">
                    <h2 className="text-secondary-foreground font-semibold md:text-lg">
                      {project.title}
                    </h2>
                    {project.description ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-1 text-sm italic">
                        No description provided.
                      </p>
                    )}
                    <div className="text-muted-foreground mt-3 space-y-2 text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Priority:</span>
                        <span
                          className={clsx(
                            'rounded-full px-2 py-1 text-xs font-semibold',
                            project.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : project.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : project.priority === 'Low'
                                  ? 'bg-green-100 text-green-800'
                                  : ''
                          )}
                        >
                          {project.priority || 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.added_employees &&
                        project.added_employees.length > 0 ? (
                          <>
                            <Badge variant="outline">
                              {project.added_employees.length} employees
                            </Badge>
                            <Badge variant="outline">
                              {project.added_clients.length} clients{' '}
                            </Badge>
                          </>
                        ) : (
                          <span className="">None assigned</span>
                        )}
                      </div>

                      <Separator />

                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Created On:</span>
                        <span className="">
                          {new Date(project.created_on).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}{' '}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
