"use client";

import { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff, Volume2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  if (!browserSupportsSpeechRecognition) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <Volume2 className="w-5 h-5" />
            <span className="text-sm">
              Speech recognition not supported in this browser
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 text-red-600">
            <MicOff className="w-5 h-5" />
            <span className="text-sm">
              Microphone not available. Please check permissions.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listening) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-600">
                  Listening...
                </span>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={stopListening}
                className="text-blue-600 hover:text-blue-700"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
            {transcript && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm text-foreground">
                  {transcript}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startListening}
      disabled={disabled}
      className="text-muted-foreground hover:text-foreground hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:border-blue-800 transition-colors"
      title="Voice to text"
    >
      <AudioLines className="w-4 h-4" />
    </Button>
  );
}