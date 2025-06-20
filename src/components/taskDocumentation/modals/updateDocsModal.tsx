'use client';

import { useState, useEffect } from 'react';
import {
  checkCommitTaskDocumentationAPI,
  getEmployeeAllProjectsWithTasksAPI,
  updateTaskDocumentationAPI,
} from '@/lib/api';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
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
import { useProfile } from '@/zustand/user/userStore';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
  task: z.string().min(1, '*Task required'),
  codePushed: z.boolean(),
  repoUrl: z.string().optional(),
  accessToken: z.string().optional(),
  documentation: z.string().min(1, '*Documentation required'),
});

const UpdateDocsModal = ({
  setSelectedDoc,
  reload,
  setReload,
  selectedDoc,
}: any) => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [documentation, setDocumentation] = useState(EditorState.createEmpty());
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [commitChecking, setCommitChecking] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: selectedDoc?.task_id?.toString() || '',
      codePushed: selectedDoc?.codePushed || false,
      repoUrl: selectedDoc?.repoUrl || '',
      accessToken: selectedDoc?.accessToken || '',
      documentation: '',
    },
  });

  useEffect(() => {
    if (session?.user?.access && profile) {
      getAllTasks();
    }
  }, [session?.user?.access, profile]);

  useEffect(() => {
    if (selectedDoc?.documentation) {
      const contentBlock = htmlToDraft(selectedDoc.documentation);
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        const initialEditorState = EditorState.createWithContent(contentState);
        setDocumentation(initialEditorState);
        form.setValue(
          'documentation',
          draftToHtml(convertToRaw(initialEditorState.getCurrentContent()))
        );
      }
    }
  }, [selectedDoc, form]);

  const getAllTasks = () => {
    setLoading(true);
    getEmployeeAllProjectsWithTasksAPI(session?.user?.access ?? '')
      .then((res) => {
        const data = res.data.data;
        setAllProjects(data);
        setSelectedProject(
          data.find((p: any) => p.id === selectedDoc.project_id)
        );
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
    updateTaskDocumentationAPI(
      values,
      selectedDoc.id,
      session?.user?.access ?? ''
    )
      .then(() => {
        toast.success('Task documentation updated successfully!');
        setReload(!reload);
        setSelectedDoc(null);
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
    setCommitChecking(true);
    checkCommitTaskDocumentationAPI(
      {
        repoUrl: form.getValues('repoUrl'),
        accessToken: form.getValues('accessToken'),
      },
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
    <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
      <DialogContent className="max-h-[80vh] overflow-y-auto md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Update Task Documentation
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
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
                  defaultValue={selectedProject?.id?.toString()}
                >
                  <SelectTrigger className="w-full" id="project">
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
                          {selectedProject?.tasks?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.title}
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
                  onClick={() => setSelectedDoc(null)}
                  disabled={commitChecking}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={commitChecking}>
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDocsModal;
