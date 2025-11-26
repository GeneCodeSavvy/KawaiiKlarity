"use client";

import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  loadMessagesFromStorage: () => void;
  saveMessagesToStorage: () => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
    // Auto-save to sessionStorage
    setTimeout(() => get().saveMessagesToStorage(), 0);
  },

  updateMessage: (id: string, updates: Partial<Message>) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }));
    // Auto-save to sessionStorage
    setTimeout(() => get().saveMessagesToStorage(), 0);
  },

  clearMessages: () => {
    set({ messages: [] });
    sessionStorage.removeItem('chat-transcription-messages');
  },

  loadMessagesFromStorage: () => {
    try {
      const saved = sessionStorage.getItem('chat-transcription-messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          deletedAt: msg.deletedAt ? new Date(msg.deletedAt) : undefined
        }));
        set({ messages: messagesWithDates });
      }
    } catch (error) {
      console.error('Failed to load messages from storage:', error);
    }
  },

  saveMessagesToStorage: () => {
    const { messages } = get();
    if (messages.length > 0) {
      sessionStorage.setItem('chat-transcription-messages', JSON.stringify(messages));
    }
  }
}));