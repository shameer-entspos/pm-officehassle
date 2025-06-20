'use client';

import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useProfile } from '@/zustand/user/userStore';
import SidebarHeader from './sidebarHeader';
import SidebarMenu from './sidebarMenu';
import SidebarFooter from './sidebarFooter';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/context/notificationContext';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { ChatMessageToast } from '../inbox/chat/chatNotificationToast';
import { useRouter } from 'next/navigation';
import { useChat } from '@/zustand/inbox/chatStore';

const AppSidebar = () => {
  const { notifications } = useNotification();
  const { isSidebarOpen } = useSidebarState();
  const { data: session } = useSession();
  const { profile } = useProfile();
  const router = useRouter();
  const { chat, chats, updateChatSummary } = useChat();
  const [displayedNotificationIds, setDisplayedNotificationIds] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    if (notifications.length > 0 && session?.user?.email) {
      notifications.forEach(
        (
          notification: {
            type: string;
            chat_id: string;
            message: string;
            sender: string;
            email: string;
          },
          index: number
        ) => {
          const notificationId = `${notification.chat_id}-${notification.message}-${index}`;

          if (
            notification.email === session?.user?.email ||
            displayedNotificationIds.has(notificationId)
          ) {
            return;
          }

          // Find the chat matching the notification's chat_id
          const targetChat = chats.find(
            (c) => c.chatId === notification.chat_id
          );

          const closed = chat.chatId !== targetChat?.chatId;

          if (targetChat && closed) {
            updateChatSummary({
              ...targetChat,
              lastMessage: {
                text: notification.message,
                sender: notification.sender,
                time: new Date().toISOString(),
                id: '',
                chatId: notification.chat_id,
              },
              unread: true,
            });
          }

          if (closed) {
            toast.custom(
              (t) => (
                <ChatMessageToast
                  sender={notification.sender}
                  message={notification.message}
                  // chatId={notification.chat_id}
                  onClick={() => {
                    router.push(`/inbox`);
                    toast.dismiss(t);
                  }}
                />
              ),
              {
                duration: 6000,
                position: 'top-right',
              }
            );
          }

          setDisplayedNotificationIds((prev) =>
            new Set(prev).add(notificationId)
          );
        }
      );
    }
  }, [notifications, session?.user?.email, chats, updateChatSummary, router]);

  return (
    <div
      className={clsx(
        `dark:bg-bground-2 flex h-screen flex-col overflow-auto bg-white p-2 transition-all duration-300 ease-in-out`,
        {
          'w-[300px]': !profile && isSidebarOpen,
          'w-[60px] sm:w-[80px]': !isSidebarOpen,
          'w-[60px] sm:w-[80px] md:w-[280px] lg:w-[300px]': isSidebarOpen,
        }
      )}
    >
      <div className="h-[80vh]">
        <SidebarHeader isSidebarOpen={isSidebarOpen} profile={profile} />
        <Separator className="mt-3" />
        <SidebarMenu isSidebarOpen={isSidebarOpen} />
      </div>

      <Separator />
      <div className="flex h-[20vh] w-full flex-col justify-end">
        <SidebarFooter isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default AppSidebar;
