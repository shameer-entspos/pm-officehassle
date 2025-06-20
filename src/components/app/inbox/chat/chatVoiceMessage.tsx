import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProfile } from '@/zustand/user/userStore';
import axios from 'axios';
import { Mic, Send, Square, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loader from '../../loading/loading';

const ChatVoiceMessage = ({
  chatId,
  socket,
  isRecorderReady,
  isRecording,
  recordedBlob,
  startRecording,
  stopRecording,
  resetRecorder,
}: {
  chatId: any;
  socket: WebSocket | null;
  isRecorderReady: any;
  isRecording: any;
  recordedBlob: any;
  startRecording: any;
  stopRecording: any;
  resetRecorder: any;
}) => {
  const { profile } = useProfile();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (recordedBlob) {
      setOpen(true);
    }
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      resetRecorder();
    };
  }, []);

  const handleSend = async () => {
    if (!recordedBlob) return;

    try {
      const response = await createNewMessage({
        text: 'Voice message',
        type: 'webm',
        file: recordedBlob,
        file_type: recordedBlob.type,
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

      toast.success('Voice message sent!', {
        duration: 1000,
      });
    } catch (error) {
      console.log(error);
      // Error is already handled in createNewMessage with toast
    } finally {
      resetRecorder();
      setOpen(false);
    }
  };

  async function createNewMessage({
    text = 'Media',
    type = 'text',
    file,
    file_type,
  }: {
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
      return data;
    } catch (error: any) {
      console.error('Error creating message:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            size={'icon'}
            variant="custom"
            onClick={startRecording}
            disabled={!isRecorderReady || isRecording}
            className="size-8 rounded-full"
          >
            <Mic className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-5 min-w-xs">
          <div className="flex flex-col gap-4">
            <Label>Audio Message</Label>
            {isRecording ? (
              <Label className="animate-pulse text-center">
                <>Recording...</>
              </Label>
            ) : (
              <audio
                controls
                src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''}
              />
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleSend()}
                size="icon"
                type="submit"
                className="size-8"
              >
                {loading ? <Loader /> : <Send className="h-4 w-4" />}
              </Button>
              {isRecording && (
                <Button
                  variant="outline"
                  size={'icon'}
                  className="border-destructive size-8 rounded-full"
                  onClick={stopRecording}
                  disabled={!isRecording}
                >
                  <Square className="fill-destructive size-4 stroke-0" />
                </Button>
              )}
              {recordedBlob && (
                <Button
                  variant="destructive"
                  size={'icon'}
                  className="size-8 rounded-full"
                  onClick={resetRecorder}
                  disabled={!recordedBlob}
                >
                  <Trash className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatVoiceMessage;
