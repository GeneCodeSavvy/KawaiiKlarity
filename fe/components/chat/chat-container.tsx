"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatContainerProps, Message, MessageType, MessageStatus } from "@/types/chat";

/**
 * ChatContainer - Main layout wrapper and state orchestrator for the chat interface
 * 
 * Key Features:
 * - Full viewport height layout (h-screen)
 * - Global chat state management
 * - Keyboard shortcuts (Escape to clear, Enter to send)
 * - Responsive layout adjustments for mobile/desktop
 * - Theme-aware styling with CSS variables
 * - Auto-save to sessionStorage every 30 seconds
 */

export function ChatContainer({ 
  initialMessages = [], 
  onNewMessage 
}: ChatContainerProps): React.JSX.Element {
  // State management
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  
  // Refs for auto-save and DOM manipulation
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chat-messages');
    if (savedMessages && initialMessages.length === 0) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load messages from storage:', error);
      }
    }
  }, [initialMessages.length]);

  // Helper function to generate Marin-chan responses (placeholder for AI integration)
  const generateMarinResponse = useCallback((userMessage: string): string => {
    const responses = [
      "Ara ara! That's such a cute question! ✨ Let me think about the perfect outfit for you~",
      "Kawaii desu ne! 💕 I have some amazing style ideas that would look absolutely adorable on you!",
      "Ohh, fashion time! This is so exciting! Let me suggest something super stylish for you~",
      "Sugoi! You have great taste in asking me! Here's what I'm thinking for your kawaii look...",
      "Kyaa! Fashion advice time! 🌸 I know just the perfect combination that'll make you shine!",
      "Moe moe kyun! Let me help you create the most adorable outfit ever! ✨",
    ];
    
    // Simple keyword-based responses (in real implementation, this would be AI-powered)
    if (userMessage.toLowerCase().includes('weather') || userMessage.toLowerCase().includes('rain')) {
      return "Looking at the weather today, I'd recommend something cozy yet stylish! Maybe a cute jacket with some trendy boots? 🌧️✨";
    }
    
    if (userMessage.toLowerCase().includes('date') || userMessage.toLowerCase().includes('special')) {
      return "Ooh, a special occasion! How exciting! 💕 Let's pick something that makes you feel absolutely gorgeous~";
    }
    
    if (userMessage.toLowerCase().includes('casual') || userMessage.toLowerCase().includes('everyday')) {
      return "Casual kawaii style is my favorite! Let's create a comfortable yet super cute everyday look! 🌸";
    }
    
    // Random response for general questions
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  // Auto-save messages to sessionStorage
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    autoSaveRef.current = setTimeout(() => {
      if (messages.length > 0) {
        sessionStorage.setItem('chat-messages', JSON.stringify(messages));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }
    };
  }, [messages]);

  // Send message function with optimistic updates
  const sendMessage = useCallback(async (content: string, type: MessageType = MessageType.TEXT) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type,
      status: MessageStatus.SENDING
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    setIsLoading(true);
    setError(null);

    // Notify parent component
    onNewMessage?.(newMessage);

    try {
      // Update status to sent (in real implementation, this would be an API call)
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: MessageStatus.SENT }
              : msg
          )
        );

        // Simulate Marin-chan response after a delay
        setTimeout(() => {
          const response: Message = {
            id: crypto.randomUUID(),
            content: generateMarinResponse(content),
            sender: 'marin',
            timestamp: new Date(),
            type: MessageType.TEXT,
            status: MessageStatus.DELIVERED,
            lang: 'JP' // Marin-chan responds in Japanese style
          };

          setMessages(prev => [...prev, response]);
          onNewMessage?.(response);
        }, 1500 + Math.random() * 1000); // Random delay for realistic feel

      }, 500);

    } catch (error) {
      // Handle error by updating message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: MessageStatus.ERROR }
            : msg
        )
      );
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onNewMessage, generateMarinResponse]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem('chat-messages');
    setError(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to clear
      if (event.key === 'Escape' && (event.ctrlKey || event.metaKey)) {
        clearHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearHistory]);

  // Handle input submission
  const handleSendMessage = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  // Handle Enter key in input
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header - Placeholder */}
      <header className="flex-shrink-0 p-4 border-b border-border backdrop-blur-sm bg-background/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
              <span className="text-white font-medium text-sm">M</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Marin-chan
              </h1>
              <p className="text-sm text-muted-foreground">
                Fashion Assistant
              </p>
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <button
            onClick={clearHistory}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Clear chat history (Ctrl+Esc)"
          >
            Clear
          </button>
        </div>
      </header>
      
      {/* Message List - Placeholder */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          // Empty state
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-6xl">👘</div>
              <h2 className="text-xl font-medium text-foreground">
                Konnichiwa! I'm Marin-chan ✨
              </h2>
              <p className="text-muted-foreground">
                Your kawaii fashion assistant! Share your style questions, upload outfit photos, 
                or tell me about the weather for personalized recommendations.
              </p>
              <p className="text-sm text-muted-foreground">
                Try saying: "What should I wear today?" or "Help me choose an outfit!"
              </p>
            </div>
          </div>
        ) : (
          // Messages display
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className={message.lang === 'JP' ? 'jp-text' : ''}>
                  {message.content}
                </div>
                
                {/* Message status */}
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  {message.status && message.sender === 'user' && (
                    <div className="text-xs opacity-70">
                      {message.status === MessageStatus.SENDING && '⏳'}
                      {message.status === MessageStatus.SENT && '✓'}
                      {message.status === MessageStatus.ERROR && '❌'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator when loading */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Chat Input - Basic Implementation */}
      <footer className="flex-shrink-0 p-4 border-t border-border bg-background">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}