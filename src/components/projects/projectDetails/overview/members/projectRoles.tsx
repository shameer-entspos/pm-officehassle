'use client';
import {
  addRemoveProjectMemberAPI,
  getProjectEmployeeRolesAPI,
} from '@/lib/api';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProfile } from '@/zustand/user/userStore';
import Loader from '@/components/app/loading/loading';
import AddEmpToProjectModal from './modals/addEmpToProjectModal';
import AssignRoleModal from './modals/assignRoleModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_URL_PREFIX = process.env.API_URL_PREFIX;

const ProjectRoles = ({
  project,
  showAssignRoleModal,
  handleCloseAssignRoleModal,
  showAddEmpToProjectModal,
  handleCloseEmpToProjectModal,
  handleOpenAssignRoleModal,
}: any) => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});

  const handleReload = () => setReload(!reload);

  useEffect(() => {
    if (project?.id && session?.user) {
      getProjectEmployeeRoles();
    }
  }, [project, reload, session?.user, profile]);

  const getProjectEmployeeRoles = () => {
    getProjectEmployeeRolesAPI(project.id, session?.user?.access ?? '')
      .then((res) => {
        console.log(res.data);
        setRoles(res.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  const removeProjectMember = (role: any) => {
    const reqData = {
      project_id: project.id,
      action_type: 'remove_member',
      ...(role.type === 'client'
        ? { client_email: role.client.email }
        : { employee_id: role.employee.id }),
    };

    addRemoveProjectMemberAPI(reqData, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleReload();
      })
      .catch((error) => {
        if (error.response) {
          const err = `Unable to remove member. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      });
  };

  return !profile || loading ? (
    <div className="flex h-[400px] items-center justify-center">
      <Loader />
    </div>
  ) : (
    <>
      <div className="py-4">
        <div
          className="rounded-2xl"
          style={{ boxShadow: '0px 0px 8px 0px #00000010' }}
        >
          <Table className="bg-bground-2 overflow-hidden rounded-2xl">
            <TableHeader>
              <TableRow className="bg-bground h-12 rounded-t-3xl">
                <TableHead className="w-[50px] text-center">
                  <Badge variant="custom" className="mx-auto">
                    {roles.length}
                  </Badge>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Role</TableHead>
                {profile.role === 'admin' && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role: any, index) => {
                const person =
                  role.type === 'client' ? role.client : role.employee;
                const image =
                  role.type === 'client'
                    ? role.client?.image
                    : role.employee?.image;
                return (
                  <TableRow key={index}>
                    <TableCell className="pl-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`${API_URL_PREFIX}${image}`}
                          alt={`${person.first_name} ${person.last_name}`}
                        />
                        <AvatarFallback>
                          {person.first_name[0]}
                          {person.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium capitalize">
                      {person.first_name} {person.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {person.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {role.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {role?.role ? role.role.role : 'No role assigned yet'}
                    </TableCell>
                    {profile.role === 'admin' && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenAssignRoleModal();
                                setSelectedEmployee(role);
                              }}
                            >
                              <Pencil className="text-primary" />{' '}
                              {role?.role ? 'Change Role' : 'Assign Role'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-warning"
                              onClick={() => removeProjectMember(role)}
                            >
                              <Trash className="text-destructive" /> Remove From
                              Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddEmpToProjectModal
        project={project}
        show={showAddEmpToProjectModal}
        handleClose={handleCloseEmpToProjectModal}
        handleReload={handleReload}
        token={session?.user?.access ?? ''}
        alreadyAddedEmployees={roles}
      />

      <AssignRoleModal
        show={showAssignRoleModal}
        handleClose={handleCloseAssignRoleModal}
        handleReload={handleReload}
        selectedEmployee={selectedEmployee}
        project={project}
        token={session?.user?.access ?? ''}
      />
    </>
  );
};

export default ProjectRoles;
