"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Mic, Volume2, Send } from "lucide-react";
import { ChatInputProps, MessageType } from "@/types/chat";

// Dynamic imports for SSR compatibility with loading fallbacks
const VoiceRecorder = dynamic(() => 
  import("./voice-recorder").then(mod => ({ default: mod.ClientVoiceRecorder })), 
  { 
    ssr: false, 
    loading: () => (
      <div className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] rounded-full flex items-center justify-center animate-pulse">
        <span className="w-4 h-4 bg-gray-400 dark:bg-[#AEB7C3] rounded-sm" />
      </div>
    )
  }
);

const SpeechToText = dynamic(() => 
  import("./speech-to-text").then(mod => ({ default: mod.ClientSpeechToText })), 
  { 
    ssr: false,
    loading: () => (
      <div className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] rounded-full flex items-center justify-center animate-pulse">
        <span className="w-4 h-4 bg-gray-400 dark:bg-[#AEB7C3] rounded-sm" />
      </div>
    )
  }
);

const MediaUpload = dynamic(() => 
  import("./media-upload").then(mod => ({ default: mod.MediaUpload })), 
  { 
    ssr: false,
    loading: () => (
      <div className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] rounded-full flex items-center justify-center animate-pulse">
        <span className="w-4 h-4 bg-gray-400 dark:bg-[#AEB7C3] rounded-sm" />
      </div>
    )
  }
);

/**
 * ChatInput - Multi-modal input interface with library integrations
 * 
 * This component provides the main input interface with:
 * - Auto-expanding textarea (48px-120px)
 * - Character counter with limit warnings
 * - Send button with loading states
 * - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
 * - Integration with voice-recorder component
 * - Integration with speech-to-text component
 * - Integration with media-upload component
 * - Draft message persistence
 * - Responsive design for mobile/desktop
 */

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message... (Shift+Enter for new line)",
  maxLength = 1000,
  onNewChat
}: ChatInputProps): React.JSX.Element {
  
  // Input state
  const [inputText, setInputText] = useState("");
  const [showComponents, setShowComponents] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = '24px'; // Reset to min height
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, 24), 120); // Min 24px, max 120px
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Handle textarea input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInputText(value);
      adjustTextareaHeight();
    }
  }, [maxLength, adjustTextareaHeight]);

  // Send text message
  const handleSendText = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isLoading) return;

    onSendMessage({
      content: trimmedText,
      type: MessageType.TEXT,
      timestamp: new Date()
    });

    setInputText("");
    adjustTextareaHeight();
    setShowComponents(false);
  }, [inputText, isLoading, onSendMessage, adjustTextareaHeight]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
    // Escape to clear
    if (e.key === 'Escape') {
      setInputText("");
      adjustTextareaHeight();
    }
  }, [handleSendText, adjustTextareaHeight]);

  // Handle voice recording complete
  const handleVoiceRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    
    onSendMessage({
      content: `Voice message (${Math.round(duration)}s)`,
      type: MessageType.VOICE,
      timestamp: new Date(),
      metadata: {
        audioUrl,
        audioDuration: duration,
        audioBlob,
        audioMimeType: audioBlob.type
      }
    });
    
    setShowComponents(false);
  }, [onSendMessage]);

  // Handle image upload
  const handleImageUpload = useCallback((files: File[]) => {
    files.forEach((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      
      // Send with a slight delay to maintain order
      setTimeout(() => {
        onSendMessage({
          content: `Image: ${file.name}`,
          type: MessageType.IMAGE,
          timestamp: new Date(),
          metadata: {
            imageUrl,
            imageAlt: file.name,
            imageWidth: 0, // Will be set when image loads
            imageHeight: 0
          }
        });
      }, index * 100);
    });
    
    setShowComponents(false);
  }, [onSendMessage]);

  // Handle camera capture
  const handleCameraCapture = useCallback((imageData: string) => {
    onSendMessage({
      content: "Camera photo",
      type: MessageType.IMAGE,
      timestamp: new Date(),
      metadata: {
        imageUrl: imageData,
        imageAlt: "Camera photo"
      }
    });
    
    setShowComponents(false);
  }, [onSendMessage]);

  // Handle speech to text
  const handleSpeechTranscript = useCallback((transcript: string) => {
    setInputText(transcript);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleFinalSpeechTranscript = useCallback((transcript: string) => {
    setInputText(transcript);
    adjustTextareaHeight();
    setShowComponents(false);
  }, [adjustTextareaHeight]);

  // Character count and warning
  const charactersRemaining = maxLength - inputText.length;
  const showCharacterWarning = charactersRemaining < 100;

  // Auto-focus on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
    }
  }, []);

  return (
    <div className="flex-shrink-0 bg-background">
      {/* Expandable Menu Panel */}
      {showComponents && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-[#1E2634] border border-gray-200 dark:border-[#364055] rounded-xl p-3">
            <MediaUpload
              onFilesSelected={handleImageUpload}
              onCamera={handleCameraCapture}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Main ChatGPT-style Input Bar */}
      <div className="p-4">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* New Chat Button */}
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="flex-shrink-0 border border-primary/20 hover:border-primary/40 hover:drop-shadow-[0_0_12px_var(--color-primary)] group inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 px-4 py-2 text-base gap-2 bg-background"
              >
                <span>+</span>
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
            
            {/* Chat Input Container */}
            <div className="flex-1 flex items-end bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-3xl transition-colors">
            
            {/* Plus Button */}
            <button
              onClick={() => setShowComponents(!showComponents)}
              disabled={isLoading}
              className="flex-shrink-0 w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] hover:bg-gray-600 dark:hover:bg-[#2A3344] rounded-full flex items-center justify-center m-2 transition-colors disabled:opacity-50 border border-gray-300"
            >
              <Plus className="w-5 h-5 text-white dark:text-[#F5F7FA]" />
            </button>

            {/* Text Input Area */}
            <div className="flex-1 py-3 pr-2">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                disabled={isLoading}
                className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base leading-6 max-h-[120px] min-h-[24px]"
                style={{ height: '24px' }}
              />
              
              {/* Character counter */}
              {showCharacterWarning && (
                <div className={`
                  absolute -top-8 right-4 text-xs px-2 py-1 rounded
                  ${charactersRemaining < 50 ? 'text-red-500' : 'text-yellow-600'}
                `}>
                  {charactersRemaining} characters remaining
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 p-2">
              {/* Microphone - Voice Recording */}
              <div className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] hover:bg-gray-600 dark:hover:bg-[#2A3344] rounded-full flex items-center justify-center transition-colors border border-gray-300">
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecordingComplete}
                  disabled={isLoading}
                />
              </div>

              {/* Audio Wave - Speech to Text */}
              <div className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] hover:bg-gray-600 dark:hover:bg-[#2A3344] rounded-full flex items-center justify-center transition-colors border border-white border-opacity-25">
                <SpeechToText
                  onTranscriptChange={handleSpeechTranscript}
                  onFinalTranscript={handleFinalSpeechTranscript}
                  disabled={isLoading}
                />
              </div>

              {/* Send Button - Only show when there's text to send */}
              {inputText.trim() && (
                <button
                  onClick={handleSendText}
                  disabled={isLoading}
                  className="w-[42px] h-[42px] bg-gray-700 dark:bg-[#1E2634] hover:bg-gray-600 dark:hover:bg-[#2A3344] dark:border dark:border-[#364055] disabled:opacity-50 rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="w-5 h-5 text-white dark:text-[#F5F7FA] transform -translate-x-0.25 " />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
