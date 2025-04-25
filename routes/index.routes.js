const express = require("express");
const {
  userRouter,
  countriesRouter,
  universityRouter,
  countryRouter,
  lecturerRouter,
} = require("./api/user.routes");
const { twoFA_Router } = require("./api/2FA");
const socketRouter = require("./api/socket.routes");
const { 
  courseRouter, 
  assignmentRouter, 
  submissionRouter 
} = require("./api/course.routes");
const { analyticsRouter } = require("./api/analytics.routes");
const chatRouter = require("./api/chat.routes");
const debugRouter = require("./api/debug.routes");

// define routes
module.exports = function routes(app) {
  app.use(express.json());
  
  // User routes
  app.use("/api/student", userRouter);
  app.use("/api/students", userRouter);
  app.use("/api/student", twoFA_Router);
  app.use("/api/lecturer", userRouter);
  app.use("/api/lecturer", lecturerRouter);
  
  // Country and university routes
  app.use("/api/countries", countriesRouter);
  app.use("/api/countries", countryRouter);
  app.use("/api/universities", universityRouter);
  
  // Authentication routes
  app.use("/api", twoFA_Router);
  
  // Socket routes
  app.use("/api/socket", socketRouter);
  
  // Course and assignment management routes
  app.use("/api/courses", courseRouter);
  app.use("/api/assignments", assignmentRouter);
  app.use("/api/submissions", submissionRouter);
  
  // Analytics routes
  app.use("/api/analytics", analyticsRouter);
  
  // Chat routes
  app.use("/api/chats", chatRouter);
  
  // Debug routes (only for development)
  app.use("/api/debug", debugRouter);
};
