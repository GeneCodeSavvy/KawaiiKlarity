"use client";

import React, { useCallback, useState, useEffect } from "react";
import { ChatContainerProps, MessageType, MessageStatus, Message } from "@/types/chat";
import { MessageListAI } from "./message-list-ai";
import { ChatInputAI } from "./chat-input-ai";
import { getApiUrl } from "@/lib/utils";

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
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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

  // Helper functions for message management
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    onNewMessage?.(message);
  }, [onNewMessage]);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Handle audio message transcription
  const handleAudioMessage = useCallback(async (messageData: any) => {
    const messageId = crypto.randomUUID();
    setIsTranscribing(true);
    setError(null);
    
    // 1. Add ghost message immediately
    const ghostMessage: Message = {
      id: messageId,
      content: "",
      sender: 'user',
      timestamp: new Date(),
      type: MessageType.VOICE,
      status: MessageStatus.TRANSCRIBING,
      metadata: messageData.metadata
    };
    
    addMessage(ghostMessage);

    try {
      // 2. Send audio to transcription API
      const formData = new FormData();
      formData.append('audio', messageData.audioBlob, 'recording.webm');
      formData.append('messageId', messageId);

      const response = await fetch(getApiUrl('/api/transcribe'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();

      // 3. Update message with transcription
      updateMessage(messageId, {
        content: result.transcription,
        status: MessageStatus.DELIVERED
      });

      // 4. Continue with existing AI flow for bot response
      setTimeout(() => {
        handleSendMessage({
          content: result.transcription,
          type: MessageType.TEXT
        });
      }, 500);

    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'Transcription failed');
      
      // Update message to show error
      updateMessage(messageId, {
        content: "Failed to transcribe audio",
        status: MessageStatus.ERROR
      });
    } finally {
      setIsTranscribing(false);
    }
  }, [addMessage, updateMessage]);

  // Send message function using AI SDK API
  const handleSendMessage = useCallback(async (messageData: any) => {
    // Handle audio messages differently
    if (messageData.type === MessageType.VOICE && messageData.audioBlob) {
      return handleAudioMessage(messageData);
    }

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
      const response = await fetch(getApiUrl('/api/chat'), {
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
  }, [messages, onNewMessage, handleAudioMessage]);

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
          isLoading={isLoading || isTranscribing}
          autoScroll={true}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
      
      {/* Chat Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInputAI
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isTranscribing}
          placeholder="Type your message... (Shift+Enter for new line)"
          maxLength={1000}
          onNewChat={clearHistory}
        />
      </div>
    </div>
  );
}