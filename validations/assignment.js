const { z } = require("zod");
const { Types } = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value) => {
  return Types.ObjectId.isValid(value);
};

// Create Assignment Schema
const CreateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  courseId: z.string().refine(isValidObjectId, {
    message: "Invalid course ID format",
  }),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Due date must be a valid date",
  }),
  totalPoints: z.number().positive().default(100),
  submissionType: z.enum(["FILE", "TEXT", "BOTH"]).default("BOTH"),
  allowLateSubmissions: z.boolean().default(false),
  lateSubmissionDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Late submission deadline must be a valid date",
  }).optional(),
  lateSubmissionPenalty: z.number().min(0).max(100).default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

// Update Assignment Schema
const UpdateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Due date must be a valid date",
  }).optional(),
  totalPoints: z.number().positive().optional(),
  submissionType: z.enum(["FILE", "TEXT", "BOTH"]).optional(),
  allowLateSubmissions: z.boolean().optional(),
  lateSubmissionDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Late submission deadline must be a valid date",
  }).optional(),
  lateSubmissionPenalty: z.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

// Create Submission Schema
const CreateSubmissionSchema = z.object({
  assignmentId: z.string().refine(isValidObjectId, {
    message: "Invalid assignment ID format",
  }),
  content: z.string().optional(),
});

// Grade Submission Schema
const GradeSubmissionSchema = z.object({
  submissionId: z.string().refine(isValidObjectId, {
    message: "Invalid submission ID format",
  }),
  points: z.number().min(0),
  feedback: z.string().optional(),
});

module.exports = {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateSubmissionSchema,
  GradeSubmissionSchema,
};