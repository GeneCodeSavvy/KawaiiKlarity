"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { Upload, Camera, X, Image as ImageIcon, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MediaUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onCamera?: (imageData: string) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function MediaUpload({ 
  onFilesSelected,
  onCamera,
  maxFiles = 5,
  disabled = false 
}: MediaUploadProps) {
  const [showDropzone, setShowDropzone] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const webcamRef = useRef<Webcam>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
    setSelectedFiles(newFiles);
    onFilesSelected?.(newFiles);
  }, [selectedFiles, maxFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles: maxFiles,
    disabled
  });

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCamera?.(imageSrc);
      setShowCamera(false);
    }
  }, [onCamera]);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected?.(newFiles);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    onFilesSelected?.([]);
    setShowDropzone(false);
  };

  // Camera component
  if (showCamera) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Take Photo</CardTitle>
            <button
              onClick={() => setShowCamera(false)}
              className="w-8 h-8 bg-[#2A2A2A] hover:opacity-80 rounded-full flex items-center justify-center transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-900">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowCamera(false)}
              className="px-4 py-2 bg-[#2A2A2A] hover:opacity-80 rounded-lg text-white transition-opacity"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="px-4 py-2 bg-[#2A2A2A] hover:opacity-80 rounded-lg text-white transition-opacity flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture</span>
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dropzone component
  if (showDropzone) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Upload Images</CardTitle>
            <button
              onClick={() => setShowDropzone(false)}
              className="w-8 h-8 bg-[#2A2A2A] hover:opacity-80 rounded-full flex items-center justify-center transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-gray-500 bg-gray-100 dark:border-gray-400 dark:bg-gray-800' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? "Drop images here" : "Upload Images"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to select (max {maxFiles} files)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP, HEIC supported
                </p>
              </div>
            </div>
          </div>

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">
                  Selected Images ({selectedFiles.length}/{maxFiles})
                </h4>
                <button
                  onClick={clearAll}
                  className="px-3 py-1 bg-[#2A2A2A] hover:opacity-80 rounded-lg text-white text-sm transition-opacity"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedFiles.map((file, index) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2A2A2A] text-white hover:opacity-80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded truncate">
                          {file.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setShowCamera(true)}
              className="px-4 py-2 bg-[#2A2A2A] hover:opacity-80 rounded-lg text-white transition-opacity flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>
            
            {selectedFiles.length > 0 && (
              <button
                onClick={() => setShowDropzone(false)}
                className="px-4 py-2 bg-[#2A2A2A] hover:opacity-80 rounded-lg text-white transition-opacity flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Done ({selectedFiles.length})</span>
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial buttons
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => setShowDropzone(true)}
        disabled={disabled}
        className="w-10 h-10 bg-[#2A2A2A] hover:opacity-80 rounded-full flex items-center justify-center transition-opacity disabled:opacity-50"
        title="Upload images"
      >
        <Upload className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={() => setShowCamera(true)}
        disabled={disabled}
        className="w-10 h-10 bg-[#2A2A2A] hover:opacity-80 rounded-full flex items-center justify-center transition-opacity disabled:opacity-50"
        title="Take photo"
      >
        <Camera className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}