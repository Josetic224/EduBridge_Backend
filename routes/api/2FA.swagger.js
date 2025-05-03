/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and 2FA
 */

/**
 * @swagger
 * /api/student/setup-2FA:
 *   post:
 *     summary: Set up two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2FA setup successful
 *                 qrCodeUrl:
 *                   type: string
 *                   description: QR code URL for scanning with authenticator app
 *                 secret:
 *                   type: string
 *                   description: Secret key for manual entry
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/student/verify-2FA:
 *   post:
 *     summary: Verify two-factor authentication token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               token:
 *                 type: string
 *                 description: 2FA token from authenticator app
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2FA verification successful
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/student/2FA-login:
 *   post:
 *     summary: Complete login with 2FA
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               token:
 *                 type: string
 *                 description: 2FA token from authenticator app
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid token
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/student/deactivate-2FA:
 *   post:
 *     summary: Deactivate two-factor authentication
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2FA deactivated successfully
 *       401:
 *         description: Unauthorized access
 */