# API Endpoints Documentation

This document outlines all the API endpoints that need to be implemented on your external server to maintain compatibility with the frontend after removing Next.js API routes.

## Overview

The frontend currently makes calls to two main API endpoints that need to be replicated on your external server. All endpoints should be hosted under your server's base URL (e.g., `https://your-server.com/api`).

## Endpoints Required

### 1. Chat Endpoint
**Endpoint:** `POST /api/chat`
**Purpose:** Handle text chat messages and return AI responses
**Usage:** Called from `chat-container-new.tsx:165`

#### Request Format:
```json
{
  "messages": [
    {
      "text": "user message content",
      "role": "user"
    }
  ],
  "model": "gpt-4o",
  "webSearch": false
}
```

#### Request Headers:
```
Content-Type: application/json
```

#### Response Format:
```json
{
  "role": "assistant", 
  "content": "AI response message here"
}
```

#### Response Headers:
```
Content-Type: application/json
```

#### Notes:
- The `maxDuration` was set to 30 seconds in the original route
- Currently returns mock responses with kawaii/anime character personality
- Should integrate with actual AI service (GPT-4, Claude, etc.)
- The `webSearch` parameter can be used for different AI models (e.g., Perplexity)

---

### 2. Transcription Endpoint
**Endpoint:** `POST /api/transcribe`
**Purpose:** Convert audio files to text transcriptions
**Usage:** Called from `chat-container-new.tsx:97` and `chat-transcription.tsx:101`

#### Request Format:
- Content-Type: `multipart/form-data`
- Form fields:
  - `audio`: Audio file (File object)
  - `messageId`: String UUID for tracking

#### Supported Audio Formats:
- `audio/webm`
- `audio/mp4` 
- `audio/wav`
- `audio/mpeg`

#### File Size Limit:
- Maximum: 5MB

#### Response Format (Success):
```json
{
  "transcription": "transcribed text here",
  "success": true
}
```

#### Response Format (Error):
```json
{
  "error": "error message",
  "success": false
}
```

#### Response Codes:
- `200`: Success
- `400`: Bad request (missing file, unsupported format, file too large)
- `503`: Service temporarily unavailable  
- `500`: Internal server error

#### Error Scenarios:
- No audio file provided
- Unsupported audio format
- File size exceeds 5MB limit
- Transcription service failure
- Internal server errors

#### Notes:
- Currently returns mock transcriptions
- Should integrate with speech-to-text service (OpenAI Whisper, Google Speech-to-Text, Azure, etc.)
- Simulates processing delay of 1-3 seconds
- Has 5% chance of simulated errors for testing

---

## Additional Endpoints (Future/Optional)

The `lib/api.ts` file defines additional endpoints that may be needed if you expand the application:

### Voice Upload Endpoint
**Endpoint:** `POST /api/voice/upload`
**Purpose:** Complete voice message processing (transcription + AI response)

### Image Upload Endpoint  
**Endpoint:** `POST /api/image/upload`
**Purpose:** Image recognition for clothing/fashion analysis

### Weather Endpoint
**Endpoint:** `GET /api/weather?lat={lat}&lon={lon}`
**Purpose:** Weather data for fashion recommendations

---

## Frontend Configuration

After implementing these endpoints on your server, update the frontend to point to your server by setting:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-server.com
```

If this environment variable is not set, it defaults to `http://localhost:3001/api`.

---

## Implementation Notes

1. **Error Handling**: The frontend expects consistent error response formats
2. **CORS**: Ensure your server allows requests from your frontend domain
3. **File Uploads**: Handle multipart form data properly for the transcribe endpoint
4. **Response Times**: Chat endpoint allows up to 30 seconds for responses
5. **Authentication**: Currently no authentication is required, but may be added later

---

## Migration Steps

1. Implement the above endpoints on your external server
2. Test endpoints with the expected request/response formats
3. Set `NEXT_PUBLIC_API_BASE_URL` environment variable
4. Remove the Next.js API route files
5. Update any hardcoded `/api/` paths to use the environment variable

This documentation should provide everything needed to replicate the current API functionality on your external server.