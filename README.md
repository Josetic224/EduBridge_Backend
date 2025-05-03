# EduBridge Backend

EduBridge is an educational platform that connects students and lecturers, providing tools for course management, assignment submission, grading, and analytics.

## Features

- User authentication with 2FA support
- Course creation and management
- Assignment creation, submission, and grading
- Real-time chat with AI assistance
- Analytics for students and lecturers
- File uploads for assignments and course materials

## API Documentation

The API is documented using Swagger (OpenAPI). Once the server is running, you can access the interactive documentation at:

```
http://localhost:7001/api-docs
```

This documentation provides:
- Complete list of all API endpoints
- Request and response schemas
- Interactive testing interface
- Authentication requirements

For more details on how the Swagger documentation is implemented and how to extend it, see [SWAGGER_DOCUMENTATION.md](./SWAGGER_DOCUMENTATION.md).

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file storage)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=7001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## Project Structure

- `configs/`: Configuration files
- `controllers/`: Request handlers
- `helpers/`: Utility functions
- `middlewares/`: Express middlewares
- `models/`: Mongoose models
- `routes/`: API routes
- `services/`: External service integrations
- `sockets/`: Socket.IO handlers
- `validations/`: Input validation schemas
