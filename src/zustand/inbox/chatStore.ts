import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface Message {
  id: string;
  text: string;
  type?: string;
  file?: string | null;
  fileType?: string | null;
  sender: string;
  time: string;
  chatId: string;
  chatName?: string;
  senderImage?: string;
}

export interface ChatMember {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  photo: string;
}

export interface Chat {
  chatAdmin?: boolean;
  chatId?: string;
  chatName?: string;
  chatImage?: string;
  createdOn?: Date;
  chatInfo?: boolean;
  chatType?: string;
  chatUsername?: string;
  allowDirectChat?: boolean;
  chatParticipants?: ChatMember[];
  messages?: Message[];
  opened?: boolean;
}

export interface ChatSummary {
  chatAdmin?: boolean;
  chatId?: string;
  chatName?: string;
  chatImage?: string;
  createdOn?: Date;
  chatInfo?: boolean;
  chatType?: string;
  chatUsername?: string;
  unread?: boolean;
  allowDirectChat?: boolean;
  chatParticipants?: ChatMember[];
  messagesLength: number;
  lastMessage?: Message;
}

export interface ChatState {
  chat: Chat;
  setChat: (partialChat: Partial<Chat>) => void;
  deSelectChat: () => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessageById: (messageId: string) => void;
  chats: ChatSummary[];
  setChats: (chats: ChatSummary[]) => void;
  updateChatSummary: (chatSummary: ChatSummary) => void;
  updateChatField: <K extends keyof Chat>(key: K, value: Chat[K]) => void;
  markChatAsRead: (chatId: string) => void;
}

export const useChat = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        chat: {
          chatAdmin: false,
          chatId: '',
          chatName: '',
          opened: false,
          chatInfo: false,
          chatType: 'group',
          chatUsername: '',
          chatParticipants: [],
          allowDirectChat: false,
          chatImage: '',
          createdOn: new Date(),
          messages: [],
        },

        chats: [],

        // State updaters
        setChat: (partialChat) =>
          set((state) => ({
            chat: {
              ...state.chat,
              ...partialChat,
            },
          })),

        deSelectChat: () =>
          set(() => ({
            chat: {
              chatId: '',
              chatName: '',
              opened: false,
              chatInfo: false,
              chatType: 'group',
              chatUsername: '',
              chatParticipants: [],
              chatImage: '',
              createdOn: new Date(),
            },
          })),

        setMessages: (messages) =>
          set((state) => ({
            chat: {
              ...state.chat,
              messages,
            },
          })),

        updateChatField: (key, value) =>
          set((state) => ({
            chat: {
              ...state.chat,
              [key]: value,
            },
          })),

        addMessage: (message) =>
          set((state) => {
            const existingMessages = state.chat.messages || [];
            const alreadyExists = existingMessages.some(
              (msg) => msg.id === message.id
            );
            if (alreadyExists) return {};

            const updatedMessages = [...existingMessages, message];

            const updatedChat = {
              ...state.chat,
              messages: updatedMessages,
            };

            const updatedChats = state.chats.map((c) =>
              c.chatId === message.chatId
                ? {
                    ...c,
                    messagesLength: c.messagesLength + 1,
                    lastMessage: message,
                  }
                : c
            );

            return {
              chat: updatedChat,
              chats: updatedChats,
            };
          }),

        deleteMessageById: (messageId) =>
          set((state) => {
            const updatedMessages =
              state.chat.messages?.filter((msg) => msg.id !== messageId) || [];

            return {
              chat: {
                ...state.chat,
                messages: updatedMessages,
              },
            };
          }),

        setChats: (chats) =>
          set(() => ({
            chats: chats.map((chat) => ({
              ...chat,
              unread: chat.unread ?? false,
            })),
          })),

        updateChatSummary: (chatSummary) =>
          set((state) => {
            const exists = state.chats.some(
              (c) => c.chatId === chatSummary.chatId
            );

            const updatedChats = exists
              ? state.chats.map((c) =>
                  c.chatId === chatSummary.chatId
                    ? { ...chatSummary, unread: chatSummary.unread ?? true }
                    : c
                )
              : [...state.chats, { ...chatSummary, unread: true }];

            return { chats: updatedChats };
          }),

        markChatAsRead: (chatId) =>
          set((state) => ({
            chats: state.chats.map((c) =>
              c.chatId === chatId ? { ...c, unread: false } : c
            ),
          })),
      }),
      {
        name: 'chat-storage',
      }
    ),
    { name: 'ChatStore' }
  )
);
