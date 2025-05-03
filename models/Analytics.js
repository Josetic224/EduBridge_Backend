const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Student Analytics Schema
const StudentAnalyticsSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Engagement metrics
    loginCount: {
      type: Number,
      default: 0,
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    lastActive: {
      type: Date,
    },
    // Assignment metrics
    assignmentsCompleted: {
      type: Number,
      default: 0,
    },
    assignmentsSubmittedLate: {
      type: Number,
      default: 0,
    },
    assignmentsMissed: {
      type: Number,
      default: 0,
    },
    averageGrade: {
      type: Number,
      default: 0,
    },
    // Communication metrics
    messagesCount: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: Number, // percentage
      default: 0,
    },
    // Resource usage
    resourcesAccessed: {
      type: Number,
      default: 0,
    },
    // Weekly activity summary
    weeklyActivity: [{
      week: Number,
      year: Number,
      logins: Number,
      timeSpent: Number,
      assignmentsCompleted: Number,
      messagesCount: Number,
    }],
  },
  { timestamps: true }
);

// Course Analytics Schema
const CourseAnalyticsSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Enrollment metrics
    totalEnrollment: {
      type: Number,
      default: 0,
    },
    activeStudents: {
      type: Number,
      default: 0,
    },
    // Assignment metrics
    assignmentCompletionRate: {
      type: Number, // percentage
      default: 0,
    },
    averageGrade: {
      type: Number,
      default: 0,
    },
    // Engagement metrics
    averageTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    // Resource usage
    mostAccessedResources: [{
      resourceId: String,
      title: String,
      accessCount: Number,
    }],
    // Weekly summary
    weeklyActivity: [{
      week: Number,
      year: Number,
      activeStudents: Number,
      averageTimeSpent: Number,
      assignmentCompletionRate: Number,
    }],
  },
  { timestamps: true }
);

const StudentAnalytics = model("StudentAnalytics", StudentAnalyticsSchema);
const CourseAnalytics = model("CourseAnalytics", CourseAnalyticsSchema);

module.exports = {
  StudentAnalytics,
  CourseAnalytics,
};