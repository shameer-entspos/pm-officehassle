import { Message, useChat } from '@/zustand/inbox/chatStore';
import { UserProfile } from '@/zustand/user/userStore';
import { EllipsisVertical, Pin, Trash2, File, Download } from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const avatarColors = [
  'bg-red-500/30',
  'bg-blue-500/30',
  'bg-green-500/30',
  'bg-yellow-500/30',
  'bg-purple-500/30',
  'bg-pink-500/30',
  'bg-indigo-500/30',
  'bg-orange-500/30',
  'bg-teal-500/30',
  'bg-cyan-500/30',
];

const DocumentViewer = ({ file, type, name }: any) => {
  const [numPages, setNumPages] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const renderContent = () => {
    if (type.startsWith('image/')) {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <Image
            src={`${process.env.API_URL_PREFIX}${file}`}
            alt={name}
            width={isZoomed ? 1200 : 900}
            height={isZoomed ? 1200 : 900}
            className={clsx(
              'cursor-zoom-in rounded-lg object-contain transition-transform duration-300',
              {
                'scale-150': isZoomed,
                'cursor-zoom-out': isZoomed,
              }
            )}
            onClick={handleImageClick}
          />
        </div>
      );
    } else if (type === 'application/pdf') {
      return (
        <div className="max-h-[80vh] overflow-auto">
          <Document
            file={`${process.env.API_URLb_PREFIX}${file}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error: any) =>
              console.error('PDF load error:', error)
            }
          >
            {Array.from(new Array(numPages || 1), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={Math.min(600, window.innerWidth - 40)}
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
            href={`${process.env.API_URL_PREFIX}${file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Open {name} in new tab
          </a>
        </div>
      );
    }
  };

  return <div className="p-4">{renderContent()}</div>;
};

const ChatMessageBubble = ({
  message,
  isUser,
  profile,
}: {
  message: Message;
  isUser: boolean;
  profile: UserProfile;
}) => {
  const { deleteMessageById } = useChat();
  const [open, setOpen] = useState(false);

  const getColorIndex = (sender: string): number => {
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % avatarColors.length;
  };

  const handleDelete = () => {
    deleteMessageById(message?.id);
    console.log('Delete message:', message?.id);
    toast.success('Message deleted!');
  };

  const handlePin = () => {
    console.log('Pin message:', message?.id);
    toast.success('Message pinned!');
  };

  const handleDownload = () => {
    const fileUrl = `${process.env.API_URL_PREFIX}${message?.file}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="relative flex items-start gap-2">
      {!isUser && (
        <Avatar className="size-8 md:size-9">
          <AvatarImage
            src={`${process.env.API_URL_PREFIX}${message?.senderImage}`}
            alt="avatar"
          />
          <AvatarFallback
            className={`uppercase ${avatarColors[getColorIndex(message?.sender)]}`}
          >
            {message?.sender[0]}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col gap-1 ${
          isUser ? 'items-end' : 'items-start'
        } group relative`}
      >
        <div
          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
        >
          <span className="text-muted-foreground mb-1 text-sm font-semibold">
            {message?.sender}
          </span>
          <div
            className={`flex w-max flex-col ${isUser ? 'items-end' : 'items-start'} gap-2`}
          >
            {/* media */}
            {message?.type !== 'text' && (
              <div>
                {message?.type === 'image' && message?.file ? (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <Image
                          src={`${process.env.API_URL_PREFIX}${message?.file}`}
                          alt="message-image"
                          width={500}
                          height={500}
                          className="max-h-96 w-full rounded-2xl object-contain"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="chats max-h-[90vh] overflow-y-auto p-0">
                      <DocumentViewer
                        file={message?.file}
                        type="image/jpeg"
                        name={message?.text}
                      />
                    </DialogContent>
                  </Dialog>
                ) : message?.type === 'document' && message?.file ? (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant={'link'}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <File className="size-4" />
                        <span className="text-sm text-wrap break-words md:text-base">
                          {message?.file.split('/').pop()}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="chats max-h-[90vh] overflow-y-auto p-0">
                      <DocumentViewer
                        file={message?.file}
                        type={
                          message?.file.endsWith('.pdf')
                            ? 'application/pdf'
                            : 'application/octet-stream'
                        }
                        name={message?.text}
                      />
                    </DialogContent>
                  </Dialog>
                ) : message?.type === 'webm' ? (
                  <audio
                    controls
                    src={`${process.env.API_URL_PREFIX}${message?.file}`}
                  />
                ) : (
                  <></>
                )}
                <div
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {message?.type !== 'text' && message?.type !== 'webm' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`mt-2`}
                      onClick={handleDownload}
                    >
                      <Download />
                    </Button>
                  )}
                </div>
              </div>
            )}
            {/* bubble */}
            {message?.text && message?.text !== 'Voice message' && (
              <div
                className={clsx('flex items-center gap-2', {
                  'flex-row': isUser,
                  'flex-row-reverse': !isUser,
                })}
              >
                {profile?.role === 'admin' ||
                  (isUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={'ghost'}
                          size={'icon'}
                          className="size-6"
                        >
                          <EllipsisVertical className="text-muted-foreground size-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className={clsx(isUser ? 'mr-4' : 'ml-4')}
                        side={isUser ? 'left' : 'right'}
                        align="start"
                      >
                        <DropdownMenuItem
                          onClick={handlePin}
                          className="flex items-center gap-2"
                        >
                          <Pin className="size-4" />
                          Pin Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive flex items-center gap-2"
                        >
                          <Trash2 className="text-destructive size-4" />
                          Delete Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                <div
                  className={clsx('flex flex-col rounded-2xl p-2 px-4', {
                    'bg-primary/60': isUser,
                    'bg-zinc-200 dark:bg-zinc-700/60': !isUser,
                  })}
                >
                  <span className="text-foreground text-sm text-wrap break-words md:text-base">
                    {message?.text}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-muted-foreground text-xs">
          {new Date(message?.time).toLocaleTimeString()}
        </span>
      </div>

      {isUser && (
        <Avatar className="size-8 md:size-9">
          <AvatarImage
            src={`${process.env.API_URL_PREFIX}${profile?.photo}`}
            alt="avatar"
          />
          <AvatarFallback className="border-primary text-primary bg-primary/20 border uppercase">
            {profile?.first_name?.charAt(0)}
            {profile?.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessageBubble;
