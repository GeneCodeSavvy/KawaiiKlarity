// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model = 'gpt-4o',
    webSearch = false,
  }: { 
    messages: any[]; 
    model?: string; 
    webSearch?: boolean;
  } = await req.json();

  // Get the last message content
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.text || lastMessage?.content || '';

  // For now, return a mock response until we integrate with actual AI providers
  // TODO: Replace with actual AI service integration
  return new Response(
    JSON.stringify({
      role: 'assistant',
      content: generateMarinResponse(userMessage, model, webSearch),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // Uncomment this when you have AI provider setup:
  // import { streamText, convertToModelMessages } from 'ai';
  // const result = streamText({
  //   model: webSearch ? 'perplexity/sonar' : model,
  //   messages: convertToModelMessages(messages),
  //   system: `You are Marin-chan, a kawaii fashion assistant!...`,
  // });
  // return result.toUIMessageStreamResponse({
  //   sendSources: true,
  //   sendReasoning: true,
  // });
}

// Temporary response generator (replace with actual AI)
function generateMarinResponse(userMessage: string, _model?: string, _webSearch?: boolean): string {
  const responses = [
    "Ara ara! That's such a cute question! ✨ Let me think about the perfect outfit for you~",
    "Kawaii desu ne! 💕 I have some amazing style ideas that would look absolutely adorable on you!",
    "Ohh, fashion time! This is so exciting! Let me suggest something super stylish for you~",
    "Sugoi! You have great taste in asking me! Here's what I'm thinking for your kawaii look...",
    "Kyaa! Fashion advice time! 🌸 I know just the perfect combination that'll make you shine!",
    "Moe moe kyun! Let me help you create the most adorable outfit ever! ✨",
  ];
  
  // Simple keyword-based responses
  if (userMessage.toLowerCase().includes('weather') || userMessage.toLowerCase().includes('rain')) {
    return "Looking at the weather today, I'd recommend something cozy yet stylish! Maybe a cute jacket with some trendy boots? 🌧️✨";
  }
  
  if (userMessage.toLowerCase().includes('date') || userMessage.toLowerCase().includes('special')) {
    return "Ooh, a special occasion! How exciting! 💕 Let's pick something that makes you feel absolutely gorgeous~";
  }
  
  if (userMessage.toLowerCase().includes('casual') || userMessage.toLowerCase().includes('everyday')) {
    return "Casual kawaii style is my favorite! Let's create a comfortable yet super cute everyday look! 🌸";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}