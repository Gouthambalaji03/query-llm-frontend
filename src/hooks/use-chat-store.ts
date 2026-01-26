"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

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
    }),
    {
      name: "chat-storage",
    }
  )
);
