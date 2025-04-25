const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Debug endpoint to verify a JWT token
 * @route POST /api/debug/verify-token
 * @access Public
 */
const verifyToken = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                error: "Token is required"
            });
        }
        
        // Try to decode the token without verification first
        const decoded = jwt.decode(token);
        
        console.log("Token payload (decoded without verification):", decoded);
        
        // Try to verify with current JWT_SECRET
        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json({
                success: true,
                message: "Token is valid",
                decoded: verified,
                verifiedWith: "JWT_SECRET"
            });
        } catch (error) {
            console.log("Verification with JWT_SECRET failed:", error.message);
            
            // If that fails, try some common secrets or empty string
            const commonSecrets = [
                "secret",
                "your-256-bit-secret",
                "your-secret-key",
                "JFDOOWJWRLWN", // Current JWT_SECRET
                "fihffhwfffkf", // Current REFRESH_TOKEN
                "wfkfwfknfknfkn", // Current RESET_PASSWORD
                "fkhfwkwfkwhf", // Current TOKEN_SECRET_KEY
                ""
            ];
            
            for (const secret of commonSecrets) {
                try {
                    const verified = jwt.verify(token, secret);
                    return res.status(200).json({
                        success: true,
                        message: "Token is valid with alternative secret",
                        decoded: verified,
                        verifiedWith: secret === process.env.JWT_SECRET ? "JWT_SECRET" : 
                                     secret === process.env.REFRESH_TOKEN ? "REFRESH_TOKEN" :
                                     secret === process.env.RESET_PASSWORD ? "RESET_PASSWORD" :
                                     secret === process.env.TOKEN_SECRET_KEY ? "TOKEN_SECRET_KEY" :
                                     "ALTERNATIVE_SECRET"
                    });
                } catch (err) {
                    // Continue to next secret
                }
            }
            
            // If all verification attempts fail
            return res.status(401).json({
                success: false,
                error: "Invalid token",
                decoded: decoded, // Still return the decoded payload for debugging
                originalError: error.message
            });
        }
    } catch (error) {
        console.error("Debug token verification error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to process token",
            details: error.message
        });
    }
};

/**
 * Debug endpoint to generate a new token
 * @route POST /api/debug/generate-token
 * @access Public
 */
const generateToken = async (req, res) => {
    try {
        const { userId, email } = req.body;
        
        if (!userId || !email) {
            return res.status(400).json({
                success: false,
                error: "userId and email are required"
            });
        }
        
        const payload = {
            user: {
                userId,
                email
            }
        };
        
        // Generate token with current JWT_SECRET
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "2d"
        });
        
        return res.status(200).json({
            success: true,
            token,
            payload
        });
    } catch (error) {
        console.error("Debug token generation error:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to generate token",
            details: error.message
        });
    }
};

module.exports = {
    verifyToken,
    generateToken
};