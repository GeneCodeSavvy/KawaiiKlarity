/**
 * API client functions for KawaiiKlarity backend integration
 * 
 * This file provides typed API functions for:
 * - Voice message upload and speech-to-text processing
 * - Image upload and clothing recognition (CLIP model)
 * - Error handling and retry logic for network failures
 * - Progress tracking for large file uploads
 * - Request cancellation support
 * - Authentication handling (if required in future)
 * 
 * Usage:
 * - Import specific functions from this module
 * - All functions return promises with typed responses
 * - Error responses include user-friendly messages
 * - Progress callbacks available for upload functions
 */

export interface VoiceUploadResponse {
  success: boolean;
  transcription: string;
  response: string;
  error?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  recognitionResults: Array<{
    name: string;
    confidence: number;
    category: string;
    color?: string;
    style?: string;
  }>;
  response: string;
  error?: string;
}

export interface WeatherResponse {
  success: boolean;
  data: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    location: {
      city: string;
      country: string;
    };
  };
  error?: string;
}

export interface ProgressCallback {
  (progress: number): void;
}

// API base URL (to be configured based on environment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Upload voice message and get transcription + AI response
 */
export async function uploadVoiceMessage(
  audioBlob: Blob,
  onProgress?: ProgressCallback
): Promise<VoiceUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject({
              success: false,
              transcription: '',
              response: '',
              error: 'Failed to parse server response'
            });
          }
        } else {
          reject({
            success: false,
            transcription: '',
            response: '',
            error: `Server error: ${xhr.status}`
          });
        }
      });

      xhr.addEventListener('error', () => {
        reject({
          success: false,
          transcription: '',
          response: '',
          error: 'Network error occurred'
        });
      });

      xhr.open('POST', `${API_BASE_URL}/voice/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    return {
      success: false,
      transcription: '',
      response: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Upload image and get clothing recognition results + AI response
 */
export async function uploadImageMessage(
  imageFile: File,
  onProgress?: ProgressCallback
): Promise<ImageUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject({
              success: false,
              recognitionResults: [],
              response: '',
              error: 'Failed to parse server response'
            });
          }
        } else {
          reject({
            success: false,
            recognitionResults: [],
            response: '',
            error: `Server error: ${xhr.status}`
          });
        }
      });

      xhr.addEventListener('error', () => {
        reject({
          success: false,
          recognitionResults: [],
          response: '',
          error: 'Network error occurred'
        });
      });

      xhr.open('POST', `${API_BASE_URL}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    return {
      success: false,
      recognitionResults: [],
      response: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Fetch current weather data for fashion recommendations
 */
export async function fetchWeatherData(
  latitude?: number,
  longitude?: number
): Promise<WeatherResponse> {
  try {
    const params = new URLSearchParams();
    if (latitude && longitude) {
      params.append('lat', latitude.toString());
      params.append('lon', longitude.toString());
    }

    const url = `${API_BASE_URL}/weather${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      data: {
        temperature: 20,
        condition: 'unknown',
        humidity: 50,
        windSpeed: 0,
        location: {
          city: 'Unknown',
          country: 'Unknown'
        }
      },
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    };
  }
}

/**
 * Generic retry wrapper for API calls with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: wait longer after each failed attempt
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Cancel ongoing requests (utility for AbortController usage)
 */
export function createCancellableRequest(): AbortController {
  return new AbortController();
}