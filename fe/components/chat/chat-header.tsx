"use client";

import React, { useState } from "react";
import { ArrowLeft, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeaderProps } from "@/types/chat";

/**
 * ChatHeader - Header with title, status, and controls
 * 
 * This component provides the chat interface header with:
 * - Avatar display (Marin-chan character)
 * - Status indicator (online, typing, processing) 
 * - Clear history button with confirmation
 * - Back button for navigation (mobile)
 * - Error display area
 * - Responsive layout
 * - Animation states for status changes
 */

export function ChatHeader({
  onClearHistory,
  showBackButton = false,
  weatherData
}: ChatHeaderProps): React.JSX.Element {
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle clear history with confirmation
  const handleClearClick = () => {
    if (showClearConfirm) {
      onClearHistory?.();
      setShowClearConfirm(false);
      setError(null);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowClearConfirm(false), 5000);
    }
  };

  const handleCancelClear = () => {
    setShowClearConfirm(false);
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (error) {
      return (
        <div className="flex items-center space-x-1 text-red-500">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Error</span>
        </div>
      );
    }
    
    if (isTyping) {
      return (
        <div className="flex items-center space-x-2 text-blue-500">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
          </div>
          <span className="text-xs font-medium">typing...</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 text-green-500">
        <CheckCircle2 className="w-3 h-3" />
        <span className="text-xs">online</span>
      </div>
    );
  };

  // Weather display component
  const WeatherDisplay = () => {
    if (!weatherData) return null;
    
    const weatherEmoji = {
      'sunny': '☀️',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '🌨️',
      'stormy': '⛈️'
    }[weatherData.condition.toLowerCase()] || '🌤️';

    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <span className="text-sm">{weatherEmoji}</span>
        <span className="text-xs hidden sm:inline">
          {Math.round(weatherData.temperature)}°C
        </span>
      </div>
    );
  };

  return (
    <header className="flex-shrink-0 border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Back button and character info */}
        <div className="flex items-center space-x-3">
          {/* Back button (mobile) */}
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden w-8 h-8"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Marin-chan avatar and info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center shadow-sm transition-shadow hover:shadow-md">
                <span className="text-white font-medium text-sm">M</span>
              </div>
              {/* Status dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full animate-pulse" />
            </div>
            
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">
                Marin-chan
              </h1>
              <div className="flex items-center space-x-2">
                <StatusIndicator />
                <WeatherDisplay />
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions and error display */}
        <div className="flex items-center space-x-2">
          {/* Error display */}
          {error && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium max-w-40 truncate">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 ml-1"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Clear history button */}
          {showClearConfirm ? (
            <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1 rounded-md border border-yellow-200 dark:border-yellow-800">
              <span className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                Clear all?
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleClearClick}
                  className="text-xs px-2 py-0.5 h-auto text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  Yes
                </Button>
                <Button
                  variant="outline" 
                  size="default"
                  onClick={handleCancelClear}
                  className="text-xs px-2 py-0.5 h-auto text-gray-600 hover:text-gray-700"
                >
                  No
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearClick}
              className="text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors w-8 h-8"
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="px-4 pb-2 text-xs text-muted-foreground hidden sm:block">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Esc</kbd> to clear chat
      </div>
    </header>
  );
}