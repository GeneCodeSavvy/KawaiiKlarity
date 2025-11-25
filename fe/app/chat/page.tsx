"use client";

import type React from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import CloudAnimated from "@/components/cloud-animated";
import WavyMesh from "@/components/wavy-mesh";

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
    <main className="relative w-full h-screen bg-background">
      {/* Layer 0: Gradient Background */}
      <AnimatedBackground />

      {/* Layer 10: Clouds */}
      <CloudAnimated />

      {/* Layer 20: Wavy Mesh */}
      <WavyMesh />

      {/* Layer 30: Content */}
      <div className="relative z-30 w-full h-full flex flex-col">
        <Navbar />
        <div className="flex-1 min-h-0">
          <ChatContainer />
        </div>
      </div>
    </main>
  );
}