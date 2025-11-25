"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
// Using direct SVG icons to avoid lucide-react dependency issues
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
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
 * ChatInputAI - Hybrid input combining AI Elements with custom media features
 * 
 * This component combines the best of both worlds:
 * - AI Elements PromptInput for modern UX and file attachments
 * - Custom voice recording and speech-to-text components
 * - Media upload with camera capture
 * - Maintains all existing functionality while adding AI SDK features
 */

export function ChatInputAI({
  onSendMessage,
  isLoading = false,
  maxLength = 1000,
  onNewChat
}: ChatInputProps): React.JSX.Element {
  
  const [webSearch, setWebSearch] = useState(false);
  const [showComponents, setShowComponents] = useState(false);

  // Handle AI Elements submission
  const handleSubmit = useCallback((message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Send message with AI Elements format  
    onSendMessage({
      content: message.text || 'Sent with attachments',
      type: MessageType.TEXT,
      timestamp: new Date()
      // TODO: Handle files and webSearch through custom processing
    });
  }, [onSendMessage, webSearch]);

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
    // This would need to be handled differently with AI Elements
    // For now, we'll just log it
    console.log('Speech transcript:', transcript);
  }, []);

  const handleFinalSpeechTranscript = useCallback((transcript: string) => {
    console.log('Final speech transcript:', transcript);
    setShowComponents(false);
  }, []);

  return (
    <div className="flex-shrink-0 bg-background">
      {/* Expandable Menu Panel */}
      {showComponents && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-[#1E2634] border border-gray-200 dark:border-[#364055] rounded-xl p-3">
            <div className="flex items-center gap-2">
              {/* Voice Recording */}
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecordingComplete}
                disabled={isLoading}
              />
              
              {/* Speech to Text */}
              <SpeechToText
                onTranscriptChange={handleSpeechTranscript}
                onFinalTranscript={handleFinalSpeechTranscript}
                disabled={isLoading}
              />
              
              {/* Media Upload */}
              <MediaUpload
                onFilesSelected={handleImageUpload}
                onCamera={handleCameraCapture}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main AI Elements Input */}
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
            
            {/* AI Elements Prompt Input */}
            <PromptInput 
              onSubmit={handleSubmit} 
              className="flex-1" 
              globalDrop 
              multiple
            >
              <PromptInputHeader>
                <PromptInputAttachments>
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
              </PromptInputHeader>
              
              <PromptInputBody>
                <PromptInputTextarea 
                  placeholder="Ask anything..."
                  className="min-h-[24px] max-h-[120px]"
                />
              </PromptInputBody>
              
              <PromptInputFooter>
                <PromptInputTools>
                  {/* Custom Media Button */}
                  <PromptInputButton
                    variant="ghost"
                    onClick={() => setShowComponents(!showComponents)}
                    disabled={isLoading}
                  >
                    <PlusIcon />
                    <span>Media</span>
                  </PromptInputButton>
                  
                  {/* File Attachments Menu */}
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  
                  {/* Web Search Toggle */}
                  <PromptInputButton
                    variant={webSearch ? 'default' : 'ghost'}
                    onClick={() => setWebSearch(!webSearch)}
                  >
                    <GlobeIcon />
                    <span>Search</span>
                  </PromptInputButton>
                </PromptInputTools>
                
                <PromptInputSubmit disabled={isLoading} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}