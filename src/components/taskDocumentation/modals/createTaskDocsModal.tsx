'use client';

import { useState, useEffect } from 'react';
import {
  checkCommitTaskDocumentationAPI,
  createTaskDocumentationAPI,
  getEmployeeAllProjectsWithTasksAPI,
} from '@/lib/api';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/zustand/user/userStore';
import Loader from '@/components/app/loading/loading';

const formSchema = z.object({
  task: z.string().min(1, '*Task required'),
  codePushed: z.boolean(),
  repoUrl: z.string().optional(),
  documentation: z.string().min(1, '*Documentation required'),
});

const CreateTaskDocsModal = ({ reload, setReload }: any) => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [documentation, setDocumentation] = useState(EditorState.createEmpty());
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commitChecking, setCommitChecking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleCreateModal = () => {
    setModalOpen(!modalOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: '',
      codePushed: false,
      repoUrl: '',
      documentation: '',
    },
  });

  useEffect(() => {
    if (session?.user?.access && profile) {
      getAllTasks();
    }
  }, [session?.user?.access, profile]);

  const getAllTasks = () => {
    getEmployeeAllProjectsWithTasksAPI(session?.user?.access ?? '')
      .then((res) => {
        console.log(res.data.data);
        setAllProjects(res.data.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response) {
          const err = `Unable to fetch projects. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTaskDocumentationAPI(values, session?.user?.access ?? '')
      .then(() => {
        toast.success('Task documentation created successfully!');
        setReload(!reload);
        toggleCreateModal();
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  const checkCommit = () => {
    const repoUrl = form.getValues('repoUrl');
    if (!repoUrl) {
      form.setError('repoUrl', { message: 'Repo URL Required' });
      form.setValue('codePushed', false);
      return;
    }
    setCommitChecking(true);
    checkCommitTaskDocumentationAPI(
      { repo_url: selectedProject?.github_repo },
      session?.user?.access ?? ''
    )
      .then(() => {
        form.setValue('codePushed', true);
      })
      .catch((error) => {
        form.setValue('codePushed', false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setCommitChecking(false);
      });
  };

  const onEditorStateChange = (newEditorState: EditorState) => {
    setDocumentation(newEditorState);
    form.setValue(
      'documentation',
      draftToHtml(convertToRaw(newEditorState.getCurrentContent()))
    );
  };

  return (
    <Dialog open={modalOpen} onOpenChange={toggleCreateModal}>
      <DialogTrigger asChild>
        {profile?.role === 'employee' ? (
          <Button variant={'custom'} onClick={toggleCreateModal}>
            <Plus />
            Create
          </Button>
        ) : null}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Task Documentation
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedProject(
                      allProjects.find((p: any) => p.id === parseInt(value))
                    )
                  }
                >
                  <SelectTrigger id="project" className="w-full">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProjects.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Task</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">
                            {!selectedProject
                              ? 'Select Project First'
                              : 'Select Task'}
                          </SelectItem>
                          {selectedProject?.tasks?.map((t: any) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codePushed"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            checkCommit();
                          }
                        }}
                        disabled={commitChecking}
                      />
                    </FormControl>
                    <FormLabel>Code Pushed?</FormLabel>
                    {commitChecking && (
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentation"
                render={() => (
                  <FormItem className="space-y-2">
                    <FormLabel>Documentation</FormLabel>
                    <FormControl>
                      <div className="rounded-md border p-2">
                        <Editor
                          editorState={documentation}
                          wrapperClassName="demo-wrapper"
                          editorClassName="demo-editor"
                          onEditorStateChange={onEditorStateChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleCreateModal}
                  disabled={commitChecking}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={commitChecking}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDocsModal;
