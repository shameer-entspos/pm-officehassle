'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import clsx from 'clsx';
import { EllipsisVertical, User, Users } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChatSummary, Message, useChat } from '@/zustand/inbox/chatStore';
import Loader from '@/components/app/loading/loading';
import { useSession } from 'next-auth/react';

const Sidebar = ({
  chats,
  messages,
}: {
  chats: ChatSummary[];
  messages: Message[];
}) => {
  const { chat, setChat, setMessages, markChatAsRead } = useChat();
  const [isLoading, setIsloading] = useState(true);
  const { data: session }: any = useSession();

  useEffect(() => {
    if (chat) {
      setIsloading(false);
    }
  }, [chat]);

  const [sortedChats, setSortedChats] = useState<ChatSummary[]>([]);

  // Initial sort when component mounts or chats arrive
  useEffect(() => {
    if (chats && chats.length > 0) {
      const initialSorted = [...chats].sort((a, b) => {
        const aTimestamp = a.lastMessage?.time
          ? new Date(a.lastMessage.time).getTime()
          : 0;
        const bTimestamp = b.lastMessage?.time
          ? new Date(b.lastMessage.time).getTime()
          : 0;
        return bTimestamp - aTimestamp;
      });
      setSortedChats(initialSorted);
    }
  }, [chats]);

  // Re-sort on updates, like new messages (reactive to changes)
  const memoizedSortedChats = useMemo(() => {
    return [...sortedChats].sort((a, b) => {
      const aTimestamp = a.lastMessage?.time
        ? new Date(a.lastMessage.time).getTime()
        : 0;
      const bTimestamp = b.lastMessage?.time
        ? new Date(b.lastMessage.time).getTime()
        : 0;
      return bTimestamp - aTimestamp;
    });
  }, [sortedChats]);

  return (
    <div
      className={clsx(
        isLoading && 'grid place-content-center',
        !isLoading && chat.opened && 'hidden md:flex',
        'bg-bground-2 h-full w-full flex-shrink-0 rounded-l-3xl rounded-r-3xl border-r md:w-[270px] md:rounded-r-none lg:w-[350px]'
      )}
    >
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className="flex h-16 w-full items-center justify-between px-4">
            <h2 className="pl-2 text-xl font-semibold">Projects</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={'ghost'} size={'icon'}>
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Archive</DropdownMenuItem>
                <DropdownMenuItem>Mark as read</DropdownMenuItem>
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator />

          {/* Filters */}
          <div className="flex flex-wrap gap-1 px-4 py-2">
            <Badge variant={'default'}>All</Badge>
            <Badge variant={'outline'}>Unread</Badge>
          </div>

          <Separator />

          {/* Scrollable chat list with animation */}
          <div className="chats flex-1 overflow-y-auto py-2 pr-2">
            <ul className="relative flex w-full flex-col space-y-2">
              {memoizedSortedChats.map((chatItem: any) => {
                const chatType = chatItem.chatType;
                const chatName =
                  chatType === 'group'
                    ? chatItem.chatName
                    : chatItem.chatParticipants?.find(
                          (p: any) => p.email !== session?.user?.email
                        )
                      ? `${chatItem.chatParticipants.find((p: any) => p.email !== session?.user?.email)?.first_name} ${chatItem.chatParticipants.find((p: any) => p.email !== session?.user?.email)?.last_name}`
                      : 'Unknown';

                return (
                  <li
                    key={chatItem.chatId}
                    className="flex items-center transition-transform duration-300 ease-in-out"
                    style={{ willChange: 'transform' }}
                  >
                    <p
                      className={`${
                        chat.chatId === chatItem.chatId ? 'bg-primary' : ''
                      } h-8 w-1 rounded-r-[4px]`}
                    ></p>
                    <button
                      onClick={() => {
                        setChat({
                          chatAdmin: chatItem?.chatAdmin,
                          chatId: chatItem.chatId,
                          chatName: chatName,
                          chatImage: chatItem.chatImage,
                          createdOn: chatItem.createdOn,
                          chatType: chatItem.chatType,
                          chatParticipants: chatItem.chatParticipants,
                          messages: chat.messages,
                          opened: true,
                          chatInfo: false,
                          allowDirectChat: chatItem.allowDirectChat,
                        });
                        markChatAsRead(chatItem.chatId);
                        const messagesForChat = messages.filter(
                          (msg) => msg.chatId === chatItem.chatId
                        );
                        setMessages(messagesForChat);
                      }}
                      className={clsx(
                        'from-bground-1 flex w-full cursor-pointer items-center gap-2 rounded-xl to-zinc-100 p-2 text-left hover:bg-gradient-to-br dark:to-zinc-800',
                        chat.chatId === chatItem.chatId ? 'hover:bg-none' : ''
                      )}
                    >
                      <div className="relative">
                        {chatItem.unread && (
                          <span className="bg-primary absolute right-0 size-3 rounded-full" />
                        )}
                        <div
                          className={`${
                            chat.chatId === chatItem.chatId
                              ? 'bg-primary/20 border-primary/70'
                              : 'bg-muted border-input'
                          } flex size-11 flex-shrink-0 items-end justify-center overflow-hidden rounded-full border`}
                        >
                          {chatItem.chatType === 'direct' ? (
                            <User
                              className={`${
                                chat.chatId === chatItem.chatId
                                  ? 'text-primary'
                                  : 'text-muted-foreground/70'
                              } size-9`}
                            />
                          ) : (
                            <Users
                              className={`${
                                chat.chatId === chatItem.chatId
                                  ? 'text-primary'
                                  : 'text-muted-foreground/70'
                              } size-9`}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={clsx(
                              'text-foreground truncate whitespace-nowrap capitalize',
                              chat.chatId === chatItem.chatId && 'font-bold'
                            )}
                          >
                            {chatName}
                          </p>
                        </div>
                        <p className="text-muted-foreground truncate text-xs whitespace-nowrap">
                          {chatItem.lastMessage?.text !== 'Tap to chat' && (
                            <span className="font-bold">
                              {chatItem.lastMessage?.sender
                                ? chatItem.lastMessage?.sender + ': '
                                : ''}
                            </span>
                          )}
                          {chatItem.lastMessage?.text &&
                          chatItem.lastMessage?.text.length > 20
                            ? chatItem.lastMessage?.text.slice(0, 20) + '...'
                            : chatItem.lastMessage?.text}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
