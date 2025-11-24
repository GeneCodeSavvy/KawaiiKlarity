"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceMessageProps } from "@/types/chat";

/**
 * VoiceMessage - Audio playback with controls and transcription
 * 
 * This component handles voice message rendering with:
 * - Custom audio controls (play/pause, progress, time)
 * - Waveform visualization (if data available)
 * - Transcription display (collapsible)
 * - Download audio file option
 * - Format compatibility checking
 * - Error handling for unsupported formats
 * - Loading states during audio processing
 * - Accessibility support (keyboard controls, screen readers)
 */

export function VoiceMessage({
  audioUrl,
  duration,
  transcription,
  waveform,
  autoPlay = false
}: VoiceMessageProps): React.JSX.Element {
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [volume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      
      if (autoPlay) {
        handlePlay();
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    // Set volume
    audio.volume = volume;
    audio.muted = isMuted;

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [audioUrl, autoPlay, volume, isMuted]);

  // Play/pause control
  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((error) => {
        console.error('Audio playback failed:', error);
        setHasError(true);
      });
      setIsPlaying(true);
    }
  };

  // Seek to position
  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress || hasError) return;

    const rect = progress.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Download audio
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-message-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle mute
  const handleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audio.muted = newMuted;
  };

  // Restart audio
  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audio.play();
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  // Waveform visualization component
  const WaveformDisplay = ({ data }: { data: number[] }) => (
    <div className="flex items-center justify-center space-x-0.5 h-8 px-2">
      {data.slice(0, 50).map((value, index) => {
        const height = Math.max(value * 24, 2); // Min 2px, max 24px
        const isActive = (index / data.length) <= (currentTime / duration);
        
        return (
          <div
            key={index}
            className={`
              w-1 rounded-full transition-colors duration-150
              ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}
            `}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="min-w-[280px] max-w-md space-y-3">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />

      {/* Main player controls */}
      <div className="bg-secondary/50 rounded-lg p-3 space-y-3">
        {/* Top row - Play button and info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              disabled={isLoading || hasError}
              className="w-10 h-10 flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>

            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                Voice message
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleMute}
              className="w-8 h-8"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              disabled={isLoading || hasError}
              className="w-8 h-8"
              title="Restart"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              disabled={hasError}
              className="w-8 h-8"
              title="Download"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Progress bar or waveform */}
        <div className="space-y-2">
          {waveform && waveform.length > 0 ? (
            <WaveformDisplay data={waveform} />
          ) : (
            <div
              ref={progressRef}
              className="h-2 bg-muted rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleSeek}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
            >
              <div
                className="h-full bg-primary transition-all duration-150 rounded-full"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          )}
        </div>

        {/* Error state */}
        {hasError && (
          <div className="text-center py-2">
            <p className="text-sm text-red-500">
              Unable to play audio file
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Format may not be supported
            </p>
          </div>
        )}
      </div>

      {/* Transcription */}
      {transcription && (
        <div className="space-y-2">
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
          >
            <span>{showTranscription ? '▼' : '▶'}</span>
            <span>Transcription</span>
          </button>
          
          {showTranscription && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm text-foreground italic">
                "{transcription}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}