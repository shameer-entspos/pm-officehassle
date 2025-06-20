'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Chat, useChat } from '@/zustand/inbox/chatStore';
import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import clsx from 'clsx';
import { EllipsisVertical, Info, Search, User, Users, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import ChatInfo from './chatInfo';
import { PopoverClose } from '@radix-ui/react-popover';

const ChatHeader = ({
  chat,
  search,
  setSearch,
}: {
  chat: Chat;
  search: string;
  setSearch: (search: string) => void;
}) => {
  const { setChat, deSelectChat } = useChat();
  const { setIsSidebarOpen } = useSidebarState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div
      className={`bg-bground-2 flex h-16 items-center justify-between rounded-tl-3xl md:rounded-tl-none ${
        !chat.chatInfo && 'rounded-tr-3xl'
      } border-b px-1 md:px-4`}
    >
      <div className="flex items-center gap-1 md:gap-2">
        <Link href={'/inbox'}>
          <Button
            variant={'ghost'}
            onClick={() => deSelectChat()}
            size={'icon'}
          >
            <X />
          </Button>
        </Link>
        <div className="bg-primary/20 border-primary/70 flex size-10 items-end justify-center overflow-hidden rounded-full border md:size-11">
          {chat.chatType === 'group' ? (
            <Users className="text-primary size-8 md:size-9" />
          ) : (
            <User className="text-primary size-8 md:size-9" />
          )}
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-foreground flex flex-col capitalize">
            <span>{chat.chatName || '-'}</span>

            {/* <span>{chat.chatUsername || '-'}</span> */}
          </div>
          {chat.chatType === 'group' && (
            <span className="text-muted-foreground text-xs">
              {chat.chatParticipants?.length} Members
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {/* Popover for more options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-60 space-y-2 p-2">
            <PopoverClose asChild>
              <Button
                variant="ghost"
                className="hidden w-full justify-start gap-2 md:flex"
                onClick={() => {
                  setChat({ chatInfo: true });
                  setIsSidebarOpen(false);
                }}
              >
                <Info className="size-4" />
                Chat info
              </Button>
            </PopoverClose>

            <PopoverClose asChild>
              {/* Dialog on mobile */}
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2 md:hidden"
                onClick={() => {
                  setIsDialogOpen(true);
                }}
              >
                <Info className="size-4" />
                Chat info
              </Button>
            </PopoverClose>

            <div className="border-t pt-2">
              <Label className="mb-2">Search in chat</Label>
              <SearchInput search={search} setSearch={setSearch} />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Controlled Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="flex min-h-[70vh] max-w-[90%] flex-col overflow-y-auto rounded-2xl !p-0">
          <ChatInfo chat={chat} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHeader;

const SearchInput = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) => {
  return (
    <div
      className={clsx(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-8 w-full min-w-0 items-center rounded-md border bg-transparent pr-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
      )}
    >
      <input
        type="text"
        placeholder="Search"
        value={search}
        className="border-none pl-2 ring-0 !outline-none"
        onChange={(e) => setSearch(e.target.value)}
      />
      <Search className="text-muted-foreground size-4" />
    </div>
  );
};

export { SearchInput };
