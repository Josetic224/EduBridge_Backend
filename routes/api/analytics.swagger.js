/**
 * @swagger
 * components:
 *   schemas:
 *     StudentAnalytics:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the analytics record
 *         student:
 *           type: string
 *           description: ID of the student
 *         course:
 *           type: string
 *           description: ID of the course
 *         loginCount:
 *           type: number
 *           description: Number of times the student has logged in
 *         timeSpent:
 *           type: number
 *           description: Time spent on the platform in minutes
 *         resourcesAccessed:
 *           type: number
 *           description: Number of resources accessed
 *         assignmentsCompleted:
 *           type: number
 *           description: Number of assignments completed
 *         averageGrade:
 *           type: number
 *           description: Average grade across all assignments
 *         weeklyActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               week:
 *                 type: string
 *               activityCount:
 *                 type: number
 *           description: Weekly activity tracking
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         student: 60d0fe4f5311236168a109cb
 *         course: 60d0fe4f5311236168a109cc
 *         loginCount: 25
 *         timeSpent: 320
 *         resourcesAccessed: 15
 *         assignmentsCompleted: 5
 *         averageGrade: 85.5
 *         weeklyActivity: [
 *           {
 *             week: "2023-01-01",
 *             activityCount: 10
 *           },
 *           {
 *             week: "2023-01-08",
 *             activityCount: 15
 *           }
 *         ]
 *
 *     CourseAnalytics:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the analytics record
 *         course:
 *           type: string
 *           description: ID of the course
 *         enrollmentCount:
 *           type: number
 *           description: Number of students enrolled
 *         completionRate:
 *           type: number
 *           description: Percentage of students who completed the course
 *         averageGrade:
 *           type: number
 *           description: Average grade across all students
 *         assignmentSubmissionRate:
 *           type: number
 *           description: Percentage of assignments submitted
 *         weeklyEngagement:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               week:
 *                 type: string
 *               engagementCount:
 *                 type: number
 *           description: Weekly engagement tracking
 *       example:
 *         _id: 60d0fe4f5311236168a109cd
 *         course: 60d0fe4f5311236168a109cc
 *         enrollmentCount: 50
 *         completionRate: 85
 *         averageGrade: 78.3
 *         assignmentSubmissionRate: 92
 *         weeklyEngagement: [
 *           {
 *             week: "2023-01-01",
 *             engagementCount: 120
 *           },
 *           {
 *             week: "2023-01-08",
 *             engagementCount: 150
 *           }
 *         ]
 */

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting
 */

/**
 * @swagger
 * /api/analytics/student/dashboard:
 *   get:
 *     summary: Get student dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrolledCourses:
 *                   type: number
 *                 completedAssignments:
 *                   type: number
 *                 averageGrade:
 *                   type: number
 *                 upcomingAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       course:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       details:
 *                         type: object
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/analytics/student/course/{courseId}:
 *   get:
 *     summary: Get student analytics for a specific course
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Student course analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentAnalytics'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/analytics/student/activity:
 *   post:
 *     summary: Track student activity
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityType
 *             properties:
 *               activityType:
 *                 type: string
 *                 enum: [login, resource_access, assignment_view, course_view]
 *               courseId:
 *                 type: string
 *               resourceId:
 *                 type: string
 *               timeSpent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Activity tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activity tracked successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/analytics/course/{courseId}:
 *   get:
 *     summary: Get course analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseAnalytics'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/analytics/lecturer/dashboard:
 *   get:
 *     summary: Get lecturer dashboard analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lecturer dashboard analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCourses:
 *                   type: number
 *                 totalStudents:
 *                   type: number
 *                 pendingGrading:
 *                   type: number
 *                 coursePerformance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       averageGrade:
 *                         type: number
 *                       completionRate:
 *                         type: number
 *                 recentSubmissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       student:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       assignment:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized access
 */