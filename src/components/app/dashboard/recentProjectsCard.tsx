'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjectStore } from '@/zustand/project/projectStore';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useProfile } from '@/zustand/user/userStore';
import { getAllProjectsAPI, getEmployeeAllProjectsAPI } from '@/lib/api';
import { toast } from 'sonner';
import Loader from '../loading/loading';

const RecentProjectsTable = () => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const { projects, setProjects, setProject } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      if (profile?.role === 'admin') {
        getProjects(session?.user?.access ?? '');
      } else {
        getEmployeeProjects(session?.user?.access ?? '');
      }
    }
  }, [session?.user, profile]);

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

  // Limit to 3 recent projects (adjust as needed)
  const recentProjects = projects.slice(0, 6);

  return loading ? (
    <div className="grid w-full place-content-center py-6">
      <Loader />
    </div>
  ) : (
    <div className="space-y-4">
      {recentProjects.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No recent projects found.
        </p>
      ) : (
        <div className="bg-bground-2 overflow-hidden rounded-2xl border shadow-none">
          <Table>
            <TableHeader>
              <TableRow className="bg-bground">
                <TableHead className="pl-4 text-left">Title</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProjects.map((project) => (
                <TableRow key={project.id} className="h-10 cursor-pointer">
                  <TableCell className="pl-4 capitalize">
                    {project.title}
                  </TableCell>
                  <TableCell
                    className="border-l text-center"
                    onClick={() => {
                      router.push(`/projects/${project.id}`);
                      setProject(project);
                    }}
                  >
                    <Button variant="link" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentProjectsTable;
