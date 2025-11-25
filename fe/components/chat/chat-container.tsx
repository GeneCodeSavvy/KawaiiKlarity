"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatContainerProps, Message, MessageType, MessageStatus } from "@/types/chat";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

/**
 * ChatContainer - Main layout wrapper and state orchestrator for the chat interface
 * 
 * Refactored in Phase 3 to use the useChatMessages hook for state management.
 * Now focuses on layout, event handling, and component integration while
 * delegating message management to the dedicated hook.
 * 
 * Key Features:
 * - Full viewport height layout (h-screen)
 * - Multi-modal message support (text, voice, image)
 * - Keyboard shortcuts (Escape to clear)
 * - Responsive layout adjustments for mobile/desktop
 * - Theme-aware styling with CSS variables
 * - Error handling and user feedback
 */

export function ChatContainer({ 
  initialMessages = [], 
  onNewMessage 
}: ChatContainerProps): React.JSX.Element {
  // State management
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for auto-save and DOM manipulation
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chat-messages');
    if (savedMessages && initialMessages.length === 0) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load messages from storage:', error);
      }
    }
  }, [initialMessages.length]);

  // Helper function to generate Marin-chan responses (placeholder for AI integration)
  const generateMarinResponse = useCallback((userMessage: string): string => {
    const responses = [
      "Ara ara! That's such a cute question! ✨ Let me think about the perfect outfit for you~",
      "Kawaii desu ne! 💕 I have some amazing style ideas that would look absolutely adorable on you!",
      "Ohh, fashion time! This is so exciting! Let me suggest something super stylish for you~",
      "Sugoi! You have great taste in asking me! Here's what I'm thinking for your kawaii look...",
      "Kyaa! Fashion advice time! 🌸 I know just the perfect combination that'll make you shine!",
      "Moe moe kyun! Let me help you create the most adorable outfit ever! ✨",
    ];
    
    // Simple keyword-based responses (in real implementation, this would be AI-powered)
    if (userMessage.toLowerCase().includes('weather') || userMessage.toLowerCase().includes('rain')) {
      return "Looking at the weather today, I'd recommend something cozy yet stylish! Maybe a cute jacket with some trendy boots? 🌧️✨";
    }
    
    if (userMessage.toLowerCase().includes('date') || userMessage.toLowerCase().includes('special')) {
      return "Ooh, a special occasion! How exciting! 💕 Let's pick something that makes you feel absolutely gorgeous~";
    }
    
    if (userMessage.toLowerCase().includes('casual') || userMessage.toLowerCase().includes('everyday')) {
      return "Casual kawaii style is my favorite! Let's create a comfortable yet super cute everyday look! 🌸";
    }
    
    // Random response for general questions
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  // Auto-save messages to sessionStorage
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    autoSaveRef.current = setTimeout(() => {
      if (messages.length > 0) {
        sessionStorage.setItem('chat-messages', JSON.stringify(messages));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }
    };
  }, [messages]);

  // Send message function with optimistic updates  
  const handleSendMessage = useCallback(async (messageData: Partial<Message>) => {
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
      // Update status to sent (in real implementation, this would be an API call)
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: MessageStatus.SENT }
              : msg
          )
        );

        // Simulate Marin-chan response after a delay for text messages
        if (messageData.type === MessageType.TEXT || !messageData.type) {
          setTimeout(() => {
            const response: Message = {
              id: crypto.randomUUID(),
              content: generateMarinResponse(messageData.content || ''),
              sender: 'marin',
              timestamp: new Date(),
              type: MessageType.TEXT,
              status: MessageStatus.DELIVERED,
              lang: 'JP' // Marin-chan responds in Japanese style
            };

            setMessages(prev => [...prev, response]);
            onNewMessage?.(response);
          }, 1500 + Math.random() * 1000); // Random delay for realistic feel
        }

      }, 500);

    } catch (error) {
      // Handle error by updating message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: MessageStatus.ERROR }
            : msg
        )
      );
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onNewMessage, generateMarinResponse]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem('chat-messages');
    setError(null);
  }, []);

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

  // Remove unused variable
  const _unused = { error };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        autoScroll={true}
        onDeleteMessage={handleDeleteMessage}
      />
      
      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Type your message... (Shift+Enter for new line)"
        maxLength={1000}
      />
    </div>
  );
}
