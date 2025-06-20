'use client';

import { useEffect, useState } from 'react';
import {
  deleteTaskDocumentationAPI,
  getTasksDocumentationsAPI,
} from '@/lib/api';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/zustand/user/userStore';
import { toast } from 'sonner';
import UpdateDocsModal from './modals/updateDocsModal';
import TaskDocumentation from './taskDocumentation';

const PAGE_SIZE = 10;

const TaskDocsTable = ({ reload, setReload }: any) => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [allTasksDocumentation, setAllTasksDocumentation] = useState([]);
  const [tasksDocumentation, setTasksDocumentation] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    if (session?.user?.access && profile) {
      getTasksDocumentations();
    }
  }, [reload, session?.user?.access, profile]);

  const getTasksDocumentations = () => {
    getTasksDocumentationsAPI(session?.user?.access ?? '')
      .then((res) => {
        handleRenderTaskDocumentation(res.data.data);
        console.log(res.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          const err = `Unable to fetch tasks documentation. error(${error.response.data.message})`;
          toast.error(err);
        } else {
          toast.error(error.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRenderTaskDocumentation = (tasks: any) => {
    setAllTasksDocumentation(tasks);
    setTasksDocumentation(tasks.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setTotalPages(Math.ceil(tasks.length / PAGE_SIZE));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const startIndex = currentPage * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setTasksDocumentation(allTasksDocumentation.slice(startIndex, endIndex));
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const startIndex = (currentPage - 2) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      setTasksDocumentation(allTasksDocumentation.slice(startIndex, endIndex));
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteDoc = (doc: any) => {
    deleteTaskDocumentationAPI(doc.id, session?.user?.access ?? '')
      .then(() => {
        toast.success('Task documentation deleted successfully!');
        setReload(!reload);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}
      {selectedDoc && (
        <UpdateDocsModal
          selectedDoc={selectedDoc}
          setSelectedDoc={setSelectedDoc}
          reload={reload}
          setReload={setReload}
        />
      )}
      {!loading && tasksDocumentation.length > 0 && (
        <div
          className="rounded-2xl"
          style={{
            boxShadow: '0px 0px 8px 0px #00000010',
          }}
        >
          <div className="overflow-x-auto">
            <Table className="bg-bground-2 overflow-hidden rounded-2xl">
              <TableHeader>
                <TableRow className="bg-bground h-12 rounded-t-3xl">
                  <TableHead className="pl-5 text-sm font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Employee
                  </TableHead>
                  <TableHead className="text-sm font-semibold">Task</TableHead>
                  <TableHead className="text-sm font-semibold">
                    Code Pushed
                  </TableHead>
                  <TableHead className="text-sm font-semibold">
                    Submit At
                  </TableHead>
                  <TableHead className="text-end text-sm font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksDocumentation.map((doc: any) => (
                  <TaskDocumentation
                    key={doc.id}
                    doc={doc}
                    setSelectedDoc={setSelectedDoc}
                    handleDeleteDoc={handleDeleteDoc}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
      {!loading && tasksDocumentation.length === 0 && (
        <div className="text-muted-foreground py-10 text-center">
          No task documentation records found.
        </div>
      )}
    </>
  );
};

export default TaskDocsTable;
