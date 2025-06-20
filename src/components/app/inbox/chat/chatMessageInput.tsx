'use client';

import { Button } from '@/components/ui/button';
import { useChat } from '@/zustand/inbox/chatStore';
import React from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProfile } from '@/zustand/user/userStore';
import AttachmentMenu from './chatFileUploads';
import ChatVoiceMessage from './chatVoiceMessage';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';

const formSchema = z.object({
  message: z.string().min(1).max(3000),
});

const ChatMessageInput = ({ socket }: { socket: WebSocket | null }) => {
  const {
    isRecorderReady,
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    resetRecorder,
  } = useVoiceRecorder();
  const { chat } = useChat();
  const { profile } = useProfile();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (socket) {
        const send = {
          type: 'text',
          text: values.message,
          chat_id: chat.chatId ?? '',
          sender: profile?.id,
        };
        socket.send(JSON.stringify(send));
      } else {
        toast.error('WebSocket connection not established');
      }

      form.reset({ message: '' });
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <div
      className={`bg-bground-2 flex h-16 items-center justify-between gap-2 rounded-bl-3xl md:rounded-bl-none ${!chat.chatInfo && 'rounded-br-3xl'} border-t px-2 md:px-4`}
    >
      <AttachmentMenu chatId={chat.chatId ?? ''} socket={socket} />

      <>
        <Form {...form}>
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field, fieldState }) => (
                <FormItem className="flex-1">
                  <Tooltip open={!!fieldState.error}>
                    <TooltipTrigger asChild>
                      <FormControl>
                        <Input
                          autoFocus
                          placeholder="Enter message here..."
                          type="text"
                          {...field}
                          className={fieldState.error ? 'border-red-500' : ''}
                        />
                      </FormControl>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {fieldState.error?.message}
                    </TooltipContent>
                  </Tooltip>
                </FormItem>
              )}
            />
            <Button size="icon" type="submit" className="size-8">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </>

      <ChatVoiceMessage
        chatId={chat?.chatId ?? ''}
        socket={socket}
        isRecorderReady={isRecorderReady}
        isRecording={isRecording}
        recordedBlob={recordedBlob}
        startRecording={startRecording}
        stopRecording={stopRecording}
        resetRecorder={resetRecorder}
      />
    </div>
  );
};

export default ChatMessageInput;
