"use client";

import type React from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import Navbar from "@/components/navbar";

/**
 * Main chat page route (/chat)
 * 
 * This is the primary interface for the KawaiiKlarity chat system,
 * featuring multi-modal communication (text, voice, images) with Marin-chan,
 * the AI fashion assistant.
 * 
 * Features:
 * - Real-time chat interface
 * - Voice recording and playback
 * - Image upload and recognition
 * - Weather-aware fashion recommendations
 * - Multi-language support (Japanese/English)
 */
export default function ChatPage(): React.JSX.Element {
  return (
    <main className="h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1">
        <ChatContainer />
      </div>
    </main>
  );
}