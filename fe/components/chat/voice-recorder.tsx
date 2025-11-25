"use client";

import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: false,
    audio: true,
    onStop: (blobUrl) => {
      // Calculate duration when recording stops
      const audio = new Audio(blobUrl);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.load();
    },
  });

  const isRecording = status === "recording" || status === "delayed_start";
  const hasRecording = mediaBlobUrl && status === "stopped";

  const handlePlayPause = () => {
    if (!mediaBlobUrl) return;

    if (!audioElement) {
      const audio = new Audio(mediaBlobUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSend = async () => {
    if (!mediaBlobUrl) return;
    
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      onRecordingComplete?.(blob, duration);
      handleClear();
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const handleClear = () => {
    clearBlobUrl();
    setAudioElement(null);
    setIsPlaying(false);
    setDuration(0);
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <Card className="w-full border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Recording voice message...
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="default"
                onClick={handleClear}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={stopRecording}
                className="bg-red-600 text-white shadow-md"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasRecording) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                className="w-8 h-8"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Voice message ready</div>
                <div className="text-xs text-muted-foreground">
                  Duration: {formatTime(duration)}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
                className="text-red-600 hover:opacity-80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={handleSend}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startRecording}
      disabled={disabled || isRecording}
      className="text-muted-foreground hover:opacity-80 transition-opacity"
      title="Record voice message"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
}
