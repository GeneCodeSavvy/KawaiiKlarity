interface ChatMessage {
  text: string;
  role: "user" | "assistant";
}

interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  webSearch: boolean;
}

interface ChatResponse {
  role: "assistant";
  content: string;
}

interface TranscribeResponse {
  transcription?: string;
  success: boolean;
  error?: string;
}

interface WebSocketData {
  username: string;
  joinedAt: number;
  userId: string;
}

interface WebSocketMessage {
  type: "chat" | "join" | "leave" | "user_list";
  content?: string;
  username?: string;
  timestamp?: number;
  users?: string[];
}
