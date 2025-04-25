const { z } = require("zod");
const { Types } = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (value) => {
  return Types.ObjectId.isValid(value);
};

// Create Course Schema
const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  code: z.string().min(2, "Course code must be at least 2 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  department: z.string().min(2, "Department must be at least 2 characters long"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date",
  }),
  syllabus: z.string().optional(),
  enrollmentKey: z.string().optional(),
  isEnrollmentOpen: z.boolean().optional(),
  maxEnrollment: z.number().positive().optional(),
});

// Update Course Schema
const UpdateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").optional(),
  code: z.string().min(2, "Course code must be at least 2 characters long").optional(),
  description: z.string().min(10, "Description must be at least 10 characters long").optional(),
  department: z.string().min(2, "Department must be at least 2 characters long").optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date",
  }).optional(),
  status: z.enum(["ACTIVE", "UPCOMING", "COMPLETED", "ARCHIVED"]).optional(),
  syllabus: z.string().optional(),
  enrollmentKey: z.string().optional(),
  isEnrollmentOpen: z.boolean().optional(),
  maxEnrollment: z.number().positive().optional(),
});

// Add Material Schema
const AddMaterialSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
});

// Enroll Student Schema
const EnrollStudentSchema = z.object({
  enrollmentKey: z.string().optional(),
  courseId: z.string().refine(isValidObjectId, {
    message: "Invalid course ID format",
  }),
});

module.exports = {
  CreateCourseSchema,
  UpdateCourseSchema,
  AddMaterialSchema,
  EnrollStudentSchema,
};