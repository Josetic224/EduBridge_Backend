/**
 * @swagger
 * tags:
 *   - name: Debug
 *     description: Debug endpoints (only for development)
 */

/**
 * @swagger
 * /api/debug/verify-token:
 *   post:
 *     summary: Verify a JWT token
 *     tags: [Debug]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to verify
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Whether the token is valid
 *                 decoded:
 *                   type: object
 *                   description: Decoded token payload (if valid)
 *       400:
 *         description: Invalid request parameters
 */

/**
 * @swagger
 * /api/debug/generate-token:
 *   post:
 *     summary: Generate a JWT token for testing
 *     tags: [Debug]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payload
 *             properties:
 *               payload:
 *                 type: object
 *                 description: Payload to include in the token
 *                 example:
 *                   userId: "60d0fe4f5311236168a109ca"
 *                   role: "student"
 *               expiresIn:
 *                 type: string
 *                 description: Token expiration time (e.g., "1h", "1d")
 *                 default: "1h"
 *     responses:
 *       200:
 *         description: Generated token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Generated JWT token
 *       400:
 *         description: Invalid request parameters
 */