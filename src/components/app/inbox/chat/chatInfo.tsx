'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chat, ChatSummary, useChat } from '@/zustand/inbox/chatStore';
import { Loader2, MessageCircle, Plus, User, Users, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import AddChatParticipant from './addChatParticipant';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useSession } from 'next-auth/react';
import {
  createDirectChatAPI,
  inviteGuestAPI,
  updateChatDirectPermissionAPI,
} from '@/lib/api';
import { toast } from 'sonner';
import Loader from '@/components/app/loading/loading';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/zustand/user/userStore';

const formSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

const ChatInfo = ({ chat }: { chat: Chat }) => {
  const { profile } = useProfile();
  const { setChat, updateChatField, updateChatSummary } = useChat();
  const [addEmployee, setAddEmployee] = useState(false);
  const [type, setType] = useState('employee');
  const { data: session }: any = useSession();
  const [loading, setLoading] = useState(false);
  const [chatLoadingState, setChatLoadingState] = useState<{
    isLoading: boolean;
    email: string | null;
  }>({
    isLoading: false,
    email: null,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleDirectChatToggle = async (checked: boolean) => {
    if (!chat.chatId || !session?.user?.access) return;

    try {
      await updateChatDirectPermissionAPI(
        chat.chatId,
        checked,
        session.user.access
      );
      updateChatField('allowDirectChat', checked);
      toast.success('Direct chat permission updated!');
    } catch (error) {
      toast.error('Failed to update direct chat permission.');
      console.error(error);
    }
  };

  const createDirectChat = async (participant: any) => {
    if (!chat.chatId || !session?.user?.access) return;

    setChatLoadingState({ isLoading: true, email: participant.email });

    try {
      const res = await createDirectChatAPI(
        chat.chatId,
        participant.email,
        session.user.access
      );

      const newChat = res.data.data;
      if (res.data?.success) {
        setChat({
          chatAdmin: newChat?.chatAdmin,
          chatId: newChat.chat_id,
          chatName: res.data.chat_name,
          chatImage: newChat.chat_image,
          createdOn: newChat.created_on,
          chatType: newChat.chat_type,
          chatParticipants: newChat.chat_participants,
          messages: res.data.messages,
          opened: true,
          chatInfo: false,
          allowDirectChat: newChat.allow_direct_chat,
        });

        // Prepare new ChatSummary object
        const newChatSummary: ChatSummary = {
          chatAdmin: newChat?.chatAdmin,
          chatId: newChat.chat_id,
          chatName: newChat.chat_name,
          chatImage: newChat.chat_image,
          createdOn: newChat.created_on,
          chatInfo: false,
          chatType: newChat.chat_type,
          allowDirectChat: newChat.allow_direct_chat,
          chatParticipants: newChat.chat_participants,
          messagesLength: res.data.messages.length,
          lastMessage: res.data.messages.length
            ? res.data.messages[res.data.messages.length - 1]
            : undefined,
        };

        // Update the chat summary list
        updateChatSummary(newChatSummary);
      }
      toast.success('Direct chat created!');
    } catch (error) {
      toast.error('Failed to create direct chat.');
      console.error(error);
    } finally {
      setChatLoadingState({ isLoading: false, email: null });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await inviteGuestAPI(
        values.email,
        session?.user?.access ?? '',
        chat.chatId as string
      );
      console.log(session?.user?.access);
      // toast.success(values.email);
      // form.reset();
      if (res.status === 201) {
        console.log(res.data);
        toast.success(res.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error('No response received from server.');
      } else if (error.message === 'Network Error') {
        toast.error('Network Error: Please check your internet connection');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return !session?.user ? (
    <div className="grid h-[400px] place-content-center">
      <Loader />
    </div>
  ) : (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex h-16 w-full items-center justify-between rounded-tl-3xl rounded-tr-3xl border-b px-4 py-2 md:rounded-tl-none">
        <div className="flex items-center gap-2">
          <Button
            variant={'ghost'}
            onClick={() => setChat({ chatInfo: false })}
            className="hidden md:flex"
            size={'icon'}
          >
            <X />
          </Button>
          <div className="flex flex-col">
            <span className="text-foreground">{chat.chatName} Info</span>
          </div>
        </div>
      </div>

      {/*  chat info*/}

      <div className="flex w-full flex-col items-center py-4">
        <div className="bg-primary/20 border-primary/70 grid size-28 items-end justify-center overflow-hidden rounded-full border lg:size-32">
          {chat.chatType === 'group' ? (
            <Users className="text-primary size-24 lg:size-28" />
          ) : (
            <User className="text-primary size-24 lg:size-28" />
          )}
        </div>
        <div className="flex flex-col p-2">
          <p className="text-muted-foreground text-center text-xs font-bold capitalize md:text-sm">
            {chat.chatType}
          </p>
          <p className="text-foreground text-center text-lg font-bold">
            {chat.chatName}
          </p>

          <p className="text-muted-foreground text-center text-xs font-bold md:text-sm">
            {chat.createdOn ? formatDateTime(chat.createdOn) : 'N/A'}
          </p>
        </div>
      </div>

      {chat.chatType === 'group' && (
        <>
          {profile?.role === 'admin' && (
            <div className="border-primary/30 border-t border-b px-4 py-3">
              <div className="bg-primary/10 border-primary/30 flex items-center justify-between rounded-lg border p-3">
                <Label>Allow Direct Chat</Label>
                <Switch
                  className="cursor-pointer"
                  disabled={!chat.chatAdmin}
                  checked={chat.allowDirectChat}
                  onCheckedChange={handleDirectChatToggle}
                />
              </div>
            </div>
          )}
          {profile?.role === 'admin' && (
            <>
              {/* invite guest */}
              <div className="p-4 pb-2">
                <div className="space-y-6 rounded-2xl border p-4 transition-all duration-300">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Invite Guest</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter email address"
                                  {...field}
                                />
                              </FormControl>
                              <Button
                                variant="custom"
                                type="submit"
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Invite'
                                )}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </div>

              <Separator className="bg-primary/30 my-3" />
            </>
          )}{' '}
          {/* chat members */}
          <div className="p-4 pt-2">
            <motion.div
              layout
              className="rounded-2xl border p-4 transition-all duration-300"
            >
              {/* chat members */}
              <div className="flex w-full items-center justify-between md:rounded-tl-none">
                <p className="text-foreground font-semibold">
                  {chat.chatParticipants?.length} Members
                </p>
                {chat.chatAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={() => setAddEmployee(!addEmployee)}
                        className="text-muted-foreground cursor-pointer text-xs"
                      >
                        <Badge variant={'custom'}>
                          {' '}
                          <Plus /> Add
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setAddEmployee(true);
                          setType('employee');
                        }}
                      >
                        Add Employee
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setAddEmployee(true);
                          setType('client');
                        }}
                      >
                        Add Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Separator className="my-3" />
              {/* chat participants */}

              <AnimatePresence mode="wait">
                {addEmployee && (
                  <motion.div
                    key="addEmployee"
                    layout // Add this
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'max-content' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeIn' }}
                    className="rounded-xl border p-3"
                  >
                    <AddChatParticipant type={type} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col rounded-xl">
                {chat.chatParticipants?.map((participant, index) => (
                  <div
                    key={index}
                    className="hover:bg-bground-1 flex cursor-pointer items-center justify-between rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={process.env.API_URL_PREFIX + participant.photo}
                          alt={participant.first_name}
                        />
                        <AvatarFallback>
                          {participant.first_name?.charAt(0).toUpperCase()}
                          {participant.last_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-foreground text-base font-medium capitalize">
                          {participant.first_name} {participant.last_name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {participant.username}
                        </span>
                      </div>
                    </div>

                    {participant.email === session?.user?.email ? (
                      <Badge variant={'custom'}>You</Badge>
                    ) : (
                      <Button
                        disabled={
                          (!chat.chatAdmin && !chat.allowDirectChat) ||
                          chatLoadingState.email === participant.email ||
                          profile?.role === 'guest'
                        }
                        variant="outline"
                        onClick={() => createDirectChat(participant)}
                        size="icon"
                      >
                        {chatLoadingState.email === participant.email &&
                        chatLoadingState.isLoading ? (
                          <Loader />
                        ) : (
                          <MessageCircle className="text-secondary-foreground size-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInfo;
