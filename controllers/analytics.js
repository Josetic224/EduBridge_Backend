const { StudentAnalytics, CourseAnalytics } = require("../models/Analytics");
const Course = require("../models/Course");
const User = require("../models/User");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

/**
 * Get student analytics for a course
 * @route GET /api/analytics/student/:courseId
 * @access Private (Student - own data only, Lecturer - all students in their course)
 */
const getStudentAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.query;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check access permissions
    if (req.user.role === "STUDENT") {
      // Students can only view their own analytics
      if (studentId && studentId !== req.user._id.toString()) {
        return res.status(403).json({
          errors: [{ error: "You can only view your own analytics" }],
        });
      }

      // Check if student is enrolled in the course
      const isEnrolled = course.students.some(id => id.toString() === req.user._id.toString());
      if (!isEnrolled) {
        return res.status(403).json({
          errors: [{ error: "You are not enrolled in this course" }],
        });
      }

      // Get student's analytics
      const analytics = await StudentAnalytics.findOne({
        studentId: req.user._id,
        courseId,
      });

      if (!analytics) {
        // Create default analytics if none exist
        const newAnalytics = new StudentAnalytics({
          studentId: req.user._id,
          courseId,
        });
        await newAnalytics.save();
        return res.status(200).json({ analytics: newAnalytics });
      }

      return res.status(200).json({ analytics });
    } else if (req.user.role === "LECTURER") {
      // Lecturers can view all students' analytics in their course
      if (course.lecturer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          errors: [{ error: "You can only view analytics for your own courses" }],
        });
      }

      // If studentId is provided, get analytics for that student
      if (studentId) {
        const analytics = await StudentAnalytics.findOne({
          studentId,
          courseId,
        }).populate("studentId", "userName email profileImage");

        if (!analytics) {
          return res.status(404).json({
            errors: [{ error: "Analytics not found for this student" }],
          });
        }

        return res.status(200).json({ analytics });
      }

      // Get analytics for all students in the course
      const analytics = await StudentAnalytics.find({ courseId })
        .populate("studentId", "userName email profileImage");

      return res.status(200).json({ analytics });
    }

    return res.status(403).json({
      errors: [{ error: "Unauthorized access" }],
    });
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch student analytics" }],
    });
  }
};

/**
 * Get course analytics
 * @route GET /api/analytics/course/:courseId
 * @access Private (Lecturer only)
 */
const getCourseAnalytics = async (req, res) => {
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
        errors: [{ error: "Only the course lecturer can view course analytics" }],
      });
    }

    // Get course analytics
    let analytics = await CourseAnalytics.findOne({ courseId });

    if (!analytics) {
      // Create default analytics if none exist
      analytics = new CourseAnalytics({
        courseId,
        totalEnrollment: course.students.length,
      });
      await analytics.save();
    }

    // Get additional analytics data
    const assignmentsCount = await Assignment.countDocuments({ courseId });
    const submissionsCount = await Submission.countDocuments({
      assignmentId: { $in: (await Assignment.find({ courseId }).select("_id")) },
    });
    const gradedSubmissionsCount = await Submission.countDocuments({
      assignmentId: { $in: (await Assignment.find({ courseId }).select("_id")) },
      status: "GRADED",
    });

    // Calculate assignment completion rate
    const assignmentCompletionRate = assignmentsCount > 0 && course.students.length > 0
      ? (submissionsCount / (assignmentsCount * course.students.length)) * 100
      : 0;

    // Calculate average grade
    const submissions = await Submission.find({
      assignmentId: { $in: (await Assignment.find({ courseId }).select("_id")) },
      status: "GRADED",
    });

    let averageGrade = 0;
    if (submissions.length > 0) {
      const totalPoints = submissions.reduce((sum, sub) => sum + (sub.grade?.points || 0), 0);
      averageGrade = totalPoints / submissions.length;
    }

    // Update analytics with calculated values
    analytics.assignmentCompletionRate = assignmentCompletionRate;
    analytics.averageGrade = averageGrade;
    await analytics.save();

    return res.status(200).json({
      analytics: {
        ...analytics.toObject(),
        stats: {
          studentsCount: course.students.length,
          assignmentsCount,
          submissionsCount,
          gradedSubmissionsCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching course analytics:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch course analytics" }],
    });
  }
};

/**
 * Get lecturer dashboard analytics
 * @route GET /api/analytics/lecturer/dashboard
 * @access Private (Lecturer only)
 */
const getLecturerDashboardAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "LECTURER") {
      return res.status(403).json({
        errors: [{ error: "Only lecturers can access this data" }],
      });
    }

    // Get lecturer's courses
    const courses = await Course.find({ lecturer: req.user._id });
    const courseIds = courses.map(course => course._id);

    // Get total students across all courses
    const totalStudents = new Set();
    courses.forEach(course => {
      course.students.forEach(studentId => {
        totalStudents.add(studentId.toString());
      });
    });

    // Get assignments data
    const assignments = await Assignment.find({ courseId: { $in: courseIds } });
    const assignmentIds = assignments.map(assignment => assignment._id);

    // Get submissions data
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });
    const gradedSubmissions = submissions.filter(sub => sub.status === "GRADED");
    const pendingSubmissions = submissions.filter(sub => sub.status === "SUBMITTED");

    // Calculate average grades per course
    const courseGrades = {};
    for (const course of courses) {
      const courseAssignments = assignments.filter(a => a.courseId.toString() === course._id.toString());
      const courseAssignmentIds = courseAssignments.map(a => a._id);
      const courseSubmissions = submissions.filter(s => courseAssignmentIds.includes(s.assignmentId));
      const courseGradedSubmissions = courseSubmissions.filter(s => s.status === "GRADED");
      
      let averageGrade = 0;
      if (courseGradedSubmissions.length > 0) {
        const totalPoints = courseGradedSubmissions.reduce((sum, sub) => sum + (sub.grade?.points || 0), 0);
        averageGrade = totalPoints / courseGradedSubmissions.length;
      }
      
      courseGrades[course._id] = {
        title: course.title,
        code: course.code,
        averageGrade,
        submissionsCount: courseSubmissions.length,
        gradedCount: courseGradedSubmissions.length,
        pendingCount: courseSubmissions.filter(s => s.status === "SUBMITTED").length,
      };
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
      .sort({ submissionDate: -1 })
      .limit(5)
      .populate("studentId", "userName email")
      .populate("assignmentId", "title");

    return res.status(200).json({
      analytics: {
        coursesCount: courses.length,
        totalStudents: totalStudents.size,
        assignmentsCount: assignments.length,
        submissionsCount: submissions.length,
        gradedSubmissionsCount: gradedSubmissions.length,
        pendingSubmissionsCount: pendingSubmissions.length,
        courseGrades,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("Error fetching lecturer dashboard analytics:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch lecturer dashboard analytics" }],
    });
  }
};

/**
 * Get student dashboard analytics
 * @route GET /api/analytics/student/dashboard
 * @access Private (Student only)
 */
const getStudentDashboardAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        errors: [{ error: "Only students can access this data" }],
      });
    }

    // Get courses the student is enrolled in
    const courses = await Course.find({ students: req.user._id })
      .populate("lecturer", "userName email");

    const courseIds = courses.map(course => course._id);

    // Get assignments for these courses
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
      status: "PUBLISHED",
    });

    // Get student's submissions
    const submissions = await Submission.find({ studentId: req.user._id });

    // Calculate due assignments
    const now = new Date();
    const dueAssignments = assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      const hasSubmitted = submissions.some(sub => sub.assignmentId.toString() === assignment._id.toString());
      return dueDate > now && !hasSubmitted;
    });

    // Calculate overdue assignments
    const overdueAssignments = assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      const hasSubmitted = submissions.some(sub => sub.assignmentId.toString() === assignment._id.toString());
      return dueDate < now && !hasSubmitted;
    });

    // Calculate grades per course
    const courseGrades = {};
    for (const course of courses) {
      const courseAssignments = assignments.filter(a => a.courseId.toString() === course._id.toString());
      const courseAssignmentIds = courseAssignments.map(a => a._id);
      const courseSubmissions = submissions.filter(s => courseAssignmentIds.includes(s.assignmentId));
      const courseGradedSubmissions = courseSubmissions.filter(s => s.status === "GRADED");
      
      let averageGrade = 0;
      if (courseGradedSubmissions.length > 0) {
        const totalPoints = courseGradedSubmissions.reduce((sum, sub) => sum + (sub.grade?.points || 0), 0);
        const totalPossiblePoints = courseGradedSubmissions.reduce((sum, sub) => {
          const assignment = courseAssignments.find(a => a._id.toString() === sub.assignmentId.toString());
          return sum + (assignment?.totalPoints || 0);
        }, 0);
        averageGrade = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;
      }
      
      courseGrades[course._id] = {
        title: course.title,
        code: course.code,
        averageGrade,
        submittedCount: courseSubmissions.length,
        totalAssignments: courseAssignments.length,
        completionRate: courseAssignments.length > 0 
          ? (courseSubmissions.length / courseAssignments.length) * 100 
          : 0,
      };
    }

    // Get recent grades
    const recentGrades = await Submission.find({
      studentId: req.user._id,
      status: "GRADED",
    })
      .sort({ "grade.gradedAt": -1 })
      .limit(5)
      .populate("assignmentId", "title courseId");

    // Enhance recent grades with course info
    const enhancedRecentGrades = await Promise.all(
      recentGrades.map(async (grade) => {
        const course = await Course.findById(grade.assignmentId.courseId).select("title code");
        return {
          ...grade.toObject(),
          course: {
            _id: course._id,
            title: course.title,
            code: course.code,
          },
        };
      })
    );

    return res.status(200).json({
      analytics: {
        coursesCount: courses.length,
        dueAssignmentsCount: dueAssignments.length,
        overdueAssignmentsCount: overdueAssignments.length,
        submittedAssignmentsCount: submissions.length,
        gradedAssignmentsCount: submissions.filter(s => s.status === "GRADED").length,
        courseGrades,
        recentGrades: enhancedRecentGrades,
        dueAssignments: dueAssignments.map(a => ({
          _id: a._id,
          title: a.title,
          dueDate: a.dueDate,
          courseId: a.courseId,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching student dashboard analytics:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to fetch student dashboard analytics" }],
    });
  }
};

/**
 * Update student activity analytics
 * @route POST /api/analytics/student/activity
 * @access Private (Student only)
 */
const updateStudentActivity = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({
        errors: [{ error: "Only students can update activity data" }],
      });
    }

    const { courseId, timeSpent, resourcesAccessed } = req.body;

    if (!courseId) {
      return res.status(400).json({
        errors: [{ error: "Course ID is required" }],
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        errors: [{ error: "Course not found" }],
      });
    }

    // Check if student is enrolled in the course
    const isEnrolled = course.students.some(id => id.toString() === req.user._id.toString());
    if (!isEnrolled) {
      return res.status(403).json({
        errors: [{ error: "You are not enrolled in this course" }],
      });
    }

    // Get current date info for weekly tracking
    const now = new Date();
    const currentWeek = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    const currentYear = now.getFullYear();

    // Update student analytics
    const updateData = {
      $set: { lastActive: now },
      $inc: {
        loginCount: 1,
        ...(timeSpent && { totalTimeSpent: timeSpent }),
        ...(resourcesAccessed && { resourcesAccessed }),
      },
    };

    // Update weekly activity
    if (timeSpent) {
      updateData.$push = {
        weeklyActivity: {
          $each: [{
            week: currentWeek,
            year: currentYear,
            logins: 1,
            timeSpent,
            assignmentsCompleted: 0,
            messagesCount: 0,
          }],
          $position: 0,
          $slice: 52, // Keep only the last year of weekly data
        },
      };
    }

    await StudentAnalytics.findOneAndUpdate(
      { studentId: req.user._id, courseId },
      updateData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Activity data updated successfully",
    });
  } catch (error) {
    console.error("Error updating student activity:", error);
    return res.status(500).json({
      errors: [{ error: "Failed to update activity data" }],
    });
  }
};

module.exports = {
  getStudentAnalytics,
  getCourseAnalytics,
  getLecturerDashboardAnalytics,
  getStudentDashboardAnalytics,
  updateStudentActivity,
};