"use client";

import { useState } from "react";
// @ts-ignore - react-media-recorder doesn't have types but is installed
import { useReactMediaRecorder } from "react-media-recorder";
import { Mic, Square } from "lucide-react";

interface ClientVoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function ClientVoiceRecorder({ 
  onRecordingComplete, 
  onCancel,
  disabled = false 
}: ClientVoiceRecorderProps) {
  const [duration, setDuration] = useState(0);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onStop: async (blobUrl: string) => {
      // Calculate duration and auto-send when recording stops
      const audio = new Audio(blobUrl);
      audio.addEventListener('loadedmetadata', async () => {
        const recordingDuration = audio.duration;
        setDuration(recordingDuration);
        
        // Auto-send the recording
        try {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          onRecordingComplete?.(blob, recordingDuration);
          handleClear();
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      });
      audio.load();
    },
  });

  const isRecording = status === "recording" || status === "delayed_start";

  const handleClear = () => {
    clearBlobUrl();
    setDuration(0);
    onCancel?.();
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-4 h-4 flex items-center justify-center transition-colors
        ${isRecording 
          ? 'text-red-500 animate-pulse' 
          : 'text-white hover:text-gray-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isRecording ? "Stop recording" : "Record voice message"}
    >
      {isRecording ? (
        <Square className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
