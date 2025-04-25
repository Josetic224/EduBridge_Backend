const jwt = require("jsonwebtoken");
const { unAuthenticated } = require("../helpers/error");
require("dotenv").config();
const BlacklistToken = require("../models/logout");
const User = require("../models/User");

/**
 * Flexible authentication middleware that tries multiple secrets
 * This is a temporary solution for handling tokens signed with different secrets
 */
const flexibleAuthentication = async (req, res, next) => {
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
      return unAuthenticated(res, "You need to login first.");
    }

    // Check if the token is blacklisted
    const isBlacklisted = await BlacklistToken.exists({token});
    if (isBlacklisted) {
      return res.status(401).json({
        error: "You logged-out; Please log in again.",
      });
    }

    // List of possible secrets to try
    const possibleSecrets = [
      process.env.JWT_SECRET,
      process.env.REFRESH_TOKEN,
      process.env.RESET_PASSWORD,
      process.env.TOKEN_SECRET_KEY,
      "JFDOOWJWRLWN", // Hardcoded current JWT_SECRET
      "fihffhwfffkf", // Hardcoded current REFRESH_TOKEN
      "wfkfwfknfknfkn", // Hardcoded current RESET_PASSWORD
      "fkhfwkwfkwhf", // Hardcoded current TOKEN_SECRET_KEY
    ];

    let decoded = null;
    let usedSecret = null;

    // Try each secret until one works
    for (const secret of possibleSecrets) {
      try {
        decoded = jwt.verify(token, secret);
        usedSecret = secret;
        break;
      } catch (err) {
        // Continue to next secret
      }
    }

    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid token: Could not verify with any known secret" 
      });
    }

    console.log("Token verified with secret:", usedSecret);
    console.log("Decoded token:", decoded);

    // Extract user ID from the token
    let userId;
    if (decoded.user && decoded.user.userId) {
      userId = decoded.user.userId;
    } else if (decoded.user && decoded.user.id) {
      userId = decoded.user.id;
    } else if (decoded.id) {
      userId = decoded.id;
    } else {
      return res.status(401).json({ 
        success: false,
        error: "Invalid token structure: User ID not found" 
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Flexible auth middleware error:", error.message);
    return res.status(500).json({ 
      success: false,
      error: "Authentication error: " + error.message 
    });
  }
};

module.exports = {
  flexibleAuthentication,
};