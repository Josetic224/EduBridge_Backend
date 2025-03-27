require("module-alias/register");
require("reflect-metadata");

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require("cors");
const db = require("../configs/dbConfig");
const {AppError} = require("../helpers/error");
const { logger, expressPinoLogger } = require("../utils/logger.util");
const {Server} = require("socket.io");
const socketHandler = require("../sockets/socketHandler");
const socketController = require("../controllers/socket.controller");
require("dotenv").config();


//App Init
const app = express();

//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressPinoLogger({ logger }));

// Create HTTP server
const http = require('http').createServer(app);

// Initialize Socket.IO
const io = new Server(http, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Initialize socket controller with io instance
socketController.initialize(io);

// Socket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Authenticate socket connection
    socket.on('authenticate', (token) => {
        try {
            const decoded = decodeToken(token, process.env.JWT_SECRET);
            const userId = decoded?.user?.userId;
            if (userId) {
                socket.join(userId); // Join user to their private room
                socket.emit('authenticated', { success: true });
            }
        } catch (error) {
            socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

//App Home Route
app.get("/", (req, res) => {
  res.send("Welcome to Edubridge Backend");
});

//Register Routes
require("../routes/index.routes")(app);

//calling the db connection
db();

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