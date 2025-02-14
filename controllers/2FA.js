const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");
const { decodeToken } = require("../helpers/token");
const { twoFA_Schema } = require("../validations/user");

exports.setup2FA = async (req, res) => {
  try {
    // Log the full authorization header
    console.log("Full Auth Header:", req.headers.authorization);

    // Extract the Bearer token
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Extracted token:", token);

    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Log environment variable status
    console.log("JWT_SECRET configured:", !!process.env.JWT_SECRET);
    console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);

    // Decode and validate token
    const decodedResult = decodeToken(token, process.env.JWT_SECRET);
    console.log("Full decode result:", decodedResult);

    if (decodedResult.error) {
      return res.status(401).json({ error: decodedResult.error });
    }

    // Extract user information from decoded token
    const { userId, email } = decodedResult.user;

    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `EduBridge:${email}`, // This will show up in the authenticator app
    });

    // Save the secret to user's record
    user.twoFactorSecret = secret.base32;
    user.isTwoFactorEnabled = false; // Will be set to true after verification
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Return success response with QR code
    return res.status(200).json({
      message:
        "2FA setup initiated. Scan the QR code with your authenticator app.",
      qrCodeUrl,
      tempSecret: secret.base32, // This will be needed for verification
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return res.status(500).json({
      error: "Failed to setup 2FA",
      details: error.message,
    });
  }
};
exports.verify2FA = async (req, res) => {
  try {
    // Validate request body
    const body = twoFA_Schema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }
    const { totp } = body.data;

    // Extract the Bearer token from headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Decode and validate token
    const { user, error } = decodeToken(token, process.env.JWT_SECRET);
    if (error) {
      return res.status(401).json({ error });
    }

    // Access user information from the decoded token
    const userId = user.id;

    // Get the user's 2FA secret from the database
    const getUser = await User.findById(userId);
    if (!getUser || !getUser.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user." });
    }

    // Verify the provided token
    const isVerified = speakeasy.totp.verify({
      secret: getUser.twoFactorSecret,
      encoding: "base32",
      token: totp, // Note: Fix here to match speakeasy's `token` parameter
    });

    if (!isVerified) {
      return res.status(401).json({ error: "Invalid 2FA code." });
    }

    // If verification is successful
    return res.status(200).json({ message: "2FA verification successful." });
  } catch (error) {
    console.log("2FA Verification Error=>", error);
    return res.status(500).json({ error: "Server error." });
  }
};
