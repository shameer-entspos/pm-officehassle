'use client';
import Sidebar from '@/components/app/inbox/sidebar';
import { useChat } from '@/zustand/inbox/chatStore';
import React, { useEffect, useState } from 'react';
import Chat from './chat/chat';
import ChatInfo from './chat/chatInfo';
import { AnimatePresence, motion } from 'framer-motion';
import { useSidebarState } from '@/zustand/sidebar/sidebarStore';
import Loader from '@/components/app/loading/loading';
import { AiTwotoneMessage } from 'react-icons/ai';
import { useSession } from 'next-auth/react';
import { getAllChatsAPI } from '@/lib/api';
import { toast } from 'sonner';
const testMessages = [
  {
    id: 'msg-1',
    text: 'Hey team, how’s it going?',
    sender: 'Alice',
    time: '2025-05-10T09:00:00Z',
    chatName: 'Team Alpha',
    chatId: 'chat-123',
  },
  {
    id: 'msg-2',
    text: 'Just wrapped up the sprint backlog.',
    sender: 'Bob',
    time: '2025-05-10T09:05:00Z',
    chatName: 'Team Alpha',
    chatId: 'chat-123',
  },
  {
    id: 'msg-3',
    text: 'We are meeting at 2pm.',
    sender: 'Charlie',
    time: '2025-05-10T09:10:00Z',
    chatName: 'Team Alpha',
    chatId: 'chat-123',
  },
  {
    id: 'msg-4',
    text: 'What’s the agenda?',
    sender: 'Alice',
    time: '2025-05-10T09:15:00Z',
    chatName: 'Team Alpha',
    chatId: 'chat-123',
  },
  {
    id: 'msg-5',
    text: 'Got it, thanks!',
    sender: 'Jane',
    time: '2025-05-10T10:00:00Z',
    chatName: 'Team Beta',
    chatId: 'chat-456',
  },
  {
    id: 'msg-6',
    text: 'Can you review the code I pushed?',
    sender: 'John',
    time: '2025-05-10T11:00:00Z',
    chatName: 'Team Beta',
    chatId: 'chat-456',
  },
  {
    id: 'msg-7',
    text: 'Invoice has been sent.',
    sender: 'Mark',
    time: '2025-05-10T12:00:00Z',
    chatName: 'Client X',
    chatId: 'chat-789',
  },
  {
    id: 'msg-8',
    text: 'Received, thanks.',
    sender: 'Client',
    time: '2025-05-10T12:15:00Z',
    chatName: 'Client X',
    chatId: 'chat-789',
  },
  {
    id: 'msg-9',
    text: 'Can we schedule a follow-up?',
    sender: 'Mark',
    time: '2025-05-10T12:30:00Z',
    chatName: 'Client X',
    chatId: 'chat-789',
  },
  {
    id: 'msg-10',
    text: 'Sure, how about Monday?',
    sender: 'Client',
    time: '2025-05-10T12:45:00Z',
    chatName: 'Client X',
    chatId: 'chat-789',
  },
];

const testChats = [
  {
    chatId: 'chat-123',
    chatName: 'Team Alpha',
    messagesLength: 4,
    lastMessage: {
      id: 'msg-4',
      text: 'What’s the agenda?',
      sender: 'Alice',
      time: '2025-05-10T09:15:00Z',
      chatName: 'Team Alpha',
      chatId: 'chat-123',
    },
  },
  {
    chatId: 'chat-456',
    chatName: 'Team Beta',
    messagesLength: 2,
    lastMessage: {
      id: 'msg-6',
      text: 'Can you review the code I pushed?',
      sender: 'John',
      time: '2025-05-10T11:00:00Z',
      chatName: 'Team Beta',
      chatId: 'chat-456',
    },
  },
  {
    chatId: 'chat-789',
    chatName: 'Client X',
    messagesLength: 4,
    lastMessage: {
      id: 'msg-10',
      text: 'Sure, how about Monday?',
      sender: 'Client',
      time: '2025-05-10T12:45:00Z',
      chatName: 'Client X',
      chatId: 'chat-789',
    },
  },
];

const Inbox = () => {
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  const { data: session }: any = useSession();
  const { setIsSidebarOpen } = useSidebarState();
  const [isLoading, setIsLoading] = useState(true);
  const { chat, chats, setChat, setChats } = useChat();

  // useEffect(() => {
  //   // Create WebSocket connection
  //   const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/`);

  //   // Set WebSocket instance on open
  //   socket.onopen = () => {
  //     console.log('WebSocket connection established');
  //     setSocket(socket);
  //   };

  //   // Handle WebSocket errors
  //   socket.onerror = (event) => {
  //     console.error('WebSocket connection error', event);
  //   };

  //   // Handle incoming messages
  //   socket.onmessage = (event) => {
  //     console.log(event);
  //   };

  //   // Clean up WebSocket connection on unmount
  //   return () => {
  //     console.log('Closing WebSocket connection');
  //     socket.close();
  //   };
  // }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        console.log('OK');
        // setChat({
        //   opened: false,
        // });
      } else {
        // Screen width is less than 768px
        setChat({
          chatInfo: false,
        });
      }
    };

    // Add listener for changes only (no initial check)
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    // Initial check
    if (!mediaQuery.matches) {
      setChat({
        chatInfo: false,
      });
    }

    // Cleanup listener
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (testChats) {
      setChats(testChats);
    }
    setIsSidebarOpen(false);

    return () => {
      setIsSidebarOpen(true);
      setChat({
        chatId: '',
        chatName: '',
        opened: false,
        chatInfo: false,
        messages: [],
      });
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      getChats(session.user.access);
    }
  }, [session?.user]);

  const getChats = async (atoken: string) => {
    try {
      const res = await getAllChatsAPI(atoken);

      console.log(
        res.data.data.map((chat: any) =>
          chat?.chatParticipants?.map((participant: any) => participant)
        )
      );

      setChats(
        res.data.data.map((chat: any) => ({
          chatAdmin: chat?.admin?.email === session?.user?.email,
          chatId: chat.chat_id,
          chatName: chat.chat_name,
          chatImage: chat.chat_image,
          createdOn: chat.created_on,
          chatType: chat.chat_type,
          allowDirectChat: chat.allow_direct_chat,
          chatParticipants: chat.chat_participants,
          messagesLength: chat.messages_length || 0,

          lastMessage: chat.last_message
            ? {
                id: chat.last_message?.id,
                text: chat.last_message?.text,
                sender:
                  chat.last_message?.sender?.email === session?.user?.email
                    ? 'You'
                    : (chat.last_message?.sender?.username ??
                      chat.last_message?.sender?.first_name +
                        ' ' +
                        chat.last_message?.sender?.id),
                time: chat.last_message?.created_on,
                chatName: chat.chatName ?? '',
                chatId: chat.chatId ?? '',
                senderImage: chat.last_message?.sender?.photo,
                type: chat.last_message?.message_type,
                file: chat.last_message?.file,
                fileType: chat.last_message?.file_type,
              }
            : {
                id: Math.random().toString() + Date.now(),
                text: 'Tap to open chat',
                sender: null,
                time: new Date().toISOString(),
                chatName: chat.chatName ?? '',
                chatId: chat.chatId ?? '',
              },
        }))
      );
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <div className="bg-bground-1 grid h-full w-full place-content-center rounded-3xl">
      <Loader />
    </div>
  ) : (
    <div className="bg-bground-1 flex h-full w-full justify-between rounded-3xl">
      <Sidebar chats={chats} messages={testMessages} />

      <div className="bg-bground-1 flex w-full rounded-l-3xl rounded-r-3xl md:w-[calc(100%_-_270px)] md:justify-between md:rounded-l-none lg:w-[calc(100%_-_350px)]">
        <AnimatePresence mode="wait">
          {chat.opened && (
            <motion.div
              key={chat.chatId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`h-full w-full rounded-3xl transition-[width] duration-500 ${chat.chatInfo && 'hidden xl:block xl:w-1/2 2xl:w-2/3'}`}
            >
              <Chat />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {chat.chatInfo && (
            <motion.div
              key="chatInfo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={`bg-bground-2 flex h-full w-full flex-col rounded-l-3xl rounded-r-3xl border-l md:rounded-l-none xl:w-1/2 2xl:w-1/3`}
            >
              <ChatInfo chat={chat} />
            </motion.div>
          )}
        </AnimatePresence>

        {!chat.opened && (
          <div className="text-muted-foreground hidden h-full w-full place-content-center rounded-3xl md:grid">
            <AiTwotoneMessage className="mx-auto size-16" />
            Open a chat
            {/* <button
              onClick={() => {
                if (socket) {
                  const send = { message: 'Hi it is working!' };
                  socket.send(JSON.stringify(send));
                } else {
                  toast.error('WebSocket connection not established');
                }
              }}
            >
              Send message
            </button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
