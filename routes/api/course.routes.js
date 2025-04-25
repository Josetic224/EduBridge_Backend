const express = require("express");
const { Router } = express;
const { isAuthenticated } = require("../../middlewares/auth");
const {
  uploadCourseMaterial,
  uploadAssignmentFiles,
  uploadSubmissionFiles
} = require("../../services/cloudinary");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseMaterial,
  enrollInCourse,
  unenrollFromCourse,
} = require("../../controllers/course");

const {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../../controllers/assignment");

const courseRouter = Router();
const assignmentRouter = Router();
const submissionRouter = Router();

// Course routes
courseRouter.post("/", isAuthenticated, createCourse);
courseRouter.get("/", isAuthenticated, getAllCourses);
courseRouter.get("/:courseId", isAuthenticated, getCourseById);
courseRouter.put("/:courseId", isAuthenticated, updateCourse);
courseRouter.delete("/:courseId", isAuthenticated, deleteCourse);
courseRouter.post("/:courseId/materials", isAuthenticated, uploadCourseMaterial.single("file"), addCourseMaterial);
courseRouter.post("/:courseId/enroll", isAuthenticated, enrollInCourse);
courseRouter.delete("/:courseId/enroll", isAuthenticated, unenrollFromCourse);

// Course assignments routes
courseRouter.post("/:courseId/assignments", isAuthenticated, uploadAssignmentFiles.array("attachments", 5), createAssignment);
courseRouter.get("/:courseId/assignments", isAuthenticated, getCourseAssignments);

// Assignment routes
assignmentRouter.get("/:assignmentId", isAuthenticated, getAssignmentById);
assignmentRouter.put("/:assignmentId", isAuthenticated, uploadAssignmentFiles.array("attachments", 5), updateAssignment);
assignmentRouter.delete("/:assignmentId", isAuthenticated, deleteAssignment);
assignmentRouter.post("/:assignmentId/submit", isAuthenticated, uploadSubmissionFiles.array("attachments", 5), submitAssignment);
assignmentRouter.get("/:assignmentId/submissions", isAuthenticated, getAssignmentSubmissions);

// Submission routes
submissionRouter.put("/:submissionId/grade", isAuthenticated, gradeSubmission);

module.exports = {
  courseRouter,
  assignmentRouter,
  submissionRouter,
};