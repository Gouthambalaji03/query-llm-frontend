"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { TTextPart, TToolInvocationPart } from "@/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: Array<TTextPart | TToolInvocationPart>;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  chats: Chat[];
  createChat: (firstMessage: string, chatId?: string) => string;
  getChat: (chatId: string) => Chat | undefined;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  clearAllChats: () => void;
  setChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  chats: [],

  createChat: (firstMessage: string, chatId?: string) => {
    const id = chatId || uuidv4();
    const now = new Date();

    // Generate title from first message (first 50 chars)
    const title = firstMessage.length > 50
      ? firstMessage.substring(0, 50) + "..."
      : firstMessage;

    const newChat: Chat = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      chats: [newChat, ...state.chats],
    }));

    return id;
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
        chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
      ),
    }));
  },

  clearAllChats: () => {
    set({ chats: [] });
  },

  setChat: (chat: Chat) => {
    set((state) => {
      const existingIndex = state.chats.findIndex((c) => c.id === chat.id);
      if (existingIndex >= 0) {
        // Update existing chat
        const newChats = [...state.chats];
        newChats[existingIndex] = chat;
        return { chats: newChats };
      } else {
        // Add new chat
        return { chats: [chat, ...state.chats] };
      }
    });
  },
}));
