# EduBridge API Documentation

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Educational Data Endpoints](#educational-data-endpoints)
4. [FAQ Endpoints](#faq-endpoints)
5. [Course Management Endpoints](#course-management-endpoints)
6. [Assignment Management Endpoints](#assignment-management-endpoints)
7. [Analytics Endpoints](#analytics-endpoints)
8. [Chat and Query Escalation Endpoints](#chat-and-query-escalation-endpoints)
9. [Socket.IO Events](#socketio-events)

## Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/register` | POST | Register a new user |
| `/api/student/otp-verification` | POST | Verify user with OTP |
| `/api/student/resend-otp` | POST | Resend verification OTP |
| `/api/student/login` | POST | User login |
| `/api/student/2FA-login` | POST | Complete login with 2FA |
| `/api/student/forgot-password` | POST | Request password reset OTP |
| `/api/student/verify-password-otp` | POST | Verify password reset OTP |
| `/api/student/reset-password` | POST | Reset password |
| `/api/student/set-passcode` | POST | Set a passcode for quick login |
| `/api/student/forgot-passcode` | POST | Request passcode reset OTP |
| `/api/student/verify-passcode-otp` | POST | Verify passcode reset OTP |
| `/api/student/reset-passcode` | POST | Reset passcode |

## User Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/edit-email` | PUT | Update user email |
| `/api/student/edit-username` | PUT | Update username |
| `/api/student/confirm-email-change` | POST | Confirm email change |
| `/api/student/deactivate-account` | PUT | Deactivate user account |
| `/api/student/delete-account` | DELETE | Delete user account |
| `/api/student/profile` | GET | Get user profile |
| `/api/student/upload-profile-picture` | POST | Upload profile picture |
| `/api/student/profile-picture` | GET | Get profile picture |
| `/api/student/deactivate-2FA` | POST | Deactivate two-factor authentication |
| `/api/student/all` | GET | Get all users (authenticated) |

## Educational Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/countries/fetchCountries` | GET | Fetch all countries |
| `/api/countries/all` | GET | Fetch all countries (alias) |
| `/api/universities/countries/:country` | GET | Get universities by country |
| `/api/student/specialties-and-departments` | GET | Get specialties and departments |

## FAQ Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/faqs` | POST | Create a new FAQ |
| `/api/student/faqs` | GET | Get all FAQs |
| `/api/student/faqs/:faqId` | PUT | Update an FAQ |
| `/api/student/faqs/:faqId` | DELETE | Delete an FAQ |

## Course Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | POST | Create a new course (Lecturer only) |
| `/api/courses` | GET | Get all courses (filtered by user role) |
| `/api/courses/:courseId` | GET | Get a single course by ID |
| `/api/courses/:courseId` | PUT | Update a course (Lecturer only) |
| `/api/courses/:courseId` | DELETE | Delete a course (Lecturer only) |
| `/api/courses/:courseId/materials` | POST | Add course material (Lecturer only) |
| `/api/courses/:courseId/enroll` | POST | Enroll in a course (Student only) |
| `/api/courses/:courseId/enroll` | DELETE | Unenroll from a course (Student only) |

### Course Creation Request

```json
{
  "title": "Introduction to Computer Science",
  "code": "CS101",
  "description": "An introductory course to computer science principles",
  "department": "Computer Science",
  "startDate": "2023-09-01T00:00:00.000Z",
  "endDate": "2023-12-15T00:00:00.000Z",
  "syllabus": "Weekly topics include: algorithms, data structures...",
  "enrollmentKey": "cs101key",
  "isEnrollmentOpen": true,
  "maxEnrollment": 100
}
```

### Course Material Upload Request

```
POST /api/courses/:courseId/materials
Content-Type: multipart/form-data

file: [File]
title: "Introduction to Algorithms"
description: "Lecture slides covering basic algorithm concepts"
```

### Course Enrollment Request

```json
{
  "enrollmentKey": "cs101key"
}
```

## Assignment Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses/:courseId/assignments` | POST | Create a new assignment (Lecturer only) |
| `/api/courses/:courseId/assignments` | GET | Get all assignments for a course |
| `/api/assignments/:assignmentId` | GET | Get a single assignment by ID |
| `/api/assignments/:assignmentId` | PUT | Update an assignment (Lecturer only) |
| `/api/assignments/:assignmentId` | DELETE | Delete an assignment (Lecturer only) |
| `/api/assignments/:assignmentId/submit` | POST | Submit an assignment (Student only) |
| `/api/assignments/:assignmentId/submissions` | GET | Get all submissions for an assignment (Lecturer only) |
| `/api/submissions/:submissionId/grade` | PUT | Grade a submission (Lecturer only) |

### Assignment Creation Request

```
POST /api/courses/:courseId/assignments
Content-Type: multipart/form-data

attachments: [File1, File2, ...]
title: "Midterm Project"
description: "Implement a sorting algorithm in your preferred language"
dueDate: "2023-10-15T23:59:59.000Z"
totalPoints: 100
submissionType: "BOTH"
allowLateSubmissions: true
lateSubmissionDeadline: "2023-10-20T23:59:59.000Z"
lateSubmissionPenalty: 10
status: "PUBLISHED"
```

### Assignment Submission Request

```
POST /api/assignments/:assignmentId/submit
Content-Type: multipart/form-data

attachments: [File1, File2, ...]
content: "Here is my implementation of the quicksort algorithm..."
```

### Submission Grading Request

```json
{
  "points": 85,
  "feedback": "Good implementation, but missing edge case handling."
}
```

## Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/student/:courseId` | GET | Get student analytics for a course |
| `/api/analytics/course/:courseId` | GET | Get course analytics (Lecturer only) |
| `/api/analytics/lecturer/dashboard` | GET | Get lecturer dashboard analytics (Lecturer only) |
| `/api/analytics/student/dashboard` | GET | Get student dashboard analytics (Student only) |
| `/api/analytics/student/activity` | POST | Update student activity analytics (Student only) |

### Student Activity Update Request

```json
{
  "courseId": "60d21b4667d0d8992e610c85",
  "timeSpent": 30,
  "resourcesAccessed": 2
}
```

## Chat and Query Escalation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chats` | GET | Get all chat rooms for the authenticated user |
| `/api/chats/escalated` | GET | Get all escalated chats (Lecturer only) |
| `/api/chats/:chatRoomId/messages` | GET | Get all messages in a chat room |
| `/api/chats/:chatRoomId/messages` | POST | Send a message in a chat room |

### Chat Message Request

```json
{
  "content": "This is my response to the student's question about algorithms."
}
```

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Client connects to socket server |
| `student-message` | Client → Server | Student sends a message to AI |
| `ai-response` | Server → Client | AI responds to student message |
| `query-escalated` | Server → Client | Notification that a query has been escalated to a lecturer |
| `join-room` | Client → Server | User joins a chat room |
| `send-message` | Client → Server | User sends a message in a chat room |
| `new-message` | Server → Client | New message notification |
| `new-escalated-chat` | Server → Client | Notification of escalated chat to lecturer |
| `user-joined` | Server → Client | Notification that a user has joined a chat room |
| `error` | Server → Client | Error notification |
| `disconnect` | Client → Server | Client disconnects from socket server |

### Socket Authentication

```javascript
// Connect to socket with authentication
const socket = io.connect('http://localhost:7001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for AI responses
socket.on('ai-response', (data) => {
  console.log('AI Response:', data);
  
  // Check if the query was escalated
  if (data.data.escalated) {
    console.log('Query was escalated to a lecturer');
  }
});

// Listen for escalation notifications
socket.on('query-escalated', (data) => {
  console.log('Query Escalated:', data);
  console.log('Chat Room ID:', data.data.chatRoomId);
});

// Send a message to AI
socket.emit('student-message', {
  message: 'What is the time complexity of quicksort?'
});
```