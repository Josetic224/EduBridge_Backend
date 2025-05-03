/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the chat room
 *         name:
 *           type: string
 *           description: Name of the chat room
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs participating in the chat
 *         course:
 *           type: string
 *           description: ID of the associated course (if applicable)
 *         isEscalated:
 *           type: boolean
 *           description: Whether the chat has been escalated to a lecturer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Chat room creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Chat room last update date
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         name: Course Support Chat
 *         participants: [60d0fe4f5311236168a109cb, 60d0fe4f5311236168a109cc]
 *         course: 60d0fe4f5311236168a109cd
 *         isEscalated: false
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-02T00:00:00.000Z
 *
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the message
 *         chatRoom:
 *           type: string
 *           description: ID of the chat room
 *         sender:
 *           type: string
 *           description: ID of the user who sent the message
 *         content:
 *           type: string
 *           description: Message content
 *         isAI:
 *           type: boolean
 *           description: Whether the message was sent by an AI
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation date
 *       example:
 *         _id: 60d0fe4f5311236168a109ce
 *         chatRoom: 60d0fe4f5311236168a109ca
 *         sender: 60d0fe4f5311236168a109cb
 *         content: Hello, I have a question about the assignment.
 *         isAI: false
 *         createdAt: 2023-01-01T12:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   - name: Chats
 *     description: Chat management and messaging
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chat rooms for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatRooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/chats/escalated:
 *   get:
 *     summary: Get all escalated chats (for lecturers only)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of escalated chat rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatRooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatRoom'
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Forbidden - User is not a lecturer
 */

/**
 * @swagger
 * /api/chats/{chatRoomId}/messages:
 *   get:
 *     summary: Get messages for a specific chat room
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat room
 *     responses:
 *       200:
 *         description: List of messages in the chat room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Chat room not found
 *
 *   post:
 *     summary: Send a message in a chat room
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Chat room not found
 */