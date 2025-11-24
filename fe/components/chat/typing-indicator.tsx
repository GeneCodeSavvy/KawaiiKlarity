"use client";

import React from "react";
import { TypingIndicatorProps } from "@/types/chat";

/**
 * TypingIndicator - Animated loading indicator for AI responses
 * 
 * This component provides a typing animation to show when the AI is responding:
 * - Smooth dot animation (3 bouncing dots)
 * - Proper timing and easing
 * - Consistent with message bubble styling
 * - Performance optimized animations
 * - Configurable text and timing
 */

export function TypingIndicator({
  isVisible,
  message = "Marin-chan is typing",
  lang = 'EN'
}: TypingIndicatorProps): React.JSX.Element | null {
  
  if (!isVisible) return null;

  return (
    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-start space-x-3">
        {/* Marin-chan avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-medium text-sm">M</span>
        </div>
        
        {/* Typing bubble */}
        <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-lg border border-border/50 shadow-sm">
          <div className="flex items-center space-x-2">
            {/* Animated dots */}
            <div className="flex items-center space-x-1">
              <div 
                className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"
                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
              />
              <div 
                className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"
                style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
              />
              <div 
                className="w-2 h-2 bg-current rounded-full animate-bounce opacity-70"
                style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
              />
            </div>
            
            {/* Optional typing message */}
            {message && (
              <span className={`text-sm text-muted-foreground ml-2 ${lang === 'JP' ? 'jp-text' : ''}`}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}