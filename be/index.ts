// CORS headers helper
function getCORSHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
    };
}

// Mock AI response generator (replace with actual AI service)
function generateAIResponse(_messages: ChatMessage[]): ChatResponse {
    const responses = [
        "That's a really interesting point! Let me think about that for a moment...",
        "I understand what you're asking. Here's my perspective on that:",
        "Great question! Based on what you've shared, I think...",
        "That reminds me of something important we should consider:",
        "Let me help you with that! Here's what I would suggest:",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)] as string;
    return {
        role: "assistant",
        content: randomResponse,
    };
}

// Mock transcription service (replace with actual service like OpenAI Whisper)
async function transcribeAudio(_audioFile: File): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const mockTranscriptions = [
        "Hello, this is a test transcription of the audio file.",
        "Can you hear me clearly? I'm testing the audio transcription feature.",
        "This is another example of what a transcribed audio message might look like.",
        "The weather is really nice today, don't you think?",
        "I'm excited to try out this new chat application with voice features.",
    ];

    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)] as string;
}

// Validate audio file
function validateAudioFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["audio/webm", "audio/mp4", "audio/wav", "audio/mpeg"];

    if (file.size > maxSize) {
        return { valid: false, error: "File size exceeds 5MB limit" };
    }

    if (!allowedTypes.includes(file.type)) {
        console.log(file.type);

        return { valid: false, error: `Unsupported audio format. Allowed: ${allowedTypes.join(", ")}` };
    }

    return { valid: true };
}

// Extract username from request (from query params, headers, etc.)
function extractUsername(req: Request): string {
    const url = new URL(req.url);
    const username = url.searchParams.get("username") ??
        req.headers.get("x-username") ??
        `User${Math.floor(Math.random() * 1000)}`;
    return username;
}

// Chat endpoint handler
async function handleChatRequest(req: Request): Promise<Response> {
    try {
        const body = await req.json() as ChatRequest;

        // Validate request
        if (!body.messages || !Array.isArray(body.messages)) {
            return new Response(
                JSON.stringify({ error: "Messages array is required" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", ...getCORSHeaders() }
                }
            );
        }

        // Generate AI response (replace with actual AI service)
        const response = generateAIResponse(body.messages);

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...getCORSHeaders() }
            }
        );
    } catch (error) {
        console.error("Chat endpoint error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...getCORSHeaders() }
            }
        );
    }
}

// Transcribe endpoint handler
async function handleTranscribeRequest(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url)
        const messageId = url.searchParams.get("messageId")
        const arrayBuffer = await req.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);


        if (!audioFile) {
            return new Response(
                JSON.stringify({
                    error: "No audio file provided",
                    success: false
                } as TranscribeResponse),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", ...getCORSHeaders() }
                }
            );
        }



        try {
            // Transcribe audio (replace with actual service)
            const transcription = await transcribeAudio(audioFile);

            return new Response(
                JSON.stringify({
                    transcription,
                    success: true
                } as TranscribeResponse),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json", ...getCORSHeaders() }
                }
            );
        } catch (transcriptionError) {
            console.error("Transcription error:", transcriptionError);
            return new Response(
                JSON.stringify({
                    error: "Service temporarily unavailable",
                    success: false
                } as TranscribeResponse),
                {
                    status: 503,
                    headers: { "Content-Type": "application/json", ...getCORSHeaders() }
                }
            );
        }
    } catch (error) {
        console.error("Transcribe endpoint error:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                success: false
            } as TranscribeResponse),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...getCORSHeaders() }
            }
        );
    }
}

// Handle preflight OPTIONS requests
function handleOptionsRequest(): Response {
    return new Response(null, {
        status: 200,
        headers: getCORSHeaders(),
    });
}

// Start the unified server
const server = Bun.serve({
    port: 3001,

    fetch(req: Request, server) {
        const url = new URL(req.url);
        const pathname = url.pathname;

        // Handle CORS preflight requests
        if (req.method === "OPTIONS") {
            return handleOptionsRequest();
        }

        // WebSocket upgrade for /chat route
        if (pathname === "/chat") {
            const username = extractUsername(req);
            const success = server.upgrade(req, {
                data: {
                    username,
                    joinedAt: Date.now(),
                    userId: crypto.randomUUID(),
                } as WebSocketData,
            });

            return success
                ? undefined
                : new Response("WebSocket upgrade failed", { status: 400 });
        }

        // REST API endpoints
        if (pathname === "/api/chat" && req.method === "POST") {
            return handleChatRequest(req);
        }

        if (pathname === "/api/transcribe" && req.method === "POST") {
            return handleTranscribeRequest(req);
        }

        // Health check endpoint
        if (pathname === "/health") {
            return new Response(
                JSON.stringify({ status: "healthy", timestamp: new Date().toISOString() }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json", ...getCORSHeaders() }
                }
            );
        }

        // Default 404 response
        return new Response("Not Found", {
            status: 404,
            headers: getCORSHeaders(),
        });
    },

    // WebSocket configuration
    websocket: {
        // Type the WebSocket data
        data: {} as WebSocketData,

        // Connection opened
        open(ws) {
            console.log(`${ws.data.username} connected to WebSocket`);

            // Subscribe to the main chat channel
            ws.subscribe("main-chat");

            // Announce user joined
            const joinMessage: WebSocketMessage = {
                type: "join",
                username: ws.data.username,
                content: `${ws.data.username} joined the chat`,
                timestamp: Date.now(),
            };

            server.publish("main-chat", JSON.stringify(joinMessage));

            // Send welcome message to the user
            const welcomeMessage: WebSocketMessage = {
                type: "chat",
                content: `Welcome to the chat, ${ws.data.username}!`,
                username: "System",
                timestamp: Date.now(),
            };

            ws.send(JSON.stringify(welcomeMessage));
        },

        // Message received
        message(ws, message) {
            try {
                const data = JSON.parse(message.toString()) as WebSocketMessage;

                console.log(`Message from ${ws.data.username}:`, data);

                // Create chat message to broadcast
                const chatMessage: WebSocketMessage = {
                    type: "chat",
                    content: data.content,
                    username: ws.data.username,
                    timestamp: Date.now(),
                };

                // Broadcast to all subscribers (excluding sender)
                server.publish("main-chat", JSON.stringify(chatMessage));

            } catch (error) {
                console.error("Error parsing WebSocket message:", error);

                const errorMessage: WebSocketMessage = {
                    type: "chat",
                    content: "Error: Invalid message format",
                    username: "System",
                    timestamp: Date.now(),
                };

                ws.send(JSON.stringify(errorMessage));
            }
        },

        // Connection closed
        close(ws, code, reason) {
            console.log(`${ws.data.username} disconnected (${code}: ${reason})`);

            // Unsubscribe from chat
            ws.unsubscribe("main-chat");

            // Announce user left
            const leaveMessage: WebSocketMessage = {
                type: "leave",
                username: ws.data.username,
                content: `${ws.data.username} left the chat`,
                timestamp: Date.now(),
            };

            server.publish("main-chat", JSON.stringify(leaveMessage));
        },



        // WebSocket configuration
        idleTimeout: 120, // 2 minutes
        maxPayloadLength: 1024 * 1024, // 1MB
        perMessageDeflate: true, // Enable compression
    },
});

console.log(`🚀 Server running on http://localhost:${server.port}`);
console.log(`📡 WebSocket available at ws://localhost:${server.port}/chat`);
console.log(`🔥 API endpoints:`);
console.log(`   POST http://localhost:${server.port}/api/chat`);
console.log(`   POST http://localhost:${server.port}/api/transcribe`);
console.log(`   GET  http://localhost:${server.port}/health`);
