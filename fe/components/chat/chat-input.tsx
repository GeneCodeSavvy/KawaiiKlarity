"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInputProps, MessageType } from "@/types/chat";

// Dynamic imports for SSR compatibility with loading fallbacks
const VoiceRecorder = dynamic(() => 
  import("./voice-recorder").then(mod => ({ default: mod.ClientVoiceRecorder })), 
  { 
    ssr: false, 
    loading: () => (
      <Button variant="outline" size="icon" disabled className="animate-pulse">
        <span className="w-4 h-4 bg-muted rounded-sm" />
      </Button>
    )
  }
);

const SpeechToText = dynamic(() => 
  import("./speech-to-text").then(mod => ({ default: mod.ClientSpeechToText })), 
  { 
    ssr: false,
    loading: () => (
      <Button variant="outline" size="icon" disabled className="animate-pulse">
        <span className="w-4 h-4 bg-muted rounded-sm" />
      </Button>
    )
  }
);

const MediaUpload = dynamic(() => 
  import("./media-upload").then(mod => ({ default: mod.MediaUpload })), 
  { 
    ssr: false,
    loading: () => (
      <Button variant="outline" size="icon" disabled className="animate-pulse">
        <span className="w-4 h-4 bg-muted rounded-sm" />
      </Button>
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
  maxLength = 1000
}: ChatInputProps): React.JSX.Element {
  
  // Input state
  const [inputText, setInputText] = useState("");
  const [showComponents, setShowComponents] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = '48px'; // Reset to min height
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, 48), 120); // Min 48px, max 120px
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
  }, [inputText]);

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
    <div className="flex-shrink-0 border-t border-border bg-background">
      {/* Extended components panel */}
      {showComponents && (
        <div className="border-b border-border p-4 bg-muted/30">
          <div className="space-y-4">
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              onCancel={() => setShowComponents(false)}
              disabled={isLoading}
            />
            <SpeechToText
              onTranscriptChange={handleSpeechTranscript}
              onFinalTranscript={handleFinalSpeechTranscript}
              disabled={isLoading}
            />
            <MediaUpload
              onFilesSelected={handleImageUpload}
              onCamera={handleCameraCapture}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Input controls */}
          <div className="flex space-x-2 pb-1">
            {!showComponents ? (
              <>
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecordingComplete}
                  disabled={isLoading}
                />
                <SpeechToText
                  onTranscriptChange={handleSpeechTranscript}
                  onFinalTranscript={handleFinalSpeechTranscript}
                  disabled={isLoading}
                />
                <MediaUpload
                  onFilesSelected={handleImageUpload}
                  onCamera={handleCameraCapture}
                  disabled={isLoading}
                />
              </>
            ) : (
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowComponents(false)}
                className="text-muted-foreground hover:text-foreground text-sm px-3 py-1"
              >
                Collapse
              </Button>
            )}
            
            {!showComponents && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowComponents(true)}
                className="text-muted-foreground hover:text-foreground text-sm px-3 py-1"
                disabled={isLoading}
              >
                More
              </Button>
            )}
          </div>

          {/* Text input area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 pr-12 border border-border rounded-lg bg-background 
                text-foreground placeholder-muted-foreground resize-none 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all duration-200 min-h-[48px] max-h-[120px]
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${showCharacterWarning ? 'border-yellow-400 focus:ring-yellow-400' : ''}
              `}
              style={{ height: '48px' }}
            />
            
            {/* Character counter */}
            {showCharacterWarning && (
              <div className={`
                absolute -top-6 right-0 text-xs px-2 py-1 rounded
                ${charactersRemaining < 50 ? 'text-red-500' : 'text-yellow-600'}
              `}>
                {charactersRemaining} characters remaining
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendText}
            disabled={!inputText.trim() || isLoading}
            className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send • Shift+Enter for new line • Escape to clear
        </div>
      </div>
    </div>
  );
}