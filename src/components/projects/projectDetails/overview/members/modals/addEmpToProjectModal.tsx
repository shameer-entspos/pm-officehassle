/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { addRemoveProjectMemberAPI } from '@/lib/api';
import { Employee, useEmployeeStore } from '@/zustand/employee/employeeStore';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Client, useClientStore } from '@/zustand/client/clientStore';

interface Project {
  id: string;
  title: string;
}

const AddEmpToProjectModal = ({
  project,
  show,
  handleClose,
  handleReload,
  token,
  alreadyAddedEmployees,
}: {
  project: Project;
  show: boolean;
  handleClose: () => void;
  handleReload: () => void;
  token: string;
  alreadyAddedEmployees: any[];
}) => {
  const { employees } = useEmployeeStore();
  const { clients } = useClientStore();
  const [tab, setTab] = useState('employees');

  const addRemoveProjectMember = (
    memberId: string,
    actionType: 'add_member' | 'remove_member',
    isClient?: boolean
  ) => {
    const reqData = {
      project_id: project?.id,
      action_type: actionType,
      ...(isClient ? { client_email: memberId } : { employee_id: memberId }),
    };

    addRemoveProjectMemberAPI(reqData, token ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleClose();
        handleReload();
      })
      .catch((error) => {
        if (error.response) {
          const err = `Unable to update member. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      });
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="max-h-[600px] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold capitalize">
            Add Members to {project.title}
          </DialogTitle>

          <div className="flex gap-2">
            <Button
              className=""
              variant={tab === 'employees' ? 'custom' : 'secondary'}
              size={'sm'}
              onClick={() => setTab('employees')}
            >
              Employee{' '}
            </Button>
            <Button
              className=""
              variant={tab === 'clients' ? 'custom' : 'secondary'}
              size={'sm'}
              onClick={() => setTab('clients')}
            >
              Clients
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {tab === 'employees' && (
            <ul className="space-y-2">
              {employees?.map((emp: Employee) => {
                const isAdded = alreadyAddedEmployees.some(
                  (employee) => employee?.employee?.id === emp?.id
                );
                return (
                  <li
                    key={emp?.id}
                    className="bg-background border-border flex items-center justify-between rounded-3xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`${process.env.API_URL_PREFIX}/media/${emp.image}`}
                          alt={`${emp.firstName} ${emp.lastName}`}
                        />
                        <AvatarFallback>
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h6 className="text-sm font-medium capitalize">
                          {emp.firstName} {emp.lastName}
                        </h6>
                        <span className="text-muted-foreground text-xs">
                          {emp.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`flex items-center gap-1 ${
                          isAdded
                            ? 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-100'
                            : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-500 dark:text-yellow-100'
                        }`}
                      >
                        {isAdded ? <CheckCircle /> : <Clock />}
                        {isAdded ? 'Already Added' : 'Not Added Yet'}
                      </Badge>

                      {isAdded ? (
                        <Button
                          size={'icon'}
                          variant={'outline'}
                          onClick={(e) => {
                            e.preventDefault();
                            addRemoveProjectMember(emp?.id, 'remove_member');
                          }}
                          className="!text-destructive border-destructive/30"
                        >
                          <Trash2 />
                        </Button>
                      ) : (
                        <Button
                          size={'icon'}
                          variant={'outline'}
                          onClick={(e) => {
                            e.preventDefault();
                            addRemoveProjectMember(emp?.id, 'add_member');
                          }}
                        >
                          <Plus />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === 'clients' && (
            <ul className="space-y-2">
              {clients?.map((client: Client) => {
                const isAdded = alreadyAddedEmployees.some(
                  (clint) => clint?.client?.id === client?.id
                );
                return (
                  <li
                    key={client?.id}
                    className="bg-background border-border flex items-center justify-between rounded-3xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`${process.env.API_URL_PREFIX}/media/${client.photo}`}
                          alt={`${client.first_name} ${client.last_name}`}
                        />
                        <AvatarFallback>
                          {client.first_name[0]}
                          {client.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h6 className="text-sm font-medium capitalize">
                          {client.first_name} {client.last_name}
                        </h6>
                        <span className="text-muted-foreground text-xs">
                          {client.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`flex items-center gap-1 ${
                          isAdded
                            ? 'bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-100'
                            : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-500 dark:text-yellow-100'
                        }`}
                      >
                        {isAdded ? <CheckCircle /> : <Clock />}
                        {isAdded ? 'Already Added' : 'Not Added Yet'}
                      </Badge>

                      {isAdded ? (
                        <Button
                          size={'icon'}
                          variant={'outline'}
                          onClick={(e) => {
                            e.preventDefault();
                            addRemoveProjectMember(client?.id, 'remove_member');
                          }}
                          className="!text-destructive border-destructive/30"
                        >
                          <Trash2 />
                        </Button>
                      ) : (
                        <Button
                          size={'icon'}
                          variant={'outline'}
                          onClick={(e) => {
                            e.preventDefault();
                            addRemoveProjectMember(
                              client.email as string,
                              'add_member',
                              true
                            );
                          }}
                        >
                          <Plus />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmpToProjectModal;
