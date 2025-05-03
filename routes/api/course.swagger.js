/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - code
 *         - lecturer
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the course
 *         title:
 *           type: string
 *           description: Course title
 *         code:
 *           type: string
 *           description: Course code
 *         description:
 *           type: string
 *           description: Course description
 *         lecturer:
 *           type: string
 *           description: ID of the lecturer
 *         enrolledStudents:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of enrolled student IDs
 *         materials:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *           description: Course materials
 *         isEnrollmentOpen:
 *           type: boolean
 *           description: Whether enrollment is open for the course
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Course creation date
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         title: Introduction to Computer Science
 *         code: CS101
 *         description: An introductory course to computer science
 *         lecturer: 60d0fe4f5311236168a109cb
 *         enrolledStudents: [60d0fe4f5311236168a109cc, 60d0fe4f5311236168a109cd]
 *         materials: [
 *           {
 *             title: Week 1 Slides,
 *             url: https://example.com/slides.pdf,
 *             type: pdf
 *           }
 *         ]
 *         isEnrollmentOpen: true
 *         createdAt: 2023-01-01T00:00:00.000Z
 *
 *     Assignment:
 *       type: object
 *       required:
 *         - title
 *         - course
 *         - dueDate
 *         - totalPoints
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the assignment
 *         title:
 *           type: string
 *           description: Assignment title
 *         description:
 *           type: string
 *           description: Assignment description
 *         course:
 *           type: string
 *           description: ID of the course
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Assignment due date
 *         totalPoints:
 *           type: number
 *           description: Total points for the assignment
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               filename:
 *                 type: string
 *           description: Assignment attachments
 *         allowLateSubmissions:
 *           type: boolean
 *           description: Whether late submissions are allowed
 *         latePenalty:
 *           type: number
 *           description: Penalty percentage for late submissions
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Assignment creation date
 *       example:
 *         _id: 60d0fe4f5311236168a109ce
 *         title: Homework 1
 *         description: Complete exercises 1-5
 *         course: 60d0fe4f5311236168a109ca
 *         dueDate: 2023-01-15T23:59:59.000Z
 *         totalPoints: 100
 *         attachments: [
 *           {
 *             url: https://example.com/homework.pdf,
 *             filename: homework1.pdf
 *           }
 *         ]
 *         allowLateSubmissions: true
 *         latePenalty: 10
 *         createdAt: 2023-01-01T00:00:00.000Z
 *
 *     Submission:
 *       type: object
 *       required:
 *         - student
 *         - assignment
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the submission
 *         student:
 *           type: string
 *           description: ID of the student
 *         assignment:
 *           type: string
 *           description: ID of the assignment
 *         content:
 *           type: string
 *           description: Submission content
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               filename:
 *                 type: string
 *           description: Submission attachments
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Submission date
 *         isLate:
 *           type: boolean
 *           description: Whether the submission is late
 *         grade:
 *           type: number
 *           description: Submission grade
 *         feedback:
 *           type: string
 *           description: Feedback from the lecturer
 *         status:
 *           type: string
 *           enum: [submitted, graded]
 *           description: Submission status
 *       example:
 *         _id: 60d0fe4f5311236168a109cf
 *         student: 60d0fe4f5311236168a109cc
 *         assignment: 60d0fe4f5311236168a109ce
 *         content: My submission for Homework 1
 *         attachments: [
 *           {
 *             url: https://example.com/submission.pdf,
 *             filename: submission.pdf
 *           }
 *         ]
 *         submittedAt: 2023-01-14T20:00:00.000Z
 *         isLate: false
 *         grade: 95
 *         feedback: Great work!
 *         status: graded
 */

/**
 * @swagger
 * tags:
 *   - name: Courses
 *     description: Course management
 *   - name: Assignments
 *     description: Assignment management
 *   - name: Submissions
 *     description: Submission management
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - code
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               isEnrollmentOpen:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, lecturer]
 *         description: Filter courses by user role
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
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
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 *
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               isEnrollmentOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course updated successfully
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 *
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course deleted successfully
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/courses/{courseId}/assignments:
 *   post:
 *     summary: Create a new assignment for a course
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the course
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *               - totalPoints
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               totalPoints:
 *                 type: number
 *               allowLateSubmissions:
 *                 type: boolean
 *               latePenalty:
 *                 type: number
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assignment created successfully
 *                 assignment:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 *
 *   get:
 *     summary: Get all assignments for a course
 *     tags: [Assignments]
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
 *         description: List of assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assignments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Assignment'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/assignments/{assignmentId}/submit:
 *   post:
 *     summary: Submit an assignment
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the assignment
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Assignment submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assignment submitted successfully
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Assignment not found
 */

/**
 * @swagger
 * /api/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the submission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Submission graded successfully
 *                 submission:
 *                   $ref: '#/components/schemas/Submission'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Submission not found
 */