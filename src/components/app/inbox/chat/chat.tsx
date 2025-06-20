// Full working setup for Chat and ChatMessageInput logic

'use client';

import React, { useEffect, useState } from 'react';
import ChatHeader from './chatHeader';
import ChatMessageInput from './chatMessageInput';
import { useChat } from '@/zustand/inbox/chatStore';
import Loader from '@/components/app/loading/loading';
import ChatMessages from './chatMessages';
import { getChatMessagesAPI } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const Chat = () => {
  const { chat, setMessages, addMessage } = useChat();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(true);
  const { data: session }: any = useSession();

  useEffect(() => {
    // Create WebSocket connection
    if (chat.chatId) {
      getMessages(chat.chatId);
      const socket = new WebSocket(
        `ws://127.0.0.1:8000/ws/chat/${chat.chatId}/`
      );

      // Set WebSocket instance on open
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(socket);
      };

      // Handle WebSocket errors
      socket.onerror = (event: any) => {
        console.error('WebSocket connection error', event);
      };

      // Handle incoming messages
      socket.onmessage = (event: any) => {
        const newMessage = JSON.parse(event.data);
        console.log(newMessage);

        if (newMessage.id) {
          addMessage({
            id: newMessage.id,
            text: newMessage.text,
            sender:
              newMessage.sender_email === session?.user?.email
                ? 'You'
                : newMessage.sender,
            time: newMessage.created_on,
            chatName: chat.chatName ?? '',
            chatId: chat.chatId ?? '',
            senderImage: newMessage.user_image,
            type: newMessage.message_type,
            file: newMessage.file,
            fileType: newMessage.file_type,
          });
        }
      };
      setIsLoading(false);
    }

    // Clean up WebSocket connection on unmount
    return () => {
      if (socket) {
        console.log('Closing WebSocket connection');
        socket.close();
      }
    };
  }, [session?.user]);

  const getMessages = async (id: string) => {
    try {
      const res = await getChatMessagesAPI(id, session?.user?.access);
      console.log(res.data.data);
      setMessages(
        res.data.data.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sender:
            msg.sender.email === session?.user?.email
              ? 'You'
              : (msg.sender.username ??
                msg.sender.first_name + ' ' + msg.sender.id),
          time: msg.created_on,
          senderImage: msg.sender?.photo,
          chatName: chat.chatName ?? '',
          chatId: chat.chatId ?? '',
          type: msg.type,
          file: msg.file,
          fileType: msg.file_type,
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
      setMessagesLoading(false);
    }
  };

  return isLoading ? (
    <div className="bg-bground-1 grid h-full w-full place-content-center rounded-3xl">
      <Loader />
    </div>
  ) : (
    <div className="relative flex h-full flex-col justify-between">
      <ChatHeader chat={chat} search={search} setSearch={setSearch} />

      {messagesLoading ? (
        <div className="bg-bground-1 grid h-full w-full place-content-center rounded-3xl">
          <Loader />
        </div>
      ) : (
        <ChatMessages chat={chat} />
      )}

      <ChatMessageInput socket={socket} />
    </div>
  );
};

export default Chat;
