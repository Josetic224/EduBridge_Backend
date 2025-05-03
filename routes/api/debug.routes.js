const express = require("express");
const { Router } = express;
const {
    verifyToken,
    generateToken
} = require("../../controllers/debug.controller");

const debugRouter = Router();

// Debug endpoints
debugRouter.post("/verify-token", verifyToken);
debugRouter.post("/generate-token", generateToken);

module.exports = debugRouter;