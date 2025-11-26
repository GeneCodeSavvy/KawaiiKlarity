"use client";

import React from "react";
import { MessageBubbleProps, MessageType, MessageStatus } from "@/types/chat";
import { TextMessage } from "./text-message";
import { ImageMessage } from "./image-message";
import { VoiceMessage } from "./voice-message";

/**
 * MessageBubble - Wrapper component for all message types with consistent styling
 * 
 * This component serves as the foundation for displaying all types of messages
 * in the chat interface. It handles:
 * - Message type routing (TEXT, VOICE, IMAGE, SYSTEM)
 * - User vs AI visual differentiation
 * - Timestamp display and formatting
 * - Message status indicators
 * - Animation on message appearance
 * - Responsive layout
 * - Avatar placeholders
 * - Proper padding for different message types
 */

export function MessageBubble({
  message,
  showAvatar = true,
  showTimestamp = true,
  isGrouped = false,
  onDeleteMessage
}: MessageBubbleProps): React.JSX.Element {
  
  // Determine styling based on sender
  const isUser = message.sender === 'user';
  const isSystem = message.type === MessageType.SYSTEM;

  // Base classes for the message container
  const containerClasses = `
    flex items-start space-x-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300
    ${isUser ? 'justify-end' : 'justify-start'}
    ${isGrouped ? 'mt-1' : 'mt-4'}
  `.trim();

  // Bubble classes based on message type and sender
  const getBubbleClasses = () => {
    const base = "relative max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg shadow-sm";
    
    if (isSystem) {
      return `${base} bg-muted/50 text-muted-foreground text-center mx-auto px-3 py-2`;
    }
    
    if (isUser) {
      return `${base} bg-primary text-primary-foreground`;
    }
    
    // Marin-chan messages
    return `${base} bg-secondary text-secondary-foreground border border-border/50`;
  };

  // Content padding based on message type
  const getContentPadding = () => {
    if (isSystem) return "";
    if (message.type === MessageType.IMAGE) return "p-1";
    if (message.type === MessageType.VOICE) return "px-3 py-2";
    return "px-4 py-3";
  };

  // Status indicator for user messages
  const renderStatusIndicator = () => {
    if (!isUser || !message.status) return null;
    
    const statusIcons = {
      [MessageStatus.SENDING]: "⏳",
      [MessageStatus.SENT]: "✓",
      [MessageStatus.DELIVERED]: "✓✓",
      [MessageStatus.ERROR]: "❌",
      [MessageStatus.PROCESSING]: "🔄",
      [MessageStatus.TRANSCRIBING]: "🎤"
    };

    const statusColors = {
      [MessageStatus.SENDING]: "text-yellow-400",
      [MessageStatus.SENT]: "text-green-400", 
      [MessageStatus.DELIVERED]: "text-green-400",
      [MessageStatus.ERROR]: "text-red-400",
      [MessageStatus.PROCESSING]: "text-blue-400",
      [MessageStatus.TRANSCRIBING]: "text-purple-400"
    };

    return (
      <span className={`text-xs ${statusColors[message.status]} ml-2`}>
        {statusIcons[message.status]}
      </span>
    );
  };

  // Avatar component
  const renderAvatar = () => {
    if (!showAvatar || isSystem || isGrouped) return null;

    if (isUser) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 order-last">
          <span className="text-white font-medium text-sm">U</span>
        </div>
      );
    }

    // Marin-chan avatar
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-sm">M</span>
      </div>
    );
  };

  // Ghost content for transcribing messages
  const renderGhostContent = () => {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-neutral-400 opacity-60 italic text-sm">
          Transcribing audio...
        </div>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  };

  // Message content based on type
  const renderMessageContent = () => {
    // If message is deleted, show deletion notice
    if (message.deletedAt) {
      return (
        <div className="text-sm text-muted-foreground italic">
          This message was deleted
        </div>
      );
    }

    // Show ghost content for transcribing audio messages
    if (message.type === MessageType.VOICE && message.status === MessageStatus.TRANSCRIBING) {
      return renderGhostContent();
    }

    switch (message.type) {
      case MessageType.TEXT:
        return (
          <TextMessage 
            content={message.content}
            lang={message.lang}
          />
        );
      
      case MessageType.IMAGE:
        return (
          <ImageMessage
            imageUrl={message.metadata?.imageUrl || message.content}
            alt={message.metadata?.imageAlt}
            recognizedItems={message.metadata?.recognizedItems}
            isProcessing={message.metadata?.isLoading}
          />
        );
      
      case MessageType.VOICE:
        return (
          <VoiceMessage
            audioUrl={message.metadata?.audioUrl || message.content}
            duration={message.metadata?.audioDuration || 0}
            transcription={message.metadata?.audioTranscription}
            waveform={message.metadata?.audioWaveform}
          />
        );
      
      case MessageType.SYSTEM:
        return (
          <div className="text-sm font-medium">
            {message.content}
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground italic">
            Unsupported message type: {message.type}
          </div>
        );
    }
  };

  // Timestamp component
  const renderTimestamp = () => {
    if (!showTimestamp) return null;

    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = diff / (1000 * 60 * 60);
      
      if (hours < 24) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    };

    return (
      <div className={`
        text-xs text-muted-foreground mt-1 px-1
        ${isUser ? 'text-right' : 'text-left'}
      `}>
        {formatTime(message.timestamp)}
        {renderStatusIndicator()}
      </div>
    );
  };

  // System message (centered, different layout)
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className={getBubbleClasses()}>
          {renderMessageContent()}
          {renderTimestamp()}
        </div>
      </div>
    );
  }

  // Regular message bubble
  return (
    <div className={containerClasses}>
      {/* Avatar (left side for Marin, right side for user) */}
      {!isUser && renderAvatar()}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
        {/* Message bubble with delete button */}
        <div className="relative group">
          <div className={getBubbleClasses()}>
            <div className={getContentPadding()}>
              {renderMessageContent()}
            </div>
          </div>
          
          {/* Delete button - only show if message is not deleted and onDeleteMessage is provided */}
          {!message.deletedAt && onDeleteMessage && (
            <button
              onClick={() => onDeleteMessage(message.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:opacity-80 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
              title="Delete message"
              aria-label="Delete message"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Timestamp */}
        {renderTimestamp()}
      </div>
      
      {/* User avatar (right side) */}
      {isUser && renderAvatar()}
    </div>
  );
}