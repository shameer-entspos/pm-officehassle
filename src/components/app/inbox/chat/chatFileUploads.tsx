'use client';
import React, { useRef, useState } from 'react';
import axios from 'axios';
import { IoAttach } from 'react-icons/io5';
import { File, Image, Camera, BarChart, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/zustand/user/userStore';

export default function AttachmentMenu({
  chatId,
  socket,
}: {
  chatId: string;
  socket: WebSocket | null;
}) {
  const { profile } = useProfile();
  const { data: session }: any = useSession();
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'document' | 'image' | null>(null);
  const [messageText, setMessageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const onDocumentClick = () => {
    fileInputRef.current?.click();
  };

  const onImageClick = () => {
    imageInputRef.current?.click();
  };

  async function createNewMessage({
    chatId,
    text = 'Media',
    type = 'text',
    file,
    file_type,
  }: {
    chatId: string;
    text?: string;
    type?: string;
    file?: File;
    file_type?: string;
  }) {
    setLoading(true);
    const formData = new FormData();
    formData.append('chat', chatId);
    formData.append('text', text);
    formData.append('type', type);

    if (file) {
      formData.append('file', file);
    }
    if (file_type) {
      formData.append('file_type', file_type);
    }

    try {
      const response = await axios.post(
        process.env.API_URL_PREFIX + '/api/project-management/create-message/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.user?.access}`,
          },
        }
      );

      if (response.status !== 201) {
        console.error('Unexpected response:', response);
        throw new Error('Failed to upload file');
      }

      const data = response.data;
      console.log('Message created:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating message:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileType('document');
    setMessageText('Document upload');
    setIsPopoverOpen(true);
    e.target.value = '';
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileType('image');
    setMessageText('Image upload');
    setIsPopoverOpen(true);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!selectedFile || !fileType) return;

    try {
      const response = await createNewMessage({
        chatId,
        text:
          messageText ||
          `${fileType === 'document' ? 'Document' : 'Image'} upload`,
        type: fileType,
        file: selectedFile,
        file_type: selectedFile.type,
      });

      // Notify WebSocket with the message_id
      if (socket && response.data?.id) {
        const send = {
          type: 'file_upload',
          message_id: response.data.id,
          chat_id: chatId,
          sender: profile?.id,
        };
        socket.send(JSON.stringify(send));
      } else if (!socket) {
        toast.error('WebSocket connection not established');
      }

      toast.success('File uploaded successfully.');
      setIsPopoverOpen(false);
      setSelectedFile(null);
      setFileType(null);
      setMessageText('');
    } catch (error) {
      console.log(error);
      // Error is already handled in createNewMessage with toast
    }
  };

  const handleCancel = () => {
    setIsPopoverOpen(false);
    setSelectedFile(null);
    setFileType(null);
    setMessageText('');
  };

  return (
    <>
      {loading && (
        <Badge className="absolute bottom-20 left-1/2 -translate-x-1/2 text-black">
          Uploading your file <Loader className="size-4 animate-spin" />
        </Badge>
      )}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
      <input
        ref={imageInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onImageChange}
        accept="image/*,video/*"
      />

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <IoAttach />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom" // Position below the button
          align="center" // Center horizontally
          className="w-80 !p-2"
        >
          <div>
            <Button
              variant={'ghost'}
              onClick={onDocumentClick}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg"
            >
              <File className="h-5 w-5 text-[#1DA1F2]" />
              <span>Document</span>
            </Button>
            <Button
              variant={'ghost'}
              onClick={onImageClick}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg"
            >
              <Image className="h-5 w-5 text-[#A855F7]" />
              <span>Photos & videos</span>
            </Button>
            <Button
              variant={'ghost'}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg"
              disabled
            >
              <Camera className="h-5 w-5 text-[#EC4899]" />
              <span>Camera (Coming Soon)</span>
            </Button>
            <Button
              variant={'ghost'}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg"
              disabled
            >
              <BarChart className="h-5 w-5 text-[#FBBF24]" />
              <span>Poll (Coming Soon)</span>
            </Button>
          </div>

          {selectedFile && (
            <>
              <Separator className="my-2" />
              <div className="flex flex-col gap-4 p-2">
                <h4 className="text-sm font-medium">
                  <b className="text-muted-foreground">Selected:</b>{' '}
                  {selectedFile.name}
                </h4>
                <Input
                  placeholder="Add a message (optional)"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={loading}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSend}
                    disabled={loading || !selectedFile}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
