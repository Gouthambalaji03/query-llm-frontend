"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { dummyChats } from "@/data/dummy-chats";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  chats: Chat[];
  createChat: (firstMessage: string) => string;
  addMessage: (chatId: string, role: "user" | "assistant", content: string) => void;
  getChat: (chatId: string) => Chat | undefined;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  loadDummyData: () => void;
  clearAllChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],

      createChat: (firstMessage: string) => {
        const chatId = uuidv4();
        const now = new Date();

        // Generate title from first message (first 50 chars)
        const title = firstMessage.length > 50
          ? firstMessage.substring(0, 50) + "..."
          : firstMessage;

        const newChat: Chat = {
          id: chatId,
          title,
          messages: [
            {
              id: uuidv4(),
              role: "user",
              content: firstMessage,
              createdAt: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
        }));

        return chatId;
      },

      addMessage: (chatId: string, role: "user" | "assistant", content: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: uuidv4(),
                      role,
                      content,
                      createdAt: new Date(),
                    },
                  ],
                  updatedAt: new Date(),
                }
              : chat
          ),
        }));
      },

      getChat: (chatId: string) => {
        return get().chats.find((chat) => chat.id === chatId);
      },

      deleteChat: (chatId: string) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
        }));
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title } : chat
          ),
        }));
      },

      loadDummyData: () => {
        const currentChats = get().chats;
        if (currentChats.length === 0) {
          set({ chats: dummyChats });
        }
      },

      clearAllChats: () => {
        set({ chats: [] });
      },
    }),
    {
      name: "chat-storage",
      // Handle date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state?.chats) {
            data.state.chats = data.state.chats.map((chat: Chat) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map((msg: Message) => ({
                ...msg,
                createdAt: new Date(msg.createdAt),
              })),
            }));
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
