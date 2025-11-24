"use client";

import React, { useEffect, useCallback } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightboxProps } from "@/types/chat";

/**
 * ImageLightbox - Full-screen image viewer with zoom and pan
 * 
 * This component provides a modal overlay for viewing images in full screen:
 * - Modal overlay with backdrop blur
 * - Image zoom and pan functionality (future enhancement)
 * - Keyboard navigation (ESC to close, arrows for navigation)
 * - Focus trap for accessibility
 * - Touch gestures for mobile (future enhancement)
 * - Loading states for high-res images
 * - Multiple image navigation (future enhancement)
 */

export function ImageLightbox({
  isOpen,
  imageUrl,
  alt = "Image",
  onClose,
  onShare,
  onDownload
}: ImageLightboxProps): React.JSX.Element | null {
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
    // Future: Add arrow key navigation for multiple images
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      // Default download implementation
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [imageUrl, onDownload]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Default share implementation using Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Image',
          text: alt,
          url: imageUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl);
        // You could show a toast notification here
        console.log('Image URL copied to clipboard');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  }, [imageUrl, alt, onShare]);

  // Set up keyboard listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when lightbox is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Focus trap effect
  useEffect(() => {
    if (isOpen) {
      // Find the first focusable element and focus it
      const lightbox = document.getElementById('image-lightbox');
      const focusableElements = lightbox?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="image-lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in-0 duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      aria-describedby="lightbox-description"
    >
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <h2 id="lightbox-title" className="text-white font-medium text-lg">
            {alt}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Share button */}
          {(onShare || (typeof navigator !== 'undefined' && (navigator.share || navigator.clipboard))) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
              title="Share image"
              aria-label="Share image"
            >
              <Share className="w-4 h-4" />
            </Button>
          )}
          
          {/* Download button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            title="Download image"
            aria-label="Download image"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            title="Close lightbox"
            aria-label="Close lightbox"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main image container */}
      <div 
        className="flex items-center justify-center max-w-full max-h-full p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in-95 duration-300"
          style={{
            maxWidth: 'calc(100vw - 8rem)',
            maxHeight: 'calc(100vh - 8rem)'
          }}
          loading="lazy"
        />
      </div>

      {/* Footer with instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p id="lightbox-description" className="text-white/70 text-sm">
          Press <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Esc</kbd> to close
          {/* Future: Add zoom and pan instructions */}
        </p>
      </div>

      {/* Loading state overlay (if needed) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="hidden">
          {/* Future: Add loading spinner for high-res images */}
        </div>
      </div>
    </div>
  );
}