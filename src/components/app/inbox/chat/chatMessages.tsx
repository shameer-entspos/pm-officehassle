import { Chat } from '@/zustand/inbox/chatStore';
import { useProfile } from '@/zustand/user/userStore';
import React, { useEffect, useRef } from 'react';
import ChatMessageBubble from './chatMessageBubble';
import { AnimatePresence, motion } from 'framer-motion';

const ChatMessages = ({ chat }: { chat: Chat }) => {
  const { profile } = useProfile();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat.messages?.length]);

  if (!profile) {
    return null;
  }

  return (
    <div className="chats flex-1 overflow-y-auto p-2 md:p-4">
      <AnimatePresence mode="wait">
        <ul className="flex w-full flex-col gap-3">
          {chat.messages && chat.messages.length > 0 ? (
            chat.messages.map((message) => {
              const isUser = message.sender === 'You';

              return (
                <motion.li
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex w-full items-start gap-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <ChatMessageBubble
                    profile={profile}
                    message={message}
                    isUser={isUser}
                  />
                </motion.li>
              );
            })
          ) : (
            <p className="text-muted-foreground h-full text-center">
              No messages yet
            </p>
          )}
          <div ref={bottomRef} />
        </ul>
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
