import Loader from '@/components/app/loading/loading';
import { Button } from '@/components/ui/button';
import { getProjectAttachmentsAPI } from '@/lib/api';
import { useProjectStore } from '@/zustand/project/projectStore';
import { File, Download } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Separator } from '@/components/ui/separator';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentViewer = ({
  file,
  type,
  name,
}: {
  file: string;
  type: string;
  name?: string;
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dialogWidth, setDialogWidth] = useState<number>(600); // Default width
  const dialogRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  // Update dialog width when the component mounts or the dialog resizes
  useEffect(() => {
    const updateWidth = () => {
      if (dialogRef.current) {
        const width = dialogRef.current.offsetWidth;
        setDialogWidth(width - 32); // Subtract padding (16px on each side)
      }
    };

    updateWidth(); // Initial width

    // Add resize observer to handle dialog resizing
    const resizeObserver = new ResizeObserver(updateWidth);
    if (dialogRef.current) {
      resizeObserver.observe(dialogRef.current);
    }

    // Clean up observer on unmount
    return () => {
      if (dialogRef.current) {
        resizeObserver.unobserve(dialogRef.current);
      }
    };
  }, []);

  const renderContent = () => {
    const baseUrl = process.env.API_URL_PREFIX || '';
    if (type === 'image') {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            src={`${process.env.API_URL_PREFIX}${file}`}
            alt={name || 'Attachment'}
            width={isZoomed ? 1200 : 900}
            height={isZoomed ? 1200 : 900}
            className={`cursor-zoom-in rounded-lg object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : ''}`}
            onClick={handleImageClick}
          />
        </div>
      );
    } else if (type === 'document') {
      return (
        <div className="max-h-[80vh] w-full overflow-auto">
          <Document
            file={`${baseUrl}${file}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error: any) => {
              console.error('PDF load error:', error);
              toast.error('Failed to load PDF');
            }}
          >
            {Array.from(new Array(numPages || 1), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={dialogWidth} // Use dynamic width
                className="pdf-page !bg-popover flex flex-col items-center text-center"
              />
            ))}
          </Document>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center gap-2">
          <File className="size-8 text-gray-500" />
          <p className="text-gray-500">
            Preview not available for this file type.
          </p>
          <a
            href={`${baseUrl}${file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open {name || 'file'} in new tab
          </a>
        </div>
      );
    }
  };

  return <div ref={dialogRef}>{renderContent()}</div>;
};

const Attachments = () => {
  const { data: session } = useSession();
  const { project } = useProjectStore();
  const [attachments, setAttachments] = useState<
    { file: string; file_type: string; type: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (project?.id && session?.user) {
      getProjects(project?.id);
    }
  }, [project?.id, session?.user]);

  const getProjects = async (p_id: string) => {
    console.log(session?.user?.access);
    try {
      setLoading(true);
      const res = await getProjectAttachmentsAPI(
        p_id,
        session?.user?.access ?? ''
      );
      setAttachments(res.data.files || []);
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

  const handleDownload = (file: string) => {
    const fileUrl = `${process.env.API_URL_PREFIX || ''}${file}`;
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center py-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between gap-2">
        <h1 className="text-lg font-semibold md:text-xl">Attachments</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => getProjects(project?.id ?? '')}
        >
          Refresh
        </Button>
      </div>

      <div className="py-4">
        {attachments.length === 0 ? (
          <p className="text-center text-gray-500">No attachments found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="bg-bground overflow-hidden rounded-lg p-1 shadow-md"
              >
                {/* Top half: File preview with Dialog */}
                <Dialog
                  open={open === index}
                  onOpenChange={(isOpen) => setOpen(isOpen ? index : null)}
                >
                  <DialogTrigger asChild>
                    <div className="bg-muted flex h-36 cursor-pointer items-center justify-center rounded-md sm:h-48">
                      {attachment.type === 'image' ? (
                        <img
                          src={`${process.env.API_URL_PREFIX}${attachment.file}`}
                          alt={`Attachment ${index}`}
                          className="h-full w-full object-contain"
                        />
                      ) : attachment.file_type?.startsWith(
                          'application/pdf'
                        ) ? (
                        <div className="text-muted-foreground space-y-3 text-center">
                          <File className="mx-auto size-12 sm:size-16" />
                          <p className="text-xs sm:text-sm">PDF File</p>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-center">
                          <File className="mx-auto size-12 sm:size-16" />
                          <p>Unknown File</p>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="custom-scrollbar max-h-full w-full overflow-y-auto sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle className="capitalize">
                        {attachment.type}
                      </DialogTitle>
                    </DialogHeader>
                    <Separator />

                    <DocumentViewer
                      file={attachment.file}
                      type={attachment.type}
                      name={`Attachment ${index + 1}`}
                    />
                  </DialogContent>
                </Dialog>

                {/* Bottom half: File name and Download button */}
                <div className="flex items-center justify-between gap-2 p-1 text-center sm:p-4">
                  <p className="text-primary-foreground truncate text-xs font-medium sm:text-sm">
                    {`Attachment ${index + 1}`}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!w-max"
                    onClick={() => handleDownload(attachment.file)}
                  >
                    <Download className="size-4 sm:size-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attachments;
