/**
 * @swagger
 * tags:
 *   - name: Socket
 *     description: Socket.IO related endpoints
 */

/**
 * @swagger
 * /api/socket/test-message:
 *   post:
 *     summary: Test socket message sending
 *     tags: [Socket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - data
 *             properties:
 *               event:
 *                 type: string
 *                 description: Socket event name
 *                 example: test_event
 *               data:
 *                 type: object
 *                 description: Data to send with the event
 *                 example:
 *                   message: Hello from the API
 *                   timestamp: 1623456789
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Socket message sent successfully
 *       400:
 *         description: Invalid request parameters
 */