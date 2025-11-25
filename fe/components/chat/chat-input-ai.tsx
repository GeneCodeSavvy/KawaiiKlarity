"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Webcam from "react-webcam";
import { useRef } from "react";



const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);



const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);



import {
  PromptInput,
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
  usePromptInputAttachments,
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

// File Upload Button Component
function FileUploadButton({ disabled }: { disabled?: boolean }) {
  const attachments = usePromptInputAttachments();
  
  return (
    <PromptInputButton
      onClick={() => attachments.openFileDialog()}
      disabled={disabled}
    >
      <FileIcon />
      <span>Photos</span>
    </PromptInputButton>
  );
}

/**
 * ChatInputAI - Streamlined input with direct action buttons
 * 
 * Features:
 * - Direct file upload using AI Elements
 * - Direct camera capture
 * - Direct voice recording
 * - Direct speech-to-text
 * - No modal overlays or nested UI
 */

export function ChatInputAI({
  onSendMessage,
  isLoading = false,
  onNewChat
}: ChatInputProps): React.JSX.Element {
  
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

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
      // TODO: Handle files through custom processing
    });
  }, [onSendMessage]);

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
    
    // Voice recording is handled by the VoiceRecorder component
  }, [onSendMessage]);

  // Handle camera capture
  const handleCameraCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onSendMessage({
        content: "Camera photo",
        type: MessageType.IMAGE,
        timestamp: new Date(),
        metadata: {
          imageUrl: imageSrc,
          imageAlt: "Camera photo"
        }
      });
      setShowCamera(false);
    }
  }, [onSendMessage]);

  // Handle speech to text
  const handleSpeechTranscript = useCallback((transcript: string) => {
    // TODO: Integration with AI Elements PromptInputTextarea
    // This would need to be integrated with the prompt input's text state
    console.log('Speech transcript:', transcript);
  }, []);

  const handleFinalSpeechTranscript = useCallback((transcript: string) => {
    // TODO: Add the final transcript to the textarea
    console.log('Final speech transcript:', transcript);
    // For now, we'll submit the transcript as a message
    if (transcript.trim()) {
      onSendMessage({
        content: transcript,
        type: MessageType.TEXT,
        timestamp: new Date()
      });
    }
  }, [onSendMessage]);

  // Camera overlay component
  const CameraOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Take Photo</h3>
          <button
            onClick={() => setShowCamera(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="relative rounded-lg overflow-hidden bg-gray-900 mb-4">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-64 object-cover"
          />
        </div>
        
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setShowCamera(false)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCameraCapture}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-shrink-0 bg-background">
      {/* Camera Overlay */}
      {showCamera && <CameraOverlay />}

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
                  {/* Direct File Upload Button */}
                  <FileUploadButton disabled={isLoading} />
                  
                  {/* Direct Camera Button */}
                  <PromptInputButton
                    onClick={() => setShowCamera(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <CameraIcon />
                    <span>Camera</span>
                  </PromptInputButton>
                  
                  {/* Direct Voice Record Button */}
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceRecordingComplete}
                    disabled={isLoading}
                  />
                  
                  {/* Direct Speech to Text Button */}
                  <SpeechToText
                    onTranscriptChange={handleSpeechTranscript}
                    onFinalTranscript={handleFinalSpeechTranscript}
                    disabled={isLoading}
                  />
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
