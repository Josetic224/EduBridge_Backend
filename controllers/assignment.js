const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Course = require("../models/Course");
const { StudentAnalytics } = require("../models/Analytics");
const { uploadToCloudinary } = require("../services/cloudinary");
const {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateSubmissionSchema,
  GradeSubmissionSchema,
} = require("../validations/assignment");

/**
 * Create a new assignment
 * @route POST /api/courses/:courseId/assignments
 * @access Private (Lecturer only)
 */
const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate request body
    const validationResult = CreateAssignmentSchema.safeParse({
      ...req.body,
      courseId,
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    const {
      title,
      description,
      dueDate,
      totalPoints,
      submissionType,
      allowLateSubmissions,
      lateSubmissionDeadline,
      lateSubmissionPenalty,
      status,
    } = validationResult.data;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is the lecturer of this course
    if (req.user.role !== "LECTURER" || course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        errors: [{ error: "Only the course lecturer can create assignments" }],
      });
    }

    // Handle file attachments if present
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, "assignment_attachments");
        attachments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileType: file.mimetype,
          uploadDate: new Date(),
        });
      }
    }

    // Create the assignment
    const newAssignment = new Assignment({
      title,
      description,
      courseId,
      createdBy: req.user._id,
      dueDate: new Date(dueDate),
      totalPoints,
      attachments,
      submissionType,
      allowLateSubmissions,
      lateSubmissionDeadline: lateSubmissionDeadline ? new Date(lateSubmissionDeadline) : undefined,
      lateSubmissionPenalty,
      status,
    });

    await newAssignment.save();

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to create assignment" }],
    });
  }
};

/**
 * Get all assignments for a course
 * @route GET /api/courses/:courseId/assignments
 * @access Private
 */
const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user has access to this course
    const isLecturer = req.user.role === "LECTURER" && course.lecturer.toString() === req.user._id.toString();
    const isEnrolled = course.students.some(studentId => studentId.toString() === req.user._id.toString());
    
    if (!isLecturer && !isEnrolled) {
      return res.status(403).json({
        errors: [{ error: "You don't have access to this course" }],
      });
    }

    // Build query
    const query = { courseId };
    if (status) {
      query.status = status;
    }

    // For students, only show published assignments
    if (req.user.role === "STUDENT") {
      query.status = "PUBLISHED";
    }

    // Get assignments
    const assignments = await Assignment.find(query)
      .populate("createdBy", "userName email")
      .sort({ dueDate: 1 });

    // For students, include submission status
    if (req.user.role === "STUDENT") {
      const assignmentsWithSubmission = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user._id,
          });

          return {
            ...assignment.toObject(),
            submission: submission ? {
              status: submission.status,
              submissionDate: submission.submissionDate,
              grade: submission.grade,
            } : null,
          };
        })
      );

      return res.status(200).json({
        assignments: assignmentsWithSubmission,
      });
    }

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch assignments" }],
    });
  }
};

/**
 * Get a single assignment by ID
 * @route GET /api/assignments/:assignmentId
 * @access Private
 */
const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate("createdBy", "userName email")
      .populate("courseId", "title code");

    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user has access to this course
    const isLecturer = req.user.role === "LECTURER" && course.lecturer.toString() === req.user._id.toString();
    const isEnrolled = course.students.some(studentId => studentId.toString() === req.user._id.toString());
    
    if (!isLecturer && !isEnrolled) {
      return res.status(403).json({
        errors: [{ error: "You don't have access to this assignment" }],
      });
    }

    // For students, only show published assignments
    if (req.user.role === "STUDENT" && assignment.status !== "PUBLISHED") {
      return res.status(403).json({
        errors: [{ error: "This assignment is not available" }],
      });
    }

    // For students, include submission status
    if (req.user.role === "STUDENT") {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user._id,
      });

      return res.status(200).json({
        assignment: {
          ...assignment.toObject(),
          submission: submission ? {
            _id: submission._id,
            status: submission.status,
            submissionDate: submission.submissionDate,
            content: submission.content,
            attachments: submission.attachments,
            grade: submission.grade,
            isLate: submission.isLate,
          } : null,
        },
      });
    }

    // For lecturers, include submission statistics
    if (req.user.role === "LECTURER") {
      const submissionCount = await Submission.countDocuments({
        assignmentId: assignment._id,
      });

      const gradedCount = await Submission.countDocuments({
        assignmentId: assignment._id,
        status: "GRADED",
      });

      const lateCount = await Submission.countDocuments({
        assignmentId: assignment._id,
        isLate: true,
      });

      return res.status(200).json({
        assignment: {
          ...assignment.toObject(),
          stats: {
            submissionCount,
            gradedCount,
            lateCount,
            studentCount: course.students.length,
          },
        },
      });
    }

    return res.status(200).json({
      assignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch assignment" }],
    });
  }
};

/**
 * Update an assignment
 * @route PUT /api/assignments/:assignmentId
 * @access Private (Lecturer only)
 */
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Validate request body
    const validationResult = UpdateAssignmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is the lecturer of this course
    if (req.user.role !== "LECTURER" || course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        errors: [{ error: "Only the course lecturer can update this assignment" }],
      });
    }

    // Handle file attachments if present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, "assignment_attachments");
        assignment.attachments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileType: file.mimetype,
          uploadDate: new Date(),
        });
      }
    }

    // Update the assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      {
        $set: {
          ...validationResult.data,
          ...(validationResult.data.dueDate && { dueDate: new Date(validationResult.data.dueDate) }),
          ...(validationResult.data.lateSubmissionDeadline && { lateSubmissionDeadline: new Date(validationResult.data.lateSubmissionDeadline) }),
          attachments: assignment.attachments,
        },
      },
      { new: true }
    ).populate("createdBy", "userName email");

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to update assignment" }],
    });
  }
};

/**
 * Delete an assignment
 * @route DELETE /api/assignments/:assignmentId
 * @access Private (Lecturer only)
 */
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is the lecturer of this course
    if (req.user.role !== "LECTURER" || course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        errors: [{ error: "Only the course lecturer can delete this assignment" }],
      });
    }

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignmentId });

    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to delete assignment" }],
    });
  }
};

/**
 * Submit an assignment
 * @route POST /api/assignments/:assignmentId/submit
 * @access Private (Student only)
 */
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Validate request body
    const validationResult = CreateSubmissionSchema.safeParse({
      ...req.body,
      assignmentId,
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    const { content } = validationResult.data;

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Check if the assignment is published
    if (assignment.status !== "PUBLISHED") {
      return res.status(400).json({
        errors: [{ error: "This assignment is not available for submission" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is a student
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        errors: [{ error: "Only students can submit assignments" }],
      });
    }

    // Check if the student is enrolled in the course
    const isEnrolled = course.students.some(studentId => studentId.toString() === req.user._id.toString());
    if (!isEnrolled) {
      return res.status(403).json({
        errors: [{ error: "You are not enrolled in this course" }],
      });
    }

    // Check if the student has already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        errors: [{ error: "You have already submitted this assignment" }],
      });
    }

    // Check if the assignment is past due
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // If late, check if late submissions are allowed
    if (isLate && !assignment.allowLateSubmissions) {
      return res.status(400).json({
        errors: [{ error: "This assignment does not accept late submissions" }],
      });
    }

    // If late, check if it's within the late submission deadline
    if (isLate && assignment.lateSubmissionDeadline) {
      const lateDeadline = new Date(assignment.lateSubmissionDeadline);
      if (now > lateDeadline) {
        return res.status(400).json({
          errors: [{ error: "The late submission deadline has passed" }],
        });
      }
    }

    // Handle file attachments if present
    const attachments = [];
    if (req.files && req.files.length > 0) {
      // Check if the assignment accepts file submissions
      if (assignment.submissionType === "TEXT") {
        return res.status(400).json({
          errors: [{ error: "This assignment does not accept file submissions" }],
        });
      }

      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path, "submission_attachments");
        attachments.push({
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileType: file.mimetype,
          uploadDate: new Date(),
        });
      }
    }

    // Check if content is provided for text submissions
    if (assignment.submissionType === "FILE" && !attachments.length) {
      return res.status(400).json({
        errors: [{ error: "File attachment is required for this assignment" }],
      });
    }

    if (assignment.submissionType === "TEXT" && !content) {
      return res.status(400).json({
        errors: [{ error: "Text content is required for this assignment" }],
      });
    }

    if (assignment.submissionType === "BOTH" && !content && !attachments.length) {
      return res.status(400).json({
        errors: [{ error: "Either text content or file attachment is required" }],
      });
    }

    // Create the submission
    const newSubmission = new Submission({
      assignmentId,
      studentId: req.user._id,
      submissionDate: now,
      content,
      attachments,
      status: "SUBMITTED",
      isLate,
    });

    await newSubmission.save();

    // Update student analytics
    await StudentAnalytics.findOneAndUpdate(
      { studentId: req.user._id, courseId: assignment.courseId },
      { 
        $inc: { 
          assignmentsCompleted: 1,
          ...(isLate && { assignmentsSubmittedLate: 1 }),
        } 
      },
      { upsert: true }
    );

    return res.status(201).json({
      message: "Assignment submitted successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to submit assignment" }],
    });
  }
};

/**
 * Get all submissions for an assignment
 * @route GET /api/assignments/:assignmentId/submissions
 * @access Private (Lecturer only)
 */
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.query;

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is the lecturer of this course
    if (req.user.role !== "LECTURER" || course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        errors: [{ error: "Only the course lecturer can view submissions" }],
      });
    }

    // Build query
    const query = { assignmentId };
    if (status) {
      query.status = status;
    }

    // Get submissions
    const submissions = await Submission.find(query)
      .populate("studentId", "userName email profileImage")
      .sort({ submissionDate: -1 });

    return res.status(200).json({
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch submissions" }],
    });
  }
};

/**
 * Grade a submission
 * @route PUT /api/submissions/:submissionId/grade
 * @access Private (Lecturer only)
 */
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Validate request body
    const validationResult = GradeSubmissionSchema.safeParse({
      ...req.body,
      submissionId,
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    const { points, feedback } = validationResult.data;

    // Find the submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        errors: [{ error: "Submission not found" }],
      });
    }

    // Find the assignment
    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({
        errors: [{ error: "Assignment not found" }],
      });
    }

    // Find the course
    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is the lecturer of this course
    if (req.user.role !== "LECTURER" || course.lecturer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        errors: [{ error: "Only the course lecturer can grade submissions" }],
      });
    }

    // Validate points
    if (points > assignment.totalPoints) {
      return res.status(400).json({
        errors: [{ error: `Points cannot exceed the maximum of ${assignment.totalPoints}` }],
      });
    }

    // Update the submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          status: "GRADED",
          grade: {
            points,
            feedback,
            gradedBy: req.user._id,
            gradedAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("studentId", "userName email");

    // Update student analytics
    await StudentAnalytics.findOneAndUpdate(
      { studentId: submission.studentId, courseId: assignment.courseId },
      { $set: { averageGrade: points / assignment.totalPoints * 100 } },
      { upsert: true }
    );

    return res.status(200).json({
      message: "Submission graded successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to grade submission" }],
    });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
};