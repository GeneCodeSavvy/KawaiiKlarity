/**
 * TypeScript interfaces and enums for the KawaiiKlarity chat system
 * 
 * This file defines all the core data structures used throughout the chat interface,
 * including messages, sessions, context, and metadata for multi-modal communication.
 */

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
  SYSTEM = 'system'  // For status messages, errors, etc.
}

export enum MessageStatus {
  SENDING = 'sending',        // User message being sent
  SENT = 'sent',             // Successfully delivered
  PROCESSING = 'processing',  // AI processing (voice/image analysis)
  DELIVERED = 'delivered',    // AI response ready
  ERROR = 'error'            // Failed to send/process
}

export interface ClothingItem {
  name: string;              // Item name (e.g., "denim jacket")
  confidence: number;        // Recognition confidence (0-1)
  category: string;          // Clothing category
  color?: string;           // Detected primary color
  style?: string;           // Style attributes
}

export interface MessageMetadata {
  // Voice message data
  audioUrl?: string;                // Blob URL or server URL for audio
  audioDuration?: number;           // Duration in seconds
  audioTranscription?: string;      // Speech-to-text result
  audioWaveform?: number[];         // Waveform data for visualization
  audioBlob?: Blob;                 // Original audio blob for re-creating URLs if needed
  audioMimeType?: string;           // MIME type of the audio
  formatSupported?: boolean;        // Whether the browser can play this format
  
  // Image message data
  imageUrl?: string;                // Blob URL or server URL for image
  imageAlt?: string;                // Accessibility description
  imageWidth?: number;              // Original image dimensions
  imageHeight?: number;
  recognizedItems?: ClothingItem[]; // CLIP model results
  
  // Processing states
  isLoading?: boolean;              // Content being processed
  error?: string;                   // Error message if failed
  retryCount?: number;              // Number of retry attempts
}

export interface Message {
  id: string;                       // Unique identifier (UUID)
  content: string;                  // Primary message content
  sender: 'user' | 'marin';         // Message sender identification
  timestamp: Date;                  // Message creation time
  lang?: 'JP' | 'EN';              // Language hint for typography
  type: MessageType;                // Content type discriminator
  metadata?: MessageMetadata;       // Type-specific additional data
  status?: MessageStatus;           // Delivery/processing status
  deletedAt?: Date;                 // Timestamp when message was deleted
}

export interface WeatherForecast {
  date: Date;                       // Forecast date
  temperature: number;              // Predicted temperature
  condition: string;                // Weather condition
  precipitation?: number;           // Chance of precipitation (0-1)
}

export interface WeatherData {
  temperature: number;              // Current temperature in Celsius
  condition: string;                // Weather condition (sunny, rainy, etc.)
  humidity: number;                 // Humidity percentage
  windSpeed: number;                // Wind speed
  forecast: WeatherForecast[];      // Future weather predictions
}

export interface LocationData {
  city: string;                     // User's city
  country: string;                  // User's country
  coordinates?: {                   // Optional GPS coordinates
    latitude: number;
    longitude: number;
  };
}

export interface UserPreferences {
  preferredStyle?: string[];        // Fashion style preferences
  favoriteColors?: string[];        // Preferred color palette
  sizeInfo?: {                     // Size information
    tops?: string;
    bottoms?: string;
    shoes?: string;
  };
  budget?: {                       // Budget preferences
    min?: number;
    max?: number;
    currency?: string;
  };
  occasions?: string[];            // Occasions they dress for
}

export interface ChatContext {
  weather?: WeatherData;            // Current weather context
  location?: LocationData;          // User location for recommendations
  userPreferences?: UserPreferences; // Fashion preferences and style
  wardrobe?: ClothingItem[];        // User's uploaded clothing items
}

export interface ChatSession {
  id: string;                       // Session identifier
  messages: Message[];              // Ordered message history
  createdAt: Date;                  // Session start time
  lastActivity: Date;               // Last message timestamp
  context: ChatContext;             // Conversation context
}

// Component prop interfaces
export interface ChatContainerProps {
  initialMessages?: Message[];      // Pre-loaded message history
  onNewMessage?: (message: Message) => void; // Message event handler
}

export interface ChatHeaderProps {
  showBackButton?: boolean;         // Show navigation to landing page
  weatherData?: WeatherData;        // Current weather display
}

export interface MessageListProps {
  messages: Message[];              // Array of messages to display
  isLoading?: boolean;              // Show loading skeleton
  onLoadMore?: () => void;          // Infinite scroll callback
  autoScroll?: boolean;             // Auto-scroll to bottom
  onDeleteMessage?: (messageId: string) => void; // Delete message callback
}

export interface MessageBubbleProps {
  message: Message;                 // Complete message object
  showAvatar?: boolean;             // Display sender avatar
  showTimestamp?: boolean;          // Display message time
  isGrouped?: boolean;              // Part of grouped messages
  onDeleteMessage?: (messageId: string) => void; // Delete message callback
}

export interface TextMessageProps {
  content: string;                  // Message text content
  lang?: 'JP' | 'EN';              // Language for typography
  isMarkdown?: boolean;             // Enable markdown rendering
}

export interface VoiceMessageProps {
  audioUrl: string;                 // Audio file URL or Blob
  duration: number;                 // Audio duration in seconds
  transcription?: string;           // Speech-to-text result
  waveform?: number[];              // Waveform data array
  autoPlay?: boolean;               // Auto-play on render
}

export interface ImageMessageProps {
  imageUrl: string;                 // Image URL or Blob
  alt?: string;                     // Accessibility description
  recognizedItems?: ClothingItem[]; // CLIP model results
  isProcessing?: boolean;           // Show analysis loading state
  onLightboxOpen?: () => void;      // Lightbox callback
}

export interface ChatInputProps {
  onSendMessage: (message: Partial<Message>) => void;
  isLoading?: boolean;              // Disable input during processing
  placeholder?: string;             // Input placeholder text
  maxLength?: number;               // Text input character limit
}

export interface TypingIndicatorProps {
  isVisible: boolean;               // Show/hide indicator
  message?: string;                 // Custom typing message
  lang?: 'JP' | 'EN';              // Language for message text
}

export interface ImageLightboxProps {
  isOpen: boolean;                  // Lightbox visibility state
  imageUrl: string;                 // Image to display
  alt?: string;                     // Accessibility description
  onClose: () => void;              // Close callback
  onShare?: () => void;             // Share image callback
  onDownload?: () => void;          // Download image callback
}

// Hook return type interfaces
export interface UseChatMessagesReturn {
  messages: Message[];              // Current message array
  sendMessage: (message: Partial<Message>) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  clearHistory: () => void;         // Clear all messages
  isLoading: boolean;               // Any operation in progress
  error: string | null;            // Latest error message
}

export interface UseVoiceRecordingReturn {
  isRecording: boolean;             // Recording state
  recordedAudio: Blob | null;       // Recorded audio data
  transcription: string;            // Speech-to-text result
  audioLevel: number;               // Real-time audio level (0-1)
  error: string | null;            // Recording error
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;       // Reset recording state
}

export interface UseImageUploadReturn {
  selectedImages: File[];           // Selected image files
  uploadProgress: Record<string, number>; // Upload progress per file
  recognitionResults: Record<string, ClothingItem[]>; // CLIP results
  selectFromGallery: () => Promise<void>;
  selectFromCamera: () => Promise<void>;
  uploadImages: (files: File[]) => Promise<void>;
  clearSelection: () => void;       // Clear selected images
  error: string | null;            // Upload/processing error
}

export interface UseChatHistoryReturn {
  sessions: ChatSession[];          // Available chat sessions
  currentSession: ChatSession | null; // Active session
  saveSession: (session: ChatSession) => Promise<void>;
  loadSession: (sessionId: string) => Promise<ChatSession>;
  deleteSession: (sessionId: string) => Promise<void>;
  createNewSession: () => ChatSession;
  isLoading: boolean;               // History operations in progress
}

// Configuration interfaces
export interface RecordingOptions {
  maxDuration?: number;             // Maximum recording time in seconds
  sampleRate?: number;              // Audio sample rate
  channels?: number;                // Audio channels (1 or 2)
}

export interface UploadOptions {
  maxFileSize?: number;             // Maximum file size in bytes
  allowedTypes?: string[];          // Allowed MIME types
  compressionQuality?: number;      // Image compression quality (0-1)
}