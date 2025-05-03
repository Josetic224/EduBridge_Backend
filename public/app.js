const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const db = require("../configs/dbConfig");
const {AppError} = require("../helpers/error");
const { logger, expressPinoLogger } = require("../utils/logger.util");
const initializeSocket = require("../socket");
const { swaggerDocs } = require("../configs/swagger");

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressPinoLogger({ logger }));

// Create HTTP server
const http = require('http').createServer(app);

// Initialize Socket.IO
const io = initializeSocket(http);
app.set('io', io); // Make io available to routes via req.app.get('io')

//App Home Route
app.get("/", (req, res) => {
  res.send("Welcome to Edubridge Backend");
});

//Register Routes
require("../routes/index.routes")(app);

//calling the db connection
db();

// Initialize Swagger documentation
swaggerDocs(app);

app.use((error, req, res, next) => {
    error.status = error.status || "error";
    error.statusCode = error.statusCode || 500;
  
    res.status(error.statusCode).json({
      errors: [
        {
          error: error.message,
        },
      ],
    });
});

// Export both app and http server
module.exports = { app, http };