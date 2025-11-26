"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import { MessageType, MessageStatus, Message, TranscriptionResponse } from "@/types/chat";
import { MessageListAI } from "./message-list-ai";
import { AudioRecorder } from "./audio-recorder";
import { useChatStore } from "@/hooks/use-chat-store";
import { WebSocketMock } from "@/lib/websocket-mock";
import { getApiUrl } from "@/lib/utils";

interface ChatTranscriptionProps {
  onNewMessage?: (message: Message) => void;
  onClearChat?: () => void;
  className?: string;
}

/**
 * ChatTranscription - Chat component with audio transcription support
 * 
 * Features:
 * - Records audio and shows ghost bubble during transcription
 * - POST request to /api/transcribe for transcription
 * - Updates bubble in-place with transcribed text
 * - WebSocket integration for bot replies
 * - Maintains all existing chat functionality
 */
export function ChatTranscription({ 
  onNewMessage,
  onClearChat,
  className = ""
}: ChatTranscriptionProps): React.JSX.Element {
  
  const { messages, addMessage, updateMessage, clearMessages, loadMessagesFromStorage } = useChatStore();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const websocketRef = useRef<WebSocketMock | null>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessagesFromStorage();
  }, [loadMessagesFromStorage]);

  // WebSocket connection for bot replies
  useEffect(() => {
    const websocket = new WebSocketMock({
      onMessage: (botMessage) => {
        addMessage(botMessage);
        onNewMessage?.(botMessage);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError(`Connection error: ${error}`);
      },
      onConnect: () => {
        console.log('Connected to chat service');
        setError(null);
      },
      onDisconnect: () => {
        console.log('Disconnected from chat service');
      }
    });

    websocketRef.current = websocket;

    return () => {
      websocket.disconnect();
    };
  }, [addMessage, onNewMessage]);

  // Handle audio recording completion
  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    const messageId = crypto.randomUUID();
    
    // 1. Add ghost message immediately
    const ghostMessage: Message = {
      id: messageId,
      content: "",
      sender: 'user',
      timestamp: new Date(),
      type: MessageType.VOICE,
      status: MessageStatus.TRANSCRIBING,
      metadata: {
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
        audioDuration: 0, // Will be calculated if needed
        audioMimeType: audioBlob.type
      }
    };

    addMessage(ghostMessage);
    onNewMessage?.(ghostMessage);
    setIsTranscribing(true);
    setError(null);

    try {
      // 2. Send audio to transcription API
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('messageId', messageId);

      const response = await fetch(getApiUrl('/api/transcribe'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result: TranscriptionResponse = await response.json();

      // 3. Update message with transcription
      const updatedMessage = {
        content: result.transcription,
        status: MessageStatus.DELIVERED
      };

      updateMessage(messageId, updatedMessage);

      // 4. Send to bot via WebSocket after transcription
      if (websocketRef.current) {
        websocketRef.current.sendMessage(result.transcription, MessageType.VOICE);
      }

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
  }, [addMessage, updateMessage, onNewMessage]);



  // Handle text message sending
  const handleSendTextMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textInput.trim()) return;

    const textMessage: Message = {
      id: crypto.randomUUID(),
      content: textInput.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: MessageType.TEXT,
      status: MessageStatus.DELIVERED,
    };

    addMessage(textMessage);
    onNewMessage?.(textMessage);
    const messageText = textInput.trim();
    setTextInput("");

    // Send text message to bot via WebSocket
    if (websocketRef.current) {
      websocketRef.current.sendMessage(messageText, MessageType.TEXT);
    }
  }, [textInput, addMessage, onNewMessage]);

  // Clear chat history
  const handleClearChat = useCallback(() => {
    clearMessages();
    setError(null);
    onClearChat?.();
  }, [clearMessages, onClearChat]);

  // Delete message handler
  const handleDeleteMessage = useCallback((messageId: string) => {
    updateMessage(messageId, { deletedAt: new Date() });
  }, [updateMessage]);

  return (
    <div className={`flex flex-col h-full bg-neutral-900 text-white ${className}`}>
      {/* Error display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-2 text-sm">
          Error: {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageListAI
          messages={messages}
          isLoading={isTranscribing}
          autoScroll={true}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>
      
      {/* Input Controls */}
      <div className="flex-shrink-0 bg-neutral-800 p-4 border-t border-neutral-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Text input form */}
            <form onSubmit={handleSendTextMessage} className="flex-1 flex items-center gap-3">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message or record audio..."
                className="flex-1 bg-neutral-700 text-white border border-neutral-600 rounded-lg px-4 py-2 
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isTranscribing}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isTranscribing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </form>

            {/* Audio recorder */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isTranscribing}
              className="flex-shrink-0"
            />

            {/* Clear chat button */}
            <button
              onClick={handleClearChat}
              className="px-3 py-2 text-gray-400 hover:text-white border border-neutral-600 
                       hover:border-neutral-500 rounded-lg transition-colors"
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Recording status */}
          {isTranscribing && (
            <div className="flex items-center justify-center mt-2 text-sm text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2" />
              Transcribing audio message...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}