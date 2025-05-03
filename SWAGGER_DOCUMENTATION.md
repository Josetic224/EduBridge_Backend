# Swagger API Documentation for EduBridge Backend

This document explains how to use and extend the Swagger API documentation for the EduBridge Backend project.

## Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:7001/api-docs
```

This interactive documentation allows you to:
- Browse all available API endpoints
- See request and response schemas
- Test API endpoints directly from the browser
- Understand authentication requirements

## How Swagger is Implemented

The Swagger documentation is implemented using:
- `swagger-jsdoc`: For parsing JSDoc comments in your code
- `swagger-ui-express`: For rendering the Swagger UI

The main configuration is in `/configs/swagger.js`, which sets up:
- API information
- Server URLs
- Security schemes
- Paths to scan for documentation

## How to Document New Endpoints

To document new endpoints, add JSDoc comments above your route definitions. Here's an example:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description of what this endpoint does
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []  // If the endpoint requires authentication
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Description of the parameter
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   type: string
 *                   example: Example value
 *       400:
 *         description: Bad request error
 *       401:
 *         description: Unauthorized error
 */
```

## Documenting Models

Models (schemas) should be documented at the top of your route files or in separate swagger files:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourModel:
 *       type: object
 *       required:
 *         - requiredField
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         requiredField:
 *           type: string
 *           description: Description of the field
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         requiredField: Example value
 */
```

## File Organization

The Swagger documentation is organized as follows:
- Core configuration in `/configs/swagger.js`
- Route documentation in JSDoc comments in route files
- Additional documentation in separate `.swagger.js` files in the routes directory

## Authentication in Swagger

The documentation is set up to use JWT Bearer authentication. To test authenticated endpoints:
1. Get a token by using the login endpoint
2. Click the "Authorize" button in the Swagger UI
3. Enter your token in the format: `Bearer your-token-here`
4. Click "Authorize" to apply the token to all requests

## Extending the Documentation

To add more details to the documentation:
1. Edit `/configs/swagger.js` to update general information
2. Add more JSDoc comments to your routes
3. Create additional `.swagger.js` files for complex documentation

## Best Practices

- Keep documentation close to the code it documents
- Use consistent naming and formatting
- Include examples for request and response bodies
- Document all possible response codes
- Group related endpoints under the same tag
- Use schemas to avoid repeating the same structures