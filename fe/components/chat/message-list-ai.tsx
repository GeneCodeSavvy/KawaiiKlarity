"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import { MessageListProps } from "@/types/chat";
import { MessageBubble } from "./message-bubble";

// Copy and refresh icons as SVG
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

/**
 * MessageListAI - Enhanced message display using AI Elements
 * 
 * This component combines AI Elements Conversation components with existing
 * multi-modal message support:
 * - AI Elements for text messages (modern streaming UI)
 * - Custom MessageBubble for voice/image messages (preserve existing features)
 * - Auto-scroll and loading states
 * - Message actions (copy, retry)
 */

export function MessageListAI({
  messages,
  isLoading = false,
  onLoadMore,
  autoScroll = true,
  onDeleteMessage
}: MessageListProps): React.JSX.Element {
  
  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior,
      block: 'end',
      inline: 'nearest'
    });
  }, []);

  // Check if user is near bottom of scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;
    
    setIsNearBottom(nearBottom);
    setUserScrolled(!nearBottom);
  }, []);

  // Auto-scroll on new messages if user is near bottom
  useEffect(() => {
    if (autoScroll && isNearBottom && !userScrolled) {
      const behavior: ScrollBehavior = messages.length <= 1 ? 'auto' : 'smooth';
      scrollToBottom(behavior);
    }
  }, [messages.length, autoScroll, isNearBottom, userScrolled, scrollToBottom]);

  // Reset scroll state when messages are cleared
  useEffect(() => {
    if (messages.length === 0) {
      setUserScrolled(false);
      setIsNearBottom(true);
    }
  }, [messages.length]);

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Message grouping logic
  const getGroupedMessages = () => {
    if (messages.length === 0) return [];

    return messages.map((message, index) => {
      const previousMessage = messages[index - 1];
      const isGrouped = previousMessage &&
        previousMessage.sender === message.sender &&
        (message.timestamp.getTime() - previousMessage.timestamp.getTime()) < 5 * 60 * 1000;

      return {
        ...message,
        isGrouped: Boolean(isGrouped)
      };
    });
  };

  // Handle message copy
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // Handle message retry (placeholder)
  const handleRetryMessage = useCallback(() => {
    console.log('Retry message - implement as needed');
  }, []);

  // Empty state component
  const EmptyState = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="text-6xl">👘</div>
        <h2 className="text-xl font-medium text-foreground">
          Konnichiwa! I'm Marin-chan ✨
        </h2>
        <p className="text-muted-foreground">
          Your kawaii fashion assistant! Share your style questions, upload outfit photos, 
          or tell me about the weather for personalized recommendations.
        </p>
        <p className="text-sm text-muted-foreground">
          Try saying: "What should I wear today?" or "Help me choose an outfit!"
        </p>
      </div>
    </div>
  );

  const groupedMessages = getGroupedMessages();

  return (
    <div className="h-full relative overflow-hidden">
      {/* AI Elements Conversation Container */}
      <Conversation className="h-full">
        <ConversationContent>
          {/* Load more trigger */}
          {onLoadMore && (
            <div className="text-center py-4">
              <button
                onClick={onLoadMore}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load older messages'}
              </button>
            </div>
          )}

          {/* Messages or empty state */}
          {groupedMessages.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {groupedMessages.map((message) => {
                // Use AI Elements Message for text messages from assistant
                if (message.type === 'text' && message.sender === 'marin') {
                  return (
                    <Message key={message.id} from="assistant">
                      <MessageContent>
                        <MessageResponse>
                          {message.content}
                        </MessageResponse>
                      </MessageContent>
                      <MessageActions>
                        <MessageAction
                          onClick={handleRetryMessage}
                          label="Retry"
                        >
                          <RefreshIcon />
                        </MessageAction>
                        <MessageAction
                          onClick={() => handleCopyMessage(message.content)}
                          label="Copy"
                        >
                          <CopyIcon />
                        </MessageAction>
                      </MessageActions>
                    </Message>
                  );
                }
                
                // Use AI Elements Message for user text messages too
                if (message.type === 'text' && message.sender === 'user') {
                  return (
                    <Message key={message.id} from="user">
                      <MessageContent>
                        <MessageResponse>
                          {message.content}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                }

                // Use existing MessageBubble for voice and image messages
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isGrouped={message.isGrouped}
                    showAvatar={false}
                    showTimestamp={true}
                    onDeleteMessage={onDeleteMessage}
                  />
                );
              })}
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </ConversationContent>

        {/* AI Elements Scroll Button */}
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}