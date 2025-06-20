'use client';

import { useEffect, useState } from 'react';
import { deleteProjectResourceAPI, getProjectResourcesAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { MoreHorizontal, Trash } from 'lucide-react';
import { useProfile } from '@/zustand/user/userStore';
import { useSession } from 'next-auth/react';
import UploadProjectResourcesModal from './modals/uploadProjectResourcesModal';
import Loader from '@/components/app/loading/loading';

interface Project {
  id: string;
}

interface Resource {
  id: string;
  resource: string;
}

const ProjectResources = ({
  project,
  showUploadResourcesModal,
  setShowUploadResourcesModal,
}: {
  project: Project;
  showUploadResourcesModal: boolean;
  setShowUploadResourcesModal: any;
}) => {
  const { data: session } = useSession();
  const { profile } = useProfile();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);

  // const handleShowUploadResourcesModal = () =>
  //   setShowUploadResourcesModal(true);
  const handleCloseUploadResourcesModal = () =>
    setShowUploadResourcesModal(false);
  const handleReload = () => setReload(!reload);

  useEffect(() => {
    if (project?.id && session?.user) {
      getProjectResources();
    }
  }, [project, reload, session?.user, profile]);

  const getProjectResources = () => {
    setLoading(true);
    getProjectResourcesAPI(project.id, session?.user?.access ?? '')
      .then((res: any) => {
        console.log(res.data);
        setResources(res.data.data);
        setLoading(false);
      })
      .catch((error: any) => {
        setLoading(false);
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      });
  };

  const deleteProjectResource = (resourceId: string) => {
    setLoading(true);
    deleteProjectResourceAPI(resourceId, session?.user?.access ?? '')
      .then((res) => {
        toast.success(res.data.message);
        handleReload();
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

  return (
    <div>
      {showUploadResourcesModal && (
        <UploadProjectResourcesModal
          handleCloseUploadResourcesModal={handleCloseUploadResourcesModal}
          handleReload={handleReload}
          project={project}
        />
      )}

      {loading ? (
        <div className="flex h-[400px] items-center justify-center py-4">
          <Loader />
        </div>
      ) : (
        <div className="py-4">
          <div
            className="rounded-2xl"
            style={{
              boxShadow: '0px 0px 8px 0px #00000010',
            }}
          >
            <Table className="bg-bground-2 overflow-hidden rounded-2xl">
              <TableHeader>
                <TableRow className="bg-bground h-12 rounded-t-3xl">
                  <TableHead className="w-[50px] text-center">File</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Extension</TableHead>
                  {profile?.role === 'admin' && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource: any) => (
                  <TableRow key={resource.id}>
                    <TableCell className="pl-4">
                      <Avatar className="h-10 w-10">
                        {/* Assuming FilePreview renders an image or icon; replace with actual logic */}
                        <AvatarImage
                          src={`${process.env.API_URL_PREFIX}/media/${resource.resource}`}
                          alt={resource.resource.split('/').pop()}
                        />
                        <AvatarFallback>
                          {resource?.resource
                            .split('/')
                            .pop()
                            .split('.')
                            .shift()[0] || 'F'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {resource.resource
                        .split('/')
                        .pop()
                        .split('.')
                        .shift()
                        .slice(0, 20)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {resource.resource.split('.').pop().toUpperCase()}
                    </TableCell>
                    {profile?.role === 'admin' && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteProjectResource(resource.id)}
                            >
                              <Trash className="h-4 w-4" /> Delete Resource
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectResources;
