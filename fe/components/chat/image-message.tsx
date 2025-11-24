"use client";

import React, { useState } from "react";
import { Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageMessageProps, ClothingItem } from "@/types/chat";

/**
 * ImageMessage - Image display with recognition results and lightbox
 * 
 * This component handles image message rendering with:
 * - Responsive image display with aspect ratio preservation
 * - Loading skeleton during image processing
 * - Error state for failed image loads
 * - Alt text support for accessibility
 * - Recognition results overlay with confidence scores
 * - Click handler for lightbox view
 * - Image optimization and lazy loading
 * - Hover effects for interactivity
 */

export function ImageMessage({
  imageUrl,
  alt = "Uploaded image",
  recognizedItems,
  isProcessing = false,
  onLightboxOpen
}: ImageMessageProps): React.JSX.Element {
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Handle lightbox click
  const handleLightboxClick = () => {
    if (!imageError && imageLoaded) {
      onLightboxOpen?.();
    }
  };

  // Get confidence score color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-500";
  };

  // Future enhancement: confidence score backgrounds
  // const getConfidenceBackground = (confidence: number) => { ... }

  // Category icons mapping
  const getCategoryIcon = (category: string) => {
    const icons = {
      'tops': '👕',
      'bottoms': '👖',
      'outerwear': '🧥',
      'accessories': '👜',
      'shoes': '👟',
      'dresses': '👗'
    };
    return icons[category.toLowerCase() as keyof typeof icons] || '👔';
  };

  // Recognition results component
  const RecognitionResults = ({ items }: { items: ClothingItem[] }) => (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded-b-lg">
      <div className="space-y-2">
        {items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCategoryIcon(item.category)}</span>
              <div>
                <div className="font-medium">{item.name}</div>
                {item.color && (
                  <div className="text-xs opacity-80">
                    {item.color} {item.style && `• ${item.style}`}
                  </div>
                )}
              </div>
            </div>
            <div className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
              {Math.round(item.confidence * 100)}%
            </div>
          </div>
        ))}
        
        {items.length > 3 && (
          <button
            onClick={() => setShowResults(true)}
            className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
          >
            +{items.length - 3} more items
          </button>
        )}
      </div>
    </div>
  );

  // Detailed results modal component
  const DetailedResults = ({ items }: { items: ClothingItem[] }) => (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Recognition Results</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowResults(false)}
          className="w-6 h-6 text-white border-white/30 hover:bg-white/10"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-white/10 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-white/70 text-sm capitalize">
                    {item.category}
                  </div>
                  {item.color && (
                    <div className="text-white/60 text-sm">
                      Color: {item.color}
                    </div>
                  )}
                  {item.style && (
                    <div className="text-white/60 text-sm">
                      Style: {item.style}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                  {Math.round(item.confidence * 100)}%
                </div>
                <div className="text-white/60 text-xs">confidence</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative group max-w-md">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="aspect-video w-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
        )}

        {/* Error state */}
        {imageError && (
          <div className="aspect-video w-full flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Failed to load image
              </p>
            </div>
          </div>
        )}

        {/* Actual image */}
        {!imageError && (
          <img
            src={imageUrl}
            alt={alt}
            className={`
              w-full h-auto max-h-96 object-cover transition-all duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${onLightboxOpen && imageLoaded ? 'cursor-pointer hover:scale-105' : ''}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            onClick={handleLightboxClick}
          />
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg px-4 py-2 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium text-foreground">
                Analyzing image...
              </span>
            </div>
          </div>
        )}

        {/* Lightbox button */}
        {onLightboxOpen && imageLoaded && !imageError && (
          <button
            onClick={handleLightboxClick}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Open in lightbox"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Recognition results overlay */}
        {recognizedItems && recognizedItems.length > 0 && imageLoaded && !imageError && (
          <>
            {showResults ? (
              <DetailedResults items={recognizedItems} />
            ) : (
              <RecognitionResults items={recognizedItems} />
            )}
          </>
        )}
      </div>

      {/* Image metadata */}
      <div className="mt-2 text-xs text-muted-foreground">
        {alt !== "Uploaded image" && alt}
        {recognizedItems && recognizedItems.length > 0 && (
          <span className="ml-2">• {recognizedItems.length} items detected</span>
        )}
      </div>
    </div>
  );
}