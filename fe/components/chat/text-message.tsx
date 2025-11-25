"use client";

import React from "react";
import { TextMessageProps } from "@/types/chat";

/**
 * TextMessage - Rich text display with link detection and language support
 * 
 * This component handles text message rendering with:
 * - URL detection and clickable links
 * - Japanese text support with proper line-height
 * - Text selection preservation  
 * - Responsive font sizing
 * - Proper word wrapping
 * - Preserve whitespace and line breaks
 */

export function TextMessage({
  content,
  lang,
  isMarkdown = false
}: TextMessageProps): React.JSX.Element {
  
  // URL regex pattern for link detection
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Process text to make URLs clickable
  const processTextContent = (text: string) => {
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // Check if this part matches a URL
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:opacity-80 underline underline-offset-2 transition-opacity duration-200 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      
      // Regular text - preserve line breaks and whitespace
      return part.split('\n').map((line, lineIndex, lines) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  // Base classes for text styling
  const getTextClasses = () => {
    const baseClasses = "text-sm leading-relaxed whitespace-pre-wrap break-words";
    
    // Japanese text styling
    if (lang === 'JP') {
      return `${baseClasses} jp-text font-normal leading-loose`;
    }
    
    // English text styling  
    return `${baseClasses} font-medium`;
  };

  // Handle markdown rendering if enabled (future enhancement)
  if (isMarkdown) {
    // TODO: Add markdown processing library if needed
    // For now, just render as regular text
    console.warn('Markdown rendering not implemented yet');
  }

  return (
    <div 
      className={getTextClasses()}
      style={{
        // Ensure proper word spacing for different languages
        wordSpacing: lang === 'JP' ? '0.1em' : 'normal',
        // Better line height for Japanese characters
        lineHeight: lang === 'JP' ? '1.8' : '1.6'
      }}
    >
      {processTextContent(content)}
    </div>
  );
}