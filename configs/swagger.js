const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduBridge API Documentation',
      version: '1.0.0',
      description: 'API documentation for the EduBridge Backend',
      contact: {
        name: 'EduBridge Support',
        email: 'support@edubridge.example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:7001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  apis: [
    './routes/**/*.js',
    './routes/**/*.swagger.js',
    './controllers/**/*.js',
    './models/**/*.js',
    './middlewares/**/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at /api-docs`);
};

module.exports = { swaggerDocs };