import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { objectToFormData } from '@/lib/utils';
import { uploadProjectResourceAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface Project {
  id: string;
}

const UploadProjectResourcesModal = ({
  project,
  handleCloseUploadResourcesModal,
  handleReload,
}: {
  project: Project;
  handleCloseUploadResourcesModal: () => void;
  handleReload: () => void;
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    accept: {
      '*/*': [],
    },
  });

  const handleSubmit = () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    const data = {
      project: project.id,
      resources: files,
    };
    uploadProjectResource(data);
  };

  const uploadProjectResource = (data: {
    project: string;
    resources: File[];
  }) => {
    setLoading(true);
    const formData = objectToFormData(data, 'resources');
    uploadProjectResourceAPI(formData, session?.user?.access ?? '')
      .then((res) => {
        console.log(res);
        handleCloseUploadResourcesModal();
        handleReload();
        toast.success(res.data.message);
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
    <Dialog open={true} onOpenChange={handleCloseUploadResourcesModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Upload Resources
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="text-primary h-12 w-12 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div
              {...getRootProps()}
              className={`rounded-lg border-2 border-dashed p-6 text-center ${
                isDragActive ? 'border-primary bg-gray-100' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm">Drop the files here...</p>
              ) : (
                <p className="text-sm">
                  Drag &apos;n&apos; drop files here, or click to select files
                </p>
              )}
              {files.length > 0 && (
                <div className="mt-2 text-sm">
                  Selected files: {files.map((f) => f.name).join(',')}
                </div>
              )}
            </div>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={files.length === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4" /> Upload Resources
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadProjectResourcesModal;
