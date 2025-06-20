import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createProjectAPI } from '@/lib/api';
import { toast } from 'sonner';
import Loader from '../app/loading/loading';
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useSession } from 'next-auth/react';
import { useEmployeeStore } from '@/zustand/employee/employeeStore';
import { useClientStore } from '@/zustand/client/clientStore';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ChevronDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/zustand/project/projectStore';
import { useProfile } from '@/zustand/user/userStore';

const formSchema = z.object({
  title: z
    .string()
    .min(1, '*Title required')
    .min(5, '*Title must be greater than 5 characters'),
  github_repo: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateProject = () => {
  const { profile } = useProfile();
  const { data: session }: any = useSession();
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<{ name: string; url: string }[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  // const [employees, setEmployees] = useState<
  //   { id: string; first_name: string; last_name: string }[]
  // >([]);
  const router = useRouter();
  const { employees } = useEmployeeStore();
  const { clients } = useClientStore();
  const { addProject } = useProjectStore();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedEmployeesChannelIds, setSelectedEmployeesChannelIds] =
    useState<string[]>([]);
  const [selectedClientsChannelIds, setSelectedClientsChannelIds] = useState<
    string[]
  >([]);
  const [token, setToken] = useState<string>('');
  const [list, showList] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      github_repo: '',
      description: '',
    },
  });

  useEffect(() => {
    if (session?.user) {
      setToken(session.user.access);
      router.push('/projects');
      setLoading(false);
      setRepos([]);
      // getEmployees();
      // getRepos();
    }
  }, [session?.user]);

  // const getEmployees = async () => {
  //   try {
  //     const res = await getAllEmployeesAPI(session?.user?.access);
  //     setEmployees(res.data.data);
  //     console.log(res.data.data);
  //   } catch (error: any) {
  //     console.log(error);
  //     if (error.response) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(error.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const getRepos = async () => {
  //   try {
  //     const res = await getAllGithubRepos(token);
  //     setRepos(res.data.repos);
  //   } catch (error: any) {
  //     console.log(error);
  //     if (error.response) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(error.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmit = async (values: FormValues) => {
    setCreateLoading(true);
    try {
      const res = await createProjectAPI(
        {
          ...values,
          employees: selectedEmployeeIds,
          clients: selectedClientIds,
          channel_clients: selectedClientsChannelIds,
          channel_employees: selectedEmployeesChannelIds,
        },
        token
      );
      if (res.status === 201) {
        addProject(res.data.data);
      }
      toast.success(res.data.message);
    } catch (error: any) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-center">Create New Project</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mb-4 space-y-2">
                    <FormLabel>Project Title</FormLabel>
                    <FormControl className="w-full">
                      <Input
                        placeholder="Explain what the Project Title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* github */}
              <FormField
                control={form.control}
                name="github_repo"
                render={({ field }) => (
                  <FormItem className="mb-4 space-y-2">
                    <FormLabel>GitHub Repos</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select GitHub Repos" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repos && repos.length > 0 ? (
                          repos?.map((repo) => (
                            <SelectItem
                              key={repo.url}
                              value={repo.url}
                              className="text-capitalize"
                            >
                              {repo.name}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="text-muted-foreground p-1 text-center text-xs md:text-sm">
                            No repos found
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* employee list */}
              <FormItem className="space-y-2">
                <FormLabel>Employees (optional)</FormLabel>
                <Button
                  type="button"
                  variant={'outline'}
                  className="hover:text-muted-foreground text-muted-foreground flex justify-between rounded-md"
                  onClick={() => {
                    showList((prev) =>
                      prev === 'employees' ? '' : 'employees'
                    );
                  }}
                >
                  <span>
                    {selectedEmployeeIds.length > 0
                      ? `${selectedEmployeeIds.length} Selected`
                      : 'Select Employees '}
                  </span>
                  <ChevronDown className="text-muted-foreground/70 size-4" />
                </Button>
                <div
                  className={`overflow-y-auto rounded-md border transition-all duration-500 ${
                    list === 'employees'
                      ? 'mb-4 max-h-[200px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-bground-1">
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-center">Project</TableHead>
                        <TableHead className="text-center">
                          Channel - {selectedEmployeesChannelIds.length}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees && employees.length > 0 ? (
                        employees.map((employee) => (
                          <TableRow key={employee.id} className="h-10">
                            <TableCell className="space-x-2">
                              {employee.firstName + ' ' + employee.lastName}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                className="cursor-pointer"
                                checked={selectedEmployeeIds.includes(
                                  employee.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    if (
                                      profile?.allowAllMembersToChannel &&
                                      !selectedEmployeesChannelIds.includes(
                                        employee.id
                                      )
                                    ) {
                                      setSelectedEmployeesChannelIds((prev) => [
                                        ...prev,
                                        employee.id,
                                      ]);
                                    }
                                    setSelectedEmployeeIds((prev) => [
                                      ...prev,
                                      employee.id,
                                    ]);
                                  } else {
                                    setSelectedEmployeesChannelIds((prev) =>
                                      prev.filter((id) => id !== employee.id)
                                    );
                                    setSelectedEmployeeIds((prev) =>
                                      prev.filter((id) => id !== employee.id)
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                className="mt-1 cursor-pointer"
                                checked={selectedEmployeesChannelIds.includes(
                                  employee.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (
                                    checked &&
                                    selectedEmployeeIds.includes(employee.id)
                                  ) {
                                    setSelectedEmployeesChannelIds((prev) => [
                                      ...prev,
                                      employee.id,
                                    ]);
                                  } else {
                                    setSelectedEmployeesChannelIds((prev) =>
                                      prev.filter((id) => id !== employee.id)
                                    );
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2}>
                            <p className="text-muted-foreground p-1 text-center text-xs md:text-sm">
                              No employees found
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </FormItem>

              {/* clients list */}
              <FormItem className="space-y-2">
                <FormLabel>Clients (optional)</FormLabel>
                <Button
                  type="button"
                  variant={'outline'}
                  className="hover:text-muted-foreground text-muted-foreground flex justify-between rounded-md"
                  onClick={() => {
                    showList((prev) => (prev === 'clients' ? '' : 'clients'));
                  }}
                >
                  <span>
                    {selectedClientIds.length > 0
                      ? `${selectedClientIds.length} Selected`
                      : 'Select Clients '}
                  </span>
                  <ChevronDown className="text-muted-foreground/70 size-4" />
                </Button>
                <div
                  className={`overflow-y-auto rounded-md border transition-all duration-500 ${
                    list === 'clients'
                      ? 'mb-4 max-h-[200px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-bground-1">
                        <TableHead className=""> Client</TableHead>
                        <TableHead className="text-center">Project</TableHead>
                        <TableHead className="text-center">
                          Channel - {selectedClientsChannelIds.length}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.length < 1 ? (
                        <Label>No clients found!</Label>
                      ) : (
                        clients?.map((client) => {
                          return (
                            <TableRow key={client.id} className="h-10">
                              <TableCell className="space-x-2">
                                <span>
                                  {client.first_name + ' ' + client.last_name}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  className="size- cursor-pointer"
                                  checked={selectedClientIds.includes(
                                    client.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      if (
                                        profile?.allowAllMembersToChannel &&
                                        !selectedClientsChannelIds.includes(
                                          client.id
                                        )
                                      ) {
                                        setSelectedClientsChannelIds((prev) => [
                                          ...prev,
                                          client.id,
                                        ]);
                                      }
                                      setSelectedClientIds((prev) => [
                                        ...prev,
                                        client.id,
                                      ]);
                                    } else {
                                      setSelectedClientsChannelIds((prev) =>
                                        prev.filter((id) => id !== client.id)
                                      );
                                      setSelectedClientIds((prev) =>
                                        prev.filter((id) => id !== client.id)
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  className="mt-1 cursor-pointer"
                                  checked={selectedClientsChannelIds.includes(
                                    client.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (
                                      checked &&
                                      selectedClientIds.includes(client.id)
                                    ) {
                                      setSelectedClientsChannelIds((prev) => [
                                        ...prev,
                                        client.id,
                                      ]);
                                    } else {
                                      setSelectedClientsChannelIds((prev) =>
                                        prev.filter((id) => id !== client.id)
                                      );
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </FormItem>

              {/* description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl className="w-full">
                      <Textarea
                        placeholder="Add any extra details about the project"
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button
                    onClick={() => router.push('/projects')}
                    type="button"
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => router.push('/projects')}
                  variant="custom"
                  type="submit"
                  disabled={loading}
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </DialogContent>
  );
};

export default CreateProject;
