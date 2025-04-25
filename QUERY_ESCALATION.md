# Query Escalation System Documentation

## Overview

The Query Escalation System is designed to seamlessly transition complex student questions from AI assistance to human lecturers when the AI determines it cannot provide an adequate response. This feature ensures students receive expert guidance for advanced or specialized questions while maintaining a smooth user experience.

## How It Works

1. **AI Response Analysis**: When a student asks a question, the AI analyzes its complexity and domain.
2. **Escalation Detection**: If the AI determines the question is too complex or specialized, it includes a specific escalation trigger phrase in its response.
3. **Subject Analysis**: The system analyzes the question to determine its subject area, complexity level, and key technical terms.
4. **Lecturer Matching**: The system finds the most suitable lecturer based on subject expertise and course teaching history.
5. **Chat Room Creation**: A direct chat room is created between the student and the selected lecturer.
6. **Notifications**: Both the student and lecturer receive notifications about the escalation.
7. **Conversation Continuity**: The lecturer can view the original question and AI response for context before providing their expert answer.

## Technical Implementation

### Components

1. **Enhanced AI Helper (`aiEscalation.js`)**
   - Detects when a query should be escalated
   - Analyzes query subject and complexity
   - Finds suitable lecturers based on expertise

2. **Socket Controller (`socket.controller.js`)**
   - Processes student messages
   - Handles AI responses
   - Manages escalation workflow

3. **Chat Controller (`chat.controller.js`)**
   - Manages chat rooms and messages
   - Provides endpoints for viewing and responding to escalated queries

4. **Socket.IO Integration (`socket.js`)**
   - Handles real-time communication
   - Manages authentication for socket connections
   - Routes messages between students and lecturers

### Escalation Flow

```
Student Question → AI Analysis → Escalation Detection → Subject Analysis → 
Lecturer Matching → Chat Room Creation → Notifications → Human Response
```

### Key Functions

- `askAIWithEscalation()`: Enhanced version of askAI that detects escalation triggers
- `analyzeQuery()`: Determines subject, complexity, and keywords from a question
- `findSuitableLecturer()`: Matches the question with the most appropriate lecturer
- `handleQueryEscalation()`: Orchestrates the entire escalation process
- `getOrCreateChatRoom()`: Manages the chat room between student and lecturer

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chats` | GET | Get all chat rooms for the authenticated user |
| `/api/chats/escalated` | GET | Get all escalated chats (Lecturer only) |
| `/api/chats/:chatRoomId/messages` | GET | Get all messages in a chat room |
| `/api/chats/:chatRoomId/messages` | POST | Send a message in a chat room |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `student-message` | Client → Server | Student sends a message to AI |
| `ai-response` | Server → Client | AI responds to student message |
| `query-escalated` | Server → Client | Notification that a query has been escalated |
| `new-escalated-chat` | Server → Client | Notification to lecturer about new escalated chat |

## Usage Example

### Student Flow

1. Student asks a complex question through the chat interface
2. AI responds with "This is a great question, but it's a bit advanced. I'll escalate this to a qualified lecturer for a detailed response."
3. Student receives notification that their question has been escalated
4. Student can view the lecturer's response in the chat section

### Lecturer Flow

1. Lecturer receives notification about a new escalated question
2. Lecturer can view the original question, AI response, and subject analysis
3. Lecturer responds to the student through the chat interface
4. Once the lecturer responds, the chat is marked as resolved

## Benefits

1. **Seamless Experience**: Students receive continuous support without needing to switch contexts
2. **Expert Guidance**: Complex questions are handled by subject matter experts
3. **Efficient Matching**: Questions are routed to the most qualified lecturers
4. **Context Preservation**: Lecturers see the full context of the question and AI response
5. **Analytics Integration**: Escalation patterns can be analyzed to improve AI capabilities