"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MessageListProps } from "@/types/chat";
import { MessageBubble } from "./message-bubble";

/**
 * MessageList - Scrollable container for message bubbles with auto-scroll
 * 
 * This component manages the display and scrolling behavior of chat messages:
 * - Auto-scroll to bottom on new messages
 * - Scroll position management
 * - Loading states and skeleton UI
 * - Empty state handling
 * - Proper spacing between messages
 * - Message grouping logic (same sender within timeframe)
 * - Intersection observer for read receipts (future)
 */

export function MessageList({
  messages,
  isLoading = false,
  onLoadMore,
  autoScroll = true
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
      // Use immediate scroll for the first message, smooth for subsequent ones
      const behavior = messages.length <= 1 ? 'instant' : 'smooth';
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

  // Message grouping logic - group messages from same sender within 5 minutes
  const getGroupedMessages = () => {
    if (messages.length === 0) return [];

    return messages.map((message, index) => {
      const previousMessage = messages[index - 1];
      const isGrouped = previousMessage &&
        previousMessage.sender === message.sender &&
        (message.timestamp.getTime() - previousMessage.timestamp.getTime()) < 5 * 60 * 1000; // 5 minutes

      return {
        ...message,
        isGrouped: Boolean(isGrouped)
      };
    });
  };

  // Loading skeleton component
  const MessageSkeleton = () => (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

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

  // Scroll to bottom button
  const ScrollToBottomButton = () => {
    if (isNearBottom || messages.length === 0) return null;

    return (
      <button
        onClick={() => scrollToBottom()}
        className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10"
        aria-label="Scroll to bottom"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </button>
    );
  };

  const groupedMessages = getGroupedMessages();

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Messages container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth px-4 py-4"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
        }}
      >
        {/* Load more trigger (if provided) */}
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
            {groupedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isGrouped={message.isGrouped}
                showAvatar={!message.isGrouped}
                showTimestamp={true}
              />
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-4 mt-4">
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Scroll to bottom button */}
      <ScrollToBottomButton />
    </div>
  );
}