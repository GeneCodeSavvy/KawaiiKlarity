import { Message, MessageType, MessageStatus } from '@/types/chat';

export interface WebSocketMockOptions {
  onMessage: (message: Message) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Mock WebSocket implementation for bot replies
 * 
 * In production, replace this with actual WebSocket connection to your backend
 * This simulates the bot response patterns you'd expect from a real AI service
 */
export class WebSocketMock {
  private options: WebSocketMockOptions;
  private isConnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(options: WebSocketMockOptions) {
    this.options = options;
    this.connect();
  }

  private connect() {
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true;
      this.options.onConnect?.();
      console.log('🔌 Mock WebSocket connected');
    }, 500);
  }

  // Simulate bot reply based on user message
  public sendMessage(userMessage: string, messageType: MessageType = MessageType.TEXT) {
    if (!this.isConnected) {
      this.options.onError?.('WebSocket not connected');
      return;
    }

    // Simulate processing delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds

    setTimeout(() => {
      const botReply = this.generateBotReply(userMessage, messageType);
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: botReply,
        sender: 'marin',
        timestamp: new Date(),
        type: MessageType.TEXT,
        status: MessageStatus.DELIVERED,
      };

      this.options.onMessage(botMessage);
    }, delay);
  }

  private generateBotReply(userMessage: string, messageType: MessageType): string {
    // Generate contextual responses based on message type and content
    if (messageType === MessageType.VOICE) {
      const voiceResponses = [
        `I heard you say: "${userMessage}". How can I help you with that?`,
        `Thanks for the voice message! You said: "${userMessage}". What would you like to know?`,
        `Got your audio message: "${userMessage}". How can I assist you further?`,
        `Voice message received: "${userMessage}". I'm here to help!`,
      ];
      return voiceResponses[Math.floor(Math.random() * voiceResponses.length)];
    }

    // Text message responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Marin, your AI assistant. How can I help you today?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help! You can send me text messages or record voice messages. What do you need assistance with?";
    }
    
    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      return "Great! The chat system is working perfectly. Both text and voice messages are functioning as expected.";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to know?";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! It was nice chatting with you. Feel free to come back anytime!";
    }
    
    // Default responses
    const defaultResponses = [
      `That's interesting! You mentioned: "${userMessage}". Tell me more about that.`,
      `I understand you're talking about: "${userMessage}". How can I help you with this?`,
      `Thanks for sharing: "${userMessage}". What would you like to explore next?`,
      `I see you said: "${userMessage}". Is there something specific you'd like to know?`,
      `Regarding "${userMessage}" - I'm here to help! What questions do you have?`,
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Simulate connection issues (for testing error handling)
  public simulateError() {
    if (this.isConnected) {
      this.isConnected = false;
      this.options.onError?.('Connection lost');
      this.options.onDisconnect?.();
      
      // Auto-reconnect after 3 seconds
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, 3000);
    }
  }

  public disconnect() {
    this.isConnected = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.options.onDisconnect?.();
    console.log('🔌 Mock WebSocket disconnected');
  }
}