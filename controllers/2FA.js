const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require("../models/User");
const {decodeToken } = require('../helpers/token');
const { twoFA_Schema } = require('../validations/user');


exports.setup2FA = async (req, res) => {
    try {
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
      const email = user.email  // Make sure the JWT contains the email
      const userId = user.id; // Or use ID if you prefer
  
      // Generate a secret key for 2FA
      const secret = speakeasy.generateSecret({
        name: `EduBridge (${email})`, // Use the user's email
      });
  
      // Save the secret to the user's database record
      const updateuser = await User.findById(userId);
      console.log("USER=>", updateuser);
      if (!updateuser) {
        return res.status(404).json({ error: "User not found."});
      }
  
      updateuser.twoFactorSecret = secret.base32;
      updateuser.isTwoFactorEnabled = true;
      await updateuser.save();
  
      // Generate a QR code for the user
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
      return res.status(200).json({
        message: "2FA setup successful. Scan the QR code with your authenticator app.",
        qrCodeUrl,
      });
    } catch (error) {
      console.error("2FA Setup Error:", error);
      res.status(500).json({ error: "Server error." });
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
  