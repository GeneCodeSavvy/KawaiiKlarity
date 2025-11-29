// Simple WebSocket test client
const ws = new WebSocket("ws://localhost:3001/chat?username=TestUser");

ws.addEventListener("open", () => {
  console.log("✅ Connected to WebSocket");
  
  // Send a test message
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "chat",
      content: "Hello from test client!",
    }));
  }, 1000);
});

ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  console.log("📨 Received:", message);
});

ws.addEventListener("close", (event) => {
  console.log("❌ Disconnected:", event.code, event.reason);
});

ws.addEventListener("error", (error) => {
  console.error("🚨 WebSocket error:", error);
});

// Keep the script running for a bit to receive messages
setTimeout(() => {
  console.log("🔄 Closing connection...");
  ws.close();
}, 5000);