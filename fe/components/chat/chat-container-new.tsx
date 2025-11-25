"use client";

import React, { useCallback, useState, useEffect } from "react";
import { ChatContainerProps, MessageType, MessageStatus, Message } from "@/types/chat";
import { MessageListAI } from "./message-list-ai";
import { ChatInputAI } from "./chat-input-ai";

/**
 * ChatContainer - Simplified version using fetch for AI SDK migration
 * 
 * Updated in Phase 4 to integrate with AI SDK backend:
 * - Direct fetch to /api/chat endpoint
 * - Maintains existing multi-modal support  
 * - Preserves all existing features
 * - Easier migration path
 * 
 * Key Features:
 * - Direct API integration with AI SDK backend
 * - Multi-modal message support (text, voice, image)
 * - Keyboard shortcuts (Escape to clear)
 * - Theme-aware styling with CSS variables
 * - Error handling and user feedback
 */

export function ChatContainer({ 
  onNewMessage,
  onClearChat
}: ChatContainerProps): React.JSX.Element {
  
  // State management - keeping existing pattern for easier migration
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load messages from storage:', error);
      }
    }
  }, []);

  // Auto-save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Send message function using AI SDK API
  const handleSendMessage = useCallback(async (messageData: any) => {
    if (!messageData.content?.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: messageData.content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: messageData.type || MessageType.TEXT,
      status: MessageStatus.SENDING,
      metadata: messageData.metadata
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);

    // Notify parent component
    onNewMessage?.(newMessage);

    try {
      // Call AI SDK API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { text: messageData.content, role: 'user' }],
          model: 'gpt-4o',
          webSearch: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResponse = await response.json();

      // Update user message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: MessageStatus.SENT }
            : msg
        )
      );

      // Add AI response
      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: aiResponse.content,
        sender: 'marin',
        timestamp: new Date(),
        type: MessageType.TEXT,
        status: MessageStatus.DELIVERED,
      };

      setMessages(prev => [...prev, botMessage]);
      onNewMessage?.(botMessage);

    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: MessageStatus.ERROR }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, onNewMessage]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem('chat-messages');
    setError(null);
    onClearChat?.();
  }, [onClearChat]);

  // Delete message function
  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deletedAt: new Date() }
          : msg
      )
    );
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to clear (with Ctrl/Cmd modifier)
      if (event.key === 'Escape' && (event.ctrlKey || event.metaKey)) {
        clearHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearHistory]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          Error: {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Message List - takes remaining space and allows scrolling */}
      <div className="flex-1 min-h-0">
        <MessageListAI
          messages={messages}
          isLoading={isLoading}
          autoScroll={true}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
      
      {/* Chat Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInputAI
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your message... (Shift+Enter for new line)"
          maxLength={1000}
          onNewChat={clearHistory}
        />
      </div>
    </div>
  );
}