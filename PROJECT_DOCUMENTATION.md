# EduBridge Backend - Project Development and Design Documentation

## 1. Project Overview

EduBridge is an educational platform designed to connect students with lecturers, providing a seamless learning experience through various features including user authentication, real-time communication, AI-assisted learning, and educational resource management.

### 1.1 Purpose

The EduBridge platform aims to bridge the gap between students and educational resources by:
- Facilitating direct communication between students and lecturers
- Providing AI-assisted learning support for common questions
- Managing user authentication and profiles securely
- Supporting educational content delivery and management

### 1.2 Target Audience

- Students seeking educational support
- Lecturers providing educational guidance
- Educational institutions looking for digital learning solutions

## 2. System Architecture

### 2.1 High-Level Architecture

EduBridge follows a modern web application architecture with:
- **Backend**: Node.js/Express.js RESTful API
- **Database**: MongoDB (NoSQL)
- **Real-time Communication**: Socket.IO
- **AI Integration**: Google's Generative AI (Gemini)
- **Authentication**: JWT-based authentication with 2FA support
- **File Storage**: Cloudinary for profile pictures and media

### 2.2 Technology Stack

#### Backend Technologies
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Speakeasy (for 2FA)
- **Real-time Communication**: Socket.IO
- **Email Service**: Nodemailer
- **Validation**: Zod
- **AI Integration**: Google Generative AI (Gemini)
- **File Upload**: Multer with Cloudinary storage
- **Logging**: Pino

#### Development Tools
- **Package Manager**: Yarn
- **Development Server**: Nodemon
- **Testing**: Jest, Supertest
- **API Documentation**: Swagger

## 3. Database Design

### 3.1 Data Models

#### User Model
```javascript
{
  userName: String,
  email: String,
  password: String,
  role: Enum["STUDENT", "LECTURER"],
  passcode: String,
  university: String,
  country: String,
  otp: String,
  otpExpireIn: Number,
  isVerified: Boolean,
  isPasscodeSet: Boolean,
  twoFactorSecret: String,
  isTwoFactorEnabled: Boolean,
  isActive: Boolean,
  profileImage: String,
  loginHistory: [
    {
      device: {
        browser: String,
        browserVersion: String,
        os: String,
        osVersion: String,
        device: String,
        deviceType: String
      },
      ip: String,
      timestamp: Date,
      location: String
    }
  ]
}
```

#### ChatRoom Model
```javascript
{
  participants: [ObjectId], // References User model
  isEscalated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Model
```javascript
{
  room: ObjectId, // References ChatRoom model
  sender: ObjectId, // References User model
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Course Model
```javascript
{
  title: String,
  code: String,
  description: String,
  department: String,
  lecturer: ObjectId, // References User model
  students: [ObjectId], // References User model
  startDate: Date,
  endDate: Date,
  status: Enum["ACTIVE", "UPCOMING", "COMPLETED", "ARCHIVED"],
  materials: [
    {
      title: String,
      description: String,
      fileUrl: String,
      fileType: String,
      uploadDate: Date
    }
  ],
  syllabus: String,
  enrollmentKey: String,
  isEnrollmentOpen: Boolean,
  maxEnrollment: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Assignment Model
```javascript
{
  title: String,
  description: String,
  courseId: ObjectId, // References Course model
  createdBy: ObjectId, // References User model
  dueDate: Date,
  totalPoints: Number,
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadDate: Date
    }
  ],
  status: Enum["DRAFT", "PUBLISHED", "ARCHIVED"],
  submissionType: Enum["FILE", "TEXT", "BOTH"],
  allowLateSubmissions: Boolean,
  lateSubmissionDeadline: Date,
  lateSubmissionPenalty: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Submission Model
```javascript
{
  assignmentId: ObjectId, // References Assignment model
  studentId: ObjectId, // References User model
  submissionDate: Date,
  content: String,
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadDate: Date
    }
  ],
  status: Enum["SUBMITTED", "LATE", "GRADED", "RETURNED"],
  grade: {
    points: Number,
    feedback: String,
    gradedBy: ObjectId, // References User model
    gradedAt: Date
  },
  isLate: Boolean,
  attempts: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### StudentAnalytics Model
```javascript
{
  studentId: ObjectId, // References User model
  courseId: ObjectId, // References Course model
  loginCount: Number,
  totalTimeSpent: Number,
  lastActive: Date,
  assignmentsCompleted: Number,
  assignmentsSubmittedLate: Number,
  assignmentsMissed: Number,
  averageGrade: Number,
  messagesCount: Number,
  responseRate: Number,
  resourcesAccessed: Number,
  weeklyActivity: [
    {
      week: Number,
      year: Number,
      logins: Number,
      timeSpent: Number,
      assignmentsCompleted: Number,
      messagesCount: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### CourseAnalytics Model
```javascript
{
  courseId: ObjectId, // References Course model
  totalEnrollment: Number,
  activeStudents: Number,
  assignmentCompletionRate: Number,
  averageGrade: Number,
  averageTimeSpent: Number,
  mostAccessedResources: [
    {
      resourceId: String,
      title: String,
      accessCount: Number
    }
  ],
  weeklyActivity: [
    {
      week: Number,
      year: Number,
      activeStudents: Number,
      averageTimeSpent: Number,
      assignmentCompletionRate: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### FAQ Model
```javascript
{
  question: String,
  answer: String,
  category: String
}
```

#### BlacklistToken Model
```javascript
{
  token: String,
  createdAt: Date
}
```

### 3.2 Relationships

- **User to ChatRoom**: Many-to-Many (Users can participate in multiple chat rooms)
- **ChatRoom to Message**: One-to-Many (A chat room can have multiple messages)
- **User to Message**: One-to-Many (A user can send multiple messages)
- **Lecturer to Course**: One-to-Many (A lecturer can create multiple courses)
- **Student to Course**: Many-to-Many (Students can enroll in multiple courses)
- **Course to Assignment**: One-to-Many (A course can have multiple assignments)
- **Assignment to Submission**: One-to-Many (An assignment can have multiple submissions)
- **Student to Submission**: One-to-Many (A student can submit multiple assignments)
- **Student to StudentAnalytics**: One-to-Many (A student can have analytics for multiple courses)
- **Course to CourseAnalytics**: One-to-One (A course has one analytics record)

## 4. API Design

### 4.1 Authentication Endpoints

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

### 4.2 User Management Endpoints

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

### 4.3 Educational Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/countries/fetchCountries` | GET | Fetch all countries |
| `/api/countries/all` | GET | Fetch all countries (alias) |
| `/api/universities/countries/:country` | GET | Get universities by country |
| `/api/student/specialties-and-departments` | GET | Get specialties and departments |

### 4.4 FAQ Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student/faqs` | POST | Create a new FAQ |
| `/api/student/faqs` | GET | Get all FAQs |
| `/api/student/faqs/:faqId` | PUT | Update an FAQ |
| `/api/student/faqs/:faqId` | DELETE | Delete an FAQ |

### 4.5 Course Management Endpoints

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

### 4.6 Assignment Management Endpoints

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

### 4.7 Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/student/:courseId` | GET | Get student analytics for a course |
| `/api/analytics/course/:courseId` | GET | Get course analytics (Lecturer only) |
| `/api/analytics/lecturer/dashboard` | GET | Get lecturer dashboard analytics (Lecturer only) |
| `/api/analytics/student/dashboard` | GET | Get student dashboard analytics (Student only) |
| `/api/analytics/student/activity` | POST | Update student activity analytics (Student only) |

### 4.8 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Client connects to socket server |
| `student-message` | Client → Server | Student sends a message |
| `ai-response` | Server → Client | AI responds to student message |
| `join-room` | Client → Server | User joins a chat room |
| `send-message` | Client → Server | User sends a message in a chat room |
| `new-message` | Server → Client | New message notification |
| `new-escalated-chat` | Server → Client | Notification of escalated chat to lecturer |
| `disconnect` | Client → Server | Client disconnects from socket server |

## 5. Authentication and Security

### 5.1 Authentication Flow

1. **Registration**:
   - User submits registration details
   - System validates input using Zod schemas
   - Password is encrypted using bcrypt
   - OTP is generated and sent to user's email
   - User account is created in an unverified state

2. **Verification**:
   - User submits OTP received via email
   - System validates OTP and marks account as verified

3. **Login**:
   - User submits email and password/passcode
   - System validates credentials
   - If 2FA is enabled, a temporary token is issued
   - User submits 2FA code
   - System validates 2FA code and issues full authentication token
   - Login history is recorded

### 5.2 Security Measures

- **Password Encryption**: bcrypt for secure password hashing
- **JWT Authentication**: Secure token-based authentication
- **Two-Factor Authentication**: Optional 2FA using Speakeasy
- **OTP Verification**: Email verification using one-time passwords
- **Token Blacklisting**: Prevention of token reuse after logout
- **Login History**: Tracking of user login activities
- **Input Validation**: Zod schema validation for all inputs

## 6. Real-time Communication System

### 6.1 Socket.IO Implementation

The real-time communication system uses Socket.IO to enable:
- Direct messaging between students and lecturers
- AI-assisted responses to student queries
- Escalation of complex questions to appropriate lecturers

### 6.2 AI Integration

- **Gemini AI Integration**: Uses Google's Generative AI to provide automated responses
- **Subject Detection**: Basic subject detection to route questions to appropriate lecturers
- **Escalation Logic**: Complex questions are escalated to human lecturers

## 7. File Storage and Management

### 7.1 Cloudinary Integration

- Profile pictures and other media are stored in Cloudinary
- Multer middleware handles file uploads
- CloudinaryStorage configures storage parameters

### 7.2 File Upload Configuration

```javascript
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures",
    format: async (req, file) => "png",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});
```

## 8. Error Handling

### 8.1 Error Response Format

```javascript
{
  errors: [
    {
      error: "Error message"
    }
  ]
}
```

### 8.2 Error Types

- **Bad Request (400)**: Invalid input data
- **Unauthorized (401)**: Authentication failure
- **Not Found (404)**: Resource not found
- **Server Error (500)**: Internal server error

## 9. Logging and Monitoring

### 9.1 Logging Implementation

- **Pino Logger**: Structured logging for application events
- **Express Pino Logger**: HTTP request logging
- **Console Logging**: Development-friendly console output

### 9.2 Log Categories

- **Info Logs**: Normal application operations
- **Error Logs**: Application errors and exceptions
- **Debug Logs**: Detailed information for debugging

## 10. Deployment and Environment Configuration

### 10.1 Environment Variables

- `PORT`: Application port (default: 7001)
- `MONGO_URL`: MongoDB connection string
- `TOKEN_SECRET_KEY`: JWT secret key
- `GEMINI_API_KEY`: Google Generative AI API key
- `NODE_ENV`: Environment (development/production)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### 10.2 Deployment Scripts

```json
"scripts": {
  "start": "node ./public/http.js",
  "dev": "NODE_ENV=development nodemon server.js"
}
```

## 11. Testing Strategy

### 11.1 Testing Tools

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertions for API testing

### 11.2 Test Categories

- **Unit Tests**: Testing individual functions and components
- **Integration Tests**: Testing API endpoints and database interactions
- **Socket Tests**: Testing real-time communication

## 12. Future Enhancements

### 12.1 Potential Improvements

- **Enhanced AI Integration**: More sophisticated AI response capabilities
- **Advanced Analytics**: User behavior and learning analytics
- **Content Management**: Structured educational content delivery
- **Mobile Application**: Native mobile client development
- **Video Conferencing**: Real-time video communication
- **Blockchain Integration**: Credential verification and certification

### 12.2 Scalability Considerations

- **Horizontal Scaling**: Adding more server instances
- **Database Sharding**: Distributing database load
- **Caching Layer**: Redis or similar for performance optimization
- **Microservices Architecture**: Breaking down into specialized services

## 13. Conclusion

The EduBridge Backend provides a robust foundation for an educational platform with features including user authentication, real-time communication, AI assistance, and educational resource management. The system is designed with security, scalability, and user experience in mind, providing a comprehensive solution for connecting students with educational resources and expert guidance.