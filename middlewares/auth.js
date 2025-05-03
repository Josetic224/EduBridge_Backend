const jwt = require("jsonwebtoken");
const { unAuthenticated } = require("../helpers/error");
require("dotenv").config();
const BlacklistToken = require("../models/logout");


const isAuthenticated = async (req, res, next) => {
  // Check if token exists
  let token;
  if (
    req.headers["authorization"] &&
    req.headers["authorization"].split(" ")[0] === "Bearer"
  ) {
    token = req.headers["authorization"].split(" ")[1];
  }

  try {
    if (!token) {
      return unAuthenticated(res, "You need to login first." );
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user information in the request object
    req.user = {
      id: decoded.user.userId,
      email: decoded.user.email
    };

    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistToken.exists({token});
    // console.log("BLACKLISTED TOKEN=>", isBlacklisted);
    
    if (isBlacklisted) {
      return res.status(401).json({
        error: "You logged-out; Please log in again.",
      });
    } 
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = {
  isAuthenticated,
};
