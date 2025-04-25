const express = require("express");
const { Router } = express;
const { isAuthenticated } = require("../../middlewares/auth");
const {
  getStudentAnalytics,
  getCourseAnalytics,
  getLecturerDashboardAnalytics,
  getStudentDashboardAnalytics,
  updateStudentActivity,
} = require("../../controllers/analytics");

const analyticsRouter = Router();

// Student analytics routes
analyticsRouter.get("/student/:courseId", isAuthenticated, getStudentAnalytics);
analyticsRouter.get("/student/dashboard", isAuthenticated, getStudentDashboardAnalytics);
analyticsRouter.post("/student/activity", isAuthenticated, updateStudentActivity);

// Course analytics routes
analyticsRouter.get("/course/:courseId", isAuthenticated, getCourseAnalytics);

// Lecturer dashboard analytics
analyticsRouter.get("/lecturer/dashboard", isAuthenticated, getLecturerDashboardAnalytics);

module.exports = {
  analyticsRouter,
};