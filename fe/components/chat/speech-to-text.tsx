"use client";

import { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { AudioLines, MicOff } from "lucide-react";

interface ClientSpeechToTextProps {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  disabled?: boolean;
  language?: string;
}

export function ClientSpeechToText({ 
  onTranscriptChange,
  onFinalTranscript, 
  disabled = false,
  language = 'en-US'
}: ClientSpeechToTextProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    finalTranscript
  } = useSpeechRecognition();

  // Update parent component with transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscriptChange?.(transcript);
    }
  }, [transcript, onTranscriptChange]);

  // Handle final transcript
  useEffect(() => {
    if (finalTranscript) {
      onFinalTranscript?.(finalTranscript);
    }
  }, [finalTranscript, onFinalTranscript]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: language,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // If browser doesn't support speech recognition or mic not available, show disabled state
  if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
    return (
      <button
        disabled={true}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed opacity-50"
        title={
          !browserSupportsSpeechRecognition 
            ? "Speech recognition not supported in this browser"
            : "Microphone not available. Please check permissions."
        }
      >
        <MicOff className="w-4 h-4" />
        <span className="text-sm">Dictate</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
        ${listening 
          ? 'bg-blue-500 text-white animate-pulse' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={listening ? "Stop listening" : "Voice to text"}
    >
      {listening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <AudioLines className="w-4 h-4" />
      )}
      <span className="text-sm">{listening ? "Stop" : "Dictate"}</span>
    </button>
  );
}