'use client';
import { useEmployeeStore } from '@/zustand/employee/employeeStore';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import {
  getAllBusinessClientsAPI,
  getAllClientsAPI,
  getAllEmployeesAPI,
  getAllProjectsAPI,
} from '@/lib/api';
import Loader from '@/components/app/loading/loading';
import { getDate, getGreeting } from '@/lib/utils';
import { useProfile } from '@/zustand/user/userStore';
import { Plus } from 'lucide-react';
import AnalogClock from '../clock/clock';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import EmployeeInvitation from './employeeInvitation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecentEmployeesTable from './recentEmployeesCard';
import RecentProjectsTable from './recentProjectsCard';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ProjectsPieChart } from '@/components/projects/projectsPieChart';
import CheckinCard from './checkinCard';
import ClientInvitation from './clientInvitation';
import RecentClientsTable from './recentClientsCard';
import { useClientStore } from '@/zustand/client/clientStore';

// const colors = [
//   // Green + Teal
//   'bg-gradient-to-from-green-200 via-teal-300 to-green-500 dark:from-emerald-300 dark:via-teal-400 dark:to-emerald-600',
//   // Pink + Fuchsia (your favorite one)
//   'bg-gradient-to-from-pink-200 via-pink-400 to-pink-600 dark:from-fuchsia-300 dark:via-pink-500 dark:to-fuchsia-700',
//   // Blue + Indigo
//   'bg-gradient-to-from-blue-200 via-indigo-400 to-blue-700 dark:from-sky-300 dark:via-indigo-500 dark:to-blue-800',
//   // Purple + Violet
//   'bg-gradient-to-from-purple-200 via-violet-400 to-purple-600 dark:from-violet-300 dark:via-purple-500 dark:to-violet-700',
//   // Yellow + Lime
//   'bg-gradient-to-from-yellow-200 via-lime-300 to-yellow-500 dark:from-yellow-300 dark:via-lime-400 dark:to-yellow-600',
// ];

const Dashboard = () => {
  const { setClients } = useClientStore();
  const { profile } = useProfile();
  const { employees, setEmployees } = useEmployeeStore();
  const [projects, setAllProjects] = useState([]);
  const { data: session }: any = useSession();
  const [loading, setLoading] = useState(true);
  const [isModalEmployeeOpen, setIsModalEmployeeOpen] = useState(false);
  const [bsClients, setBsClients] = useState([]);

  const [isModalClientOpen, setIsModalClientOpen] = useState(false);

  const handleOpenModal = () => setIsModalEmployeeOpen(true);
  const handleCloseModal = () => setIsModalEmployeeOpen(false);

  const handleClientOpenModal = () => setIsModalClientOpen(true);
  const handleClientCloseModal = () => setIsModalClientOpen(false);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session?.user, profile]);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, projectsRes, clientsRes, bsClientsRes] =
        await Promise.all([
          getAllEmployeesAPI(session?.user?.access),
          getAllProjectsAPI(session?.user?.access),
          getAllBusinessClientsAPI(session?.user?.access),
          getAllClientsAPI(session?.user?.access),
        ]);

      // Set Employees
      setEmployees(
        employeesRes.data.data.map((e: any) => ({
          id: e.id,
          firstName: e.first_name,
          lastName: e.last_name,
          email: e.email,
          image: e.image,
          city: e.city,
          mobileNumber: e.mobile_number,
          bankName: e.bank_name,
          accountNo: e.account_no,
          branchName: e.branch_name,
          swiftCode: e.swift_code,
          accountType: e.account_type,
          bankAddress: e.bank_address,
          address: e.address,
          provience: e.provience,
          country: e.country,
          position: e.position,
          cnic: e.cnic,
          joiningDate: e.joining_date,
          resigningDate: e.resigning_date,
          isPmEmployee: e.is_pm_employee,
          createdAt: e.created_at,
          addedBy: e.added_by,
        }))
      );

      setClients(
        clientsRes.data.data.map((c: any) => ({
          id: c.id.toString(),
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone_no: c.phone_no,
          cnic: c.cnic,
          photo: c.photo,
          city: c.city,
          provience: c.provience,
          country: c.country,
          address: c.address,
          domain: c.domain,
          project_name: c.project_name,
          custom_projects: c.custom_projects,
          description: c.description,
          // attachement: c.attachement
          //   ? `${API_URL_PREFIX}${c.attachment}`
          //   : undefined,
          is_custom: c.is_custom,
          projects: c.projects?.map((p: any) => ({
            id: p.id.toString(),
            title: p.title,
          })),
        }))
      );

      setBsClients(
        bsClientsRes.data.data.map((c: any) => ({
          id: c.id.toString(),
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone_no: c.phone_no,
          cnic: c.cnic,
          photo: c.photo,
          city: c.city,
          provience: c.provience,
          country: c.country,
          address: c.address,
          domain: c.domain,
          project_name: c.project_name,
          custom_projects: c.custom_projects,
          description: c.description,
          // attachement: c.attachement
          //   ? `${API_URL_PREFIX}${c.attachment}`
          //   : undefined,
          is_custom: c.is_custom,
          projects: c.projects?.map((p: any) => ({
            id: p.id.toString(),
            title: p.title,
          })),
        }))
      );

      // Set Projects
      setAllProjects(projectsRes.data.data);

      console.log(projectsRes.data);
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || error.message || 'Unexpected error';
      toast.error(`Unable to fetch dashboard data. (${errMsg})`);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="grid min-h-[90vh] w-full place-content-center py-5">
      <Loader />
    </div>
  ) : (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col-reverse items-start gap-4 lg:flex-row">
        {!['client', 'guest'].includes(profile?.role as string) && (
          <div className="w-full space-y-4 lg:w-[calc(100%_-_300px)] xl:w-[calc(100%_-_400px)]">
            {/* icons tabs */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-bground-1 flex max-w-full min-w-[250px] flex-1 flex-col items-center justify-center rounded-3xl p-4 pl-6 lg:hidden">
                <h6 className="text-muted-foreground text-base md:text-lg">
                  {getDate()}
                </h6>
                <h3 className="text-foreground flex flex-col items-center justify-center font-normal capitalize md:flex-row md:gap-1">
                  <span className="gradient-text !text-xl lg:!text-2xl">
                    {getGreeting()}!
                  </span>

                  <span className="!text-xl font-semibold capitalize lg:!text-2xl">
                    {profile?.first_name}
                  </span>
                </h3>
              </div>

              {/* Card 1 */}
              <div className="bg-bground-1 flex max-w-full min-w-[250px] flex-1 items-center justify-between gap-4 rounded-3xl p-4 pl-6">
                <div className="flex flex-col">
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-sm md:text-base">Total Projects</p>
                </div>
                <Image
                  src="/projects.webp"
                  alt="dashboard"
                  width={100}
                  height={50}
                  className="size-20 self-end"
                />
              </div>

              {/* Card 2 */}
              <div className="bg-bground-1 flex max-w-full min-w-[250px] flex-1 items-center justify-between gap-4 rounded-3xl p-4 pl-6">
                <div className="flex flex-col">
                  <p className="text-2xl font-bold">{employees.length}</p>
                  <p className="text-sm md:text-base">Active Projects</p>
                </div>
                <Image
                  src="/project-active.webp"
                  alt="dashboard"
                  width={100}
                  height={50}
                  className="size-20 self-end"
                />
              </div>

              {/* Card 3 */}
              <div className="bg-bground-1 flex max-w-full min-w-[250px] flex-1 items-center justify-between gap-4 rounded-3xl p-4 pl-6">
                <div className="flex flex-col">
                  <p className="text-2xl font-bold">{employees.length}</p>
                  <p className="text-sm md:text-base">Completed Projects</p>
                </div>
                <Image
                  src="/projects-complete.webp"
                  alt="dashboard"
                  width={100}
                  height={50}
                  className="size-20 self-end"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
              {/* projects pie chart */}
              {profile?.role === 'admin' && (
                <div className="">
                  <ProjectsPieChart
                    completed={employees.length}
                    active={projects.length}
                    total={projects.length + employees.length}
                  />
                </div>
              )}

              {/* employee invitations */}
              <Card className="bg-bground-1 rounded-3xl border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Employee Invitations</CardTitle>
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={handleOpenModal}
                      variant="custom"
                      size="sm"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Invite Employee
                    </Button>
                  )}
                </CardHeader>
                <Separator />
                <CardContent>
                  {isModalEmployeeOpen && (
                    <EmployeeInvitation
                      handleCloseEmployeeInvitationModal={handleCloseModal}
                      employees={employees}
                    />
                  )}
                  <RecentEmployeesTable />
                </CardContent>
              </Card>
              {/* projects */}
              <Card className="bg-bground-1 rounded-3xl border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  {profile?.role === 'admin' && (
                    <Link href="/projects/?q=create">
                      <Button variant="custom" size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Create new
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                <Separator />
                <CardContent>
                  <RecentProjectsTable />
                </CardContent>
              </Card>
              {/* client invitations */}
              <Card className="bg-bground-1 h-max rounded-3xl border-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Client Invitations</CardTitle>
                  {profile?.role === 'admin' && (
                    <Button
                      onClick={handleClientOpenModal}
                      variant="custom"
                      size="sm"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Invite Client
                    </Button>
                  )}
                </CardHeader>
                <Separator />
                <CardContent>
                  {isModalClientOpen && (
                    <ClientInvitation
                      clients={bsClients}
                      reload={fetchDashboardData}
                      handleCloseClientInvitationModal={handleClientCloseModal}
                    />
                  )}
                  <RecentClientsTable />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div className="w-full space-y-4 lg:w-[300px] xl:w-[400px]">
          <Card className="bg-bground-2 hidden flex-col items-center justify-center rounded-3xl border-none p-6 py-8 lg:flex">
            {/* date and greetings */}
            <div className="mb-2 rounded-full">
              <AnalogClock />
            </div>
            <>
              <h6 className="text-muted-foreground text-base md:text-lg">
                {getDate()}
              </h6>
              <h3 className="text-foreground flex flex-col items-center justify-center gap-1 rounded-3xl font-normal capitalize">
                <span className="gradient-text !text-xl lg:!text-2xl">
                  {getGreeting()}!
                </span>

                <span className="!text-xl font-semibold capitalize lg:!text-2xl">
                  {profile?.first_name}
                </span>
              </h3>
            </>
            {['client', 'guest'].includes(profile?.role as string) && (
              <div className="flex gap-2">
                <Link href="/projects">
                  <Button variant={'custom'} size={'sm'}>
                    Go to projects
                  </Button>
                </Link>

                {profile?.role === 'client' && (
                  <Link href="/inbox">
                    <Button variant={'outline'} size={'sm'}>
                      Go to Channels
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </Card>
          {!['client', 'guest'].includes(profile?.role as string) && (
            <Card className="bg-bground-1 w-full rounded-3xl border-none shadow-none">
              <CheckinCard />
            </Card>
          )}{' '}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
