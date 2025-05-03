const Course = require("../models/Course");
const User = require("../models/User");
const { CourseAnalytics } = require("../models/Analytics");
const { uploadToCloudinary } = require("../services/cloudinary");
const {
  CreateCourseSchema,
  UpdateCourseSchema,
  AddMaterialSchema,
  EnrollStudentSchema,
} = require("../validations/course");

/**
 * Create a new course
 * @route POST /api/lecturer/courses
 * @access Private (Lecturer only)
 */
const createCourse = async (req, res) => {
  try {
    // Validate request body
    const validationResult = CreateCourseSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    const { title, code, description, department, startDate, endDate, syllabus, enrollmentKey, isEnrollmentOpen, maxEnrollment } = validationResult.data;

    // Check if the user is a lecturer
    if (req.user.role !== "LECTURER") {
      return res.status(403).json({
        errors: [{ error: "Only lecturers can create courses" }],
      });
    }

    // Check if a course with the same code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        errors: [{ error: "A course with this code already exists" }],
      });
    }

    // Create the course
    const newCourse = new Course({
      title,
      code,
      description,
      department,
      lecturer: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      syllabus,
      enrollmentKey,
      isEnrollmentOpen: isEnrollmentOpen !== undefined ? isEnrollmentOpen : true,
      maxEnrollment,
      status: new Date(startDate) > new Date() ? "UPCOMING" : "ACTIVE",
    });

    await newCourse.save();

    // Initialize course analytics
    const courseAnalytics = new CourseAnalytics({
      courseId: newCourse._id,
      totalEnrollment: 0,
      activeStudents: 0,
    });

    await courseAnalytics.save();

    return res.status(201).json({
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to create course" }],
    });
  }
};

/**
 * Get all courses (with filtering options)
 * @route GET /api/courses
 * @access Private
 */
const getAllCourses = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const filter = {};

    // Apply filters if provided
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // If the user is a lecturer, only show their courses
    if (req.user.role === "LECTURER") {
      filter.lecturer = req.user._id;
    }

    // If the user is a student, show courses they're enrolled in and public courses
    if (req.user.role === "STUDENT") {
      filter.$or = [
        { students: req.user._id },
        { isEnrollmentOpen: true },
      ];
    }

    const courses = await Course.find(filter)
      .populate("lecturer", "userName email")
      .select("-enrollmentKey")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch courses" }],
    });
  }
};

/**
 * Get a single course by ID
 * @route GET /api/courses/:courseId
 * @access Private
 */
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("lecturer", "userName email profileImage")
      .populate("students", "userName email profileImage");

    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user has access to this course
    const isLecturer = req.user.role === "LECTURER" && course.lecturer._id.toString() === req.user._id.toString();
    const isEnrolled = course.students.some(student => student._id.toString() === req.user._id.toString());
    
    if (!isLecturer && !isEnrolled && !course.isEnrollmentOpen) {
      return res.status(403).json({
        errors: [{ error: "You don't have access to this course" }],
      });
    }

    // Don't send enrollment key to students
    if (!isLecturer) {
      course.enrollmentKey = undefined;
    }

    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch course" }],
    });
  }
};

/**
 * Update a course
 * @route PUT /api/courses/:courseId
 * @access Private (Lecturer only)
 */
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate request body
    const validationResult = UpdateCourseSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

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
        errors: [{ error: "Only the course lecturer can update this course" }],
      });
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: validationResult.data },
      { new: true }
    ).populate("lecturer", "userName email");

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to update course" }],
    });
  }
};

/**
 * Delete a course
 * @route DELETE /api/courses/:courseId
 * @access Private (Lecturer only)
 */
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

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
        errors: [{ error: "Only the course lecturer can delete this course" }],
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    // Delete related analytics
    await CourseAnalytics.deleteMany({ courseId });

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to delete course" }],
    });
  }
};

/**
 * Add course material
 * @route POST /api/courses/:courseId/materials
 * @access Private (Lecturer only)
 */
const addCourseMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate request body
    const validationResult = AddMaterialSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: validationResult.error.errors.map((error) => ({
          error: error.message,
        })),
      });
    }

    const { title, description } = validationResult.data;

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
        errors: [{ error: "Only the course lecturer can add materials" }],
      });
    }

    // Handle file upload if present
    let fileUrl = "";
    let fileType = "";
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "course_materials");
      fileUrl = result.secure_url;
      fileType = req.file.mimetype;
    }

    // Add material to the course
    const material = {
      title,
      description,
      fileUrl,
      fileType,
      uploadDate: new Date(),
    };

    course.materials.push(material);
    await course.save();

    return res.status(201).json({
      message: "Course material added successfully",
      material,
    });
  } catch (error) {
    console.error("Error adding course material:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to add course material" }],
    });
  }
};

/**
 * Enroll in a course
 * @route POST /api/courses/:courseId/enroll
 * @access Private (Student only)
 */
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate request body
    const validationResult = EnrollStudentSchema.safeParse({
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

    const { enrollmentKey } = validationResult.data;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is a student
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        errors: [{ error: "Only students can enroll in courses" }],
      });
    }

    // Check if enrollment is open
    if (!course.isEnrollmentOpen) {
      return res.status(400).json({
        errors: [{ error: "Enrollment is closed for this course" }],
      });
    }

    // Check if the course has reached maximum enrollment
    if (course.maxEnrollment && course.students.length >= course.maxEnrollment) {
      return res.status(400).json({
        errors: [{ error: "This course has reached maximum enrollment" }],
      });
    }

    // Check if the student is already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({
        errors: [{ error: "You are already enrolled in this course" }],
      });
    }

    // Check enrollment key if required
    if (course.enrollmentKey && course.enrollmentKey !== enrollmentKey) {
      return res.status(400).json({
        errors: [{ error: "Invalid enrollment key" }],
      });
    }

    // Enroll the student
    course.students.push(req.user._id);
    await course.save();

    // Update course analytics
    await CourseAnalytics.findOneAndUpdate(
      { courseId: course._id },
      { $inc: { totalEnrollment: 1, activeStudents: 1 } }
    );

    return res.status(200).json({
      message: "Successfully enrolled in the course",
    });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to enroll in course" }],
    });
  }
};

/**
 * Unenroll from a course
 * @route DELETE /api/courses/:courseId/enroll
 * @access Private (Student only)
 */
const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if the user is a student
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        errors: [{ error: "Only students can unenroll from courses" }],
      });
    }

    // Check if the student is enrolled
    if (!course.students.includes(req.user._id)) {
      return res.status(400).json({
        errors: [{ error: "You are not enrolled in this course" }],
      });
    }

    // Unenroll the student
    course.students = course.students.filter(
      (studentId) => studentId.toString() !== req.user._id.toString()
    );
    await course.save();

    // Update course analytics
    await CourseAnalytics.findOneAndUpdate(
      { courseId: course._id },
      { $inc: { activeStudents: -1 } }
    );

    return res.status(200).json({
      message: "Successfully unenrolled from the course",
    });
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to unenroll from course" }],
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseMaterial,
  enrollInCourse,
  unenrollFromCourse,
};