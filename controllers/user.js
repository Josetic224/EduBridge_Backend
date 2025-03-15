const { encrypt, compare } = require("../helpers/auth");
const { getSecondsBetweenTime, timeDifference } = require("../helpers/date");
const {
  fetchCountriesData,
  fetchUniversitiesByCountry,
} = require("../helpers/fetchCountries");
const {
  createAccountOtp,
  welcomeEmail,
  resetPasscodeOtp,
  changeEmailOtp,
} = require("../helpers/mails/otp");
const {
  generateOTP,
  generateRefreshToken,
  generateToken,
  decodeToken,
  generateTempToken,
} = require("../helpers/token");
const User = require("../models/User");
const { validateUser } = require("../services/auth");
const sendEmail = require("../services/email");
const speakeasy = require("speakeasy");
const {
  UserSchema,
  VerifyUserSchema,
  LoginUserSchema,
  VerifyPasswordOtpSchema,
  ResetPasswordSchema,
  setPasscodeSchema,
  VerifyPasscodeOtpSchema,
  twoFA_Schema,
  editEmailSchema,
} = require("../validations/user");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const multer = require('multer');
const {badRequest, notFound, formatServerError} = require("../helpers/error")
const BlacklistToken = require("../models/logout")
const cloudinary = require("../services/cloudinary");
const {CloudinaryStorage} = require("multer-storage-cloudinary")

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_pictures", // Folder name in Cloudinary
    format: async (req, file) => "png", // Convert all images to PNG
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

exports.fetchCountries = async (req, res) => {
  try {
    const countries = await fetchCountriesData();
    res.status(200).json(countries);
  } catch (error) {
    console.error("Error in fetchCountries route:", error.message);
    res.status(500).json({ message: "Failed to fetch countries" });
  }
};

// Controller function to handle fetching universities by country
exports.getUniversitiesByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    if (!country || typeof country !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing country name." });
    }

    const universities = await fetchUniversitiesByCountry(country);
    return res.status(200).json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error.message);
    return res.status(500).json({ message: "Failed to fetch universities." });
  }
};

exports.createUser = async (req, res) => {
  const body = UserSchema.safeParse(req.body);

  if (!body.success) {
    return res.status(404).json({
      errors: body.error.issues,
    });
  }

  const { userName, email, password, role, university, country } = body.data;

  try {
    const checkUserName = await User.findOne({ userName });
    if (checkUserName) {
      return badRequest(res, "Username already taken");
    }
    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      return badRequest(res, "Email already taken");
    }

    if (!["STUDENT", "LECTURER"].includes(role)) {
      return res.status(400).json({ error: "Invalid Role" });
    }
    const universities = await fetchUniversitiesByCountry(country);
    universities.forEach((university) => {
      console.log(university.name);
    });

    // Check if the selected university is in the list of universities by matching the name
    const universityExists = universities.some(
      (uni) => uni.name === university
    );

    if (!universityExists) {
      return res.status(404).json("Invalid university selected.");
    }

    body.data.password = await encrypt(password);

    const otpValue = generateOTP();
    const otp = await encrypt(otpValue);

    const user = new User({
      ...body.data,
      otp,
      otpExpireIn: new Date().getTime() + 30 * 60 * 1000,
    });

    // Send OTP email on signup
    const otpData = {
      to: email,
      text: "EduBridge OTP Verification",
      subject: "Kindly Verify Your Account",
      html: createAccountOtp(otpValue),
    };

    await sendEmail(otpData);

    // After 30 seconds, send the welcome email
    setTimeout(async () => {
      const welcomeEmailData = {
        to: email,
        text: "Welcome To Edubridge",
        subject: "We're pleased to have you onboard.",
        html: welcomeEmail(userName),
      };
      await sendEmail(welcomeEmailData);
    }, 30000);

    const refreshToken = generateRefreshToken(user._id);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: process.env.NODE_ENV === "development" ? false : true,
      maxAge: 240 * 60 * 60 * 1000,
    });

    await user.save();

    res.status(201).json({
      msg: "account created",
      user,
    });
  } catch (error) {
    console.log("CREATE USER ERROR=>", error);
    res.status(500).json(error.message);
  }
};

// VERIFY NEWLY CREATED USER
exports.verifyUser = async (req, res) => {
  const body = VerifyUserSchema.safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({
      errors: body.error.issues,
    });
  }

  const { email, otp, requestResend } = body.data;

  try {
    if (requestResend) {
      // Generate a new OTP
      const newOtpValue = generateOTP(); // Assuming you have a function to generate OTP

      // Send the new OTP to the user's email
      const data = {
        to: email,
        text: "Edubridge Forgot Password OTP",
        subject: "New OTP To Reset Your Password",
        html: createAccountOtp(newOtpValue), // Assuming you have a function to create OTP HTML
      };
      await sendEmail(data);

      // Update the user's OTP in the database (assuming you have a function to do this)
      await updateUserOtp(email, newOtpValue);

      return res.status(200).json({ message: `New OTP sent to ${email}` });
    }

    // If not a resend request, proceed with OTP verification
    const { error, user } = await validateUser(email, otp);

    if (error) {
      return badRequest(res, error);
    }

    // Your logic for verifying the user
    // For example, update the 'verified' field in the database
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      verified: user.isVerified,
      msg: "User verified",
    });
  } catch (error) {
    console.log("VERIFY USER ERROR=>", error);
    res.status(500).json({
      errors: [
        {
          error: "Server Error",
        },
      ],
    });
  }
};

const UAParser = require("ua-parser-js"); // Install this package: npm install ua-parser-js

exports.userLogin = async (req, res) => {
  const body = LoginUserSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({
      error: body.error.issues,
    });
  }

  const { email, password, passcode } = body.data;
  try {
    const checkUser = await User.findOne({
      email: email,
    });

    if (!checkUser) {
      return badRequest(res, "Incorrect credentials");
    }

    const checkPassword = password
      ? await compare(password, checkUser.password)
      : false;
    const checkPasscode = passcode
      ? await compare(passcode, checkUser.passcode)
      : false;

    if (!checkPassword && !checkPasscode) {
      return badRequest(res, "Incorrect credentials");
    }

    //TO CHECK IF USER'S VERIFICATION IS COMPLETE
    const verifiedUser = checkUser.verified;
    if (verifiedUser === false) {
      return res.status(400).json({
        error: "User not verified, please verify your account",
      });
    }

    // Get device and location information
    const parser = new UAParser(req.headers["user-agent"]);
    const userAgent = parser.getResult();

    // Get IP address
    const ip =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    // Create login info object
    const loginInfo = {
      device: {
        browser: userAgent.browser.name || "Unknown",
        browserVersion: userAgent.browser.version || "Unknown",
        os: userAgent.os.name || "Unknown",
        osVersion: userAgent.os.version || "Unknown",
        device: userAgent.device || "Unknown",
        deviceType: userAgent.device.type || "Desktop",
      },
      ip: ip,
      timestamp: new Date(),
      location: "Unknown", // You can add IP geolocation here if needed
    };

    // Convert user ID to string
    const userId = checkUser._id.toString();

    // Save login history to user document
    if (!checkUser.loginHistory) {
      checkUser.loginHistory = [];
    }
    checkUser.loginHistory.push(loginInfo);

    // Keep only last 10 login records
    if (checkUser.loginHistory.length > 10) {
      checkUser.loginHistory = checkUser.loginHistory.slice(-10);
    }

    await checkUser.save();

    // Check if 2FA is enabled
    if (checkUser.isTwoFactorEnabled) {
      // Generate a temporary token for 2FA verification
      const tempToken = generateToken(userId, email);

      console.log("Generated temp token for 2FA:", {
        userId,
        email,
        token: tempToken,
      });

      return res.status(200).json({
        message: "2FA required. Please verify with your 2FA code.",
        tempToken,
        loginInfo,
        checkUser,
      });
    }

    // Regular login if 2FA is not enabled
    const authToken = generateToken(userId, email);

    console.log("Generated auth token:", {
      userId,
      email,
      token: authToken,
    });

    return res.status(200).json({
      message: "Login successful.",
      authToken,
      checkUser,
      loginInfo,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server Error",
      details: error.message,
    });
  }
};
//FINAL LOGIN FOR 2FA ONLY

exports.finalizeLogin = async (req, res) => {
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

    // Decode the tempToken to get the user ID
    const decoded = decodeToken(token, process.env.JWT_SECRET);
    // console.log(decoded)
    const userId = decoded.user?.userId;
    console.log(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid or expired temporary token." });
    }

    // Verify the 2FA code
    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: totp,
      window: 1, // Accepts past and future codes
    });

    console.log(isVerified);
    if (!isVerified) {
      return res.status(401).json({ error: "Invalid 2FA code.", Error });
    }

    // Issue the actual authentication token
    const authToken = generateToken(user._id, user.email);

    return res
      .status(200)
      .json({ message: "Login successful.", authToken, user });
  } catch (error) {
    console.log("Finalize Login Error=>", error);
    res.status(500).json({ error: "Server error." });
  }
};

// RESEND VERIFIICATION OTP
exports.resendVerificationOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp) {
      // Clear the already existing otp and create another one.
      user.otp = undefined;
      user.otpExpireIn = undefined;
      await user.save();
    }
    // Generate a new OTP
    const newOTP = generateOTP();
    const otp = await encrypt(newOTP);

    // Update user's OTP and OTP expiration
    user.otp = otp;
    user.otpExpireIn = new Date().getTime() + 30 * 60 * 1000;
    await user.save();

    // Send the new verification code to the user
    const data = {
      to: email,
      text: "Edubridge resend OTP Verification",
      subject: "Kindly Verify Your Account",
      html: createAccountOtp(newOTP),
    };
    await sendEmail(data);

    res.status(200).json({ message: "New verification code sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.editEmail = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    let decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if new email is already taken by another user
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== userId) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const otpValue = generateOTP();
    const otp = await encrypt(otpValue);

    user.otp = otp;
    user.otpExpireIn = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    const data = {
      to: email,
      text: "Edubridge Email Update OTP",
      subject: "OTP To Confirm Email Update",
      html: changeEmailOtp(otpValue),
    };
    await sendEmail(data);

    return res.status(200).json({
      message:
        "OTP sent to the new email. Please verify to complete the change.",
    });
  } catch (error) {
    console.error("EDIT EMAIL ERROR =>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.confirmEmailChange = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authorization token is missing." });

    const decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) return res.status(400).json({ error: "Invalid token: user ID missing." });

    const { newEmail, otp } = req.body;
    if (!newEmail || !otp) return res.status(400).json({ error: "New email and OTP are required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.otp || !user.otpExpireIn || Date.now() > user.otpExpireIn) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists && emailExists._id.toString() !== userId) {
      return res.status(400).json({ error: "Email is no longer available." });
    }

    user.email = newEmail;
    user.otp = undefined;
    user.otpExpireIn = undefined;
    await user.save();

    return res.status(200).json({ message: "Email updated successfully", newEmail: user.email });
  } catch (error) {
    console.error("CONFIRM EMAIL CHANGE ERROR =>", error);
    return formatServerError(res, "Error confirming email change", error);
  }
};

// FORGOT PASSWORD
exports.forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        errors: [{ error: "User not found" }],
      });
    }

    const otpValue = generateOTP();
    console.log("Generated OTP (plain):", otpValue); // Debugging log

    const otp = await encrypt(otpValue);
    console.log("Encrypted OTP:", otp); // Debugging log

    user.otp = otp;
    user.otpExpireIn = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    console.log("User after saving OTP:", user); // Debugging log

    const data = {
      to: email,
      text: "Edubridge Forgot Password OTP",
      subject: "OTP To Reset Your Password",
      html: createAccountOtp(otpValue),
    };

    res.status(200).json({ msg: `OTP sent to ${email}` });
  } catch (error) {
    console.log("RESET PASSWORD ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

// VERIFY OTP FOR FORGOT PASSWORD (with resend feature)
exports.verifyForgotPasswordOtp = async (req, res) => {
  const body = VerifyPasswordOtpSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ errors: body.error.issues });
  }

  const { email, otp, requestResend } = body.data; // Expect `requestResend` from frontend

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user requests a resend, generate and send a new OTP
    if (
      requestResend ||
      !user.otp ||
      getSecondsBetweenTime(user.otpExpireIn) > timeDifference["2m"]
    ) {
      const newOtpValue = generateOTP();
      console.log("Generated New OTP (plain):", newOtpValue);

      const newOtp = await encrypt(newOtpValue);
      console.log("Encrypted New OTP:", newOtp);

      user.otp = newOtp;
      user.otpExpireIn = new Date().getTime() + 5 * 60 * 1000; // Reset expiry to 5 minutes
      await user.save();

      console.log("User after resending OTP:", user);

      const data = {
        to: email,
        text: "Edubridge Forgot Password OTP",
        subject: "New OTP To Reset Your Password",
        html: createAccountOtp(newOtpValue),
      };
      await sendEmail(data);

      return res.status(200).json({ message: `New OTP sent to ${email}` });
    }

    // Proceed with OTP verification
    console.log("Provided OTP:", otp);
    console.log("Stored Encrypted OTP:", user.otp);

    const isOtpValid = await compare(otp, user.otp);
    console.log("Is OTP valid:", isOtpValid);

    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP Verified!" });
  } catch (error) {
    console.log("VERIFY OTP ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

// TO RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const body = ResetPasswordSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ errors: body.error.issues });
  }
  const { email, newPassword, repeatPassword } = body.data;

  if (newPassword !== repeatPassword) {
    return res
      .status(400)
      .json({ errors: [{ error: "Passwords do not match" }] });
  }
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    console.log("USER ASKING TO RESET PASSSWORD=>", user);
    if (!user) {
      return notFound(res, "User not found");
    }

    // Check if the new password is the same as the previous password
    const isSamePassword = await compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        errors: [
          { error: "New Password cannot be the same as the previous one." },
        ],
      });
    }

    // Encrypt the new password
    const newPasswordHash = await encrypt(newPassword);
    // Update the user's password with the new encrypted password
    user.password = newPasswordHash;
    await user.save();
    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    console.log("RESET PASSWORD ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.setPasscode = async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Decode and validate token
    const { user, error } = decodeToken(token, process.env.JWT_SECRET);
    if (error) {
      return res.status(401).json({ error });
    }

    // Extract user ID (Fix applied)
    const userId = user.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    // Find the user using the extracted user ID
    const userRecord = await User.findById(userId);
    if (!userRecord) {
      return res.status(404).json({ error: "User not found." });
    }
    
    // Validate request body
    const body = setPasscodeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }

    const { passcode, confirmPasscode } = body.data;

    // Compare passcodes
    if (!passcode || !confirmPasscode || passcode !== confirmPasscode) {
      return res.status(400).json({
        errors: [{ error: "Passcodes do not match or are missing." }],
      });
    }

    // Encrypt and save passcode
    const hashedPasscode = await encrypt(passcode);
    userRecord.passcode = hashedPasscode;
    userRecord.isPasscodeSet = true;
    await userRecord.save();

    return res
      .status(200)
      .json({ message: "Passcode has been successfully set." });
  } catch (error) {
    console.log("SET PASSCODE ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.forgotPasscodeOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        errors: [{ error: "User not found" }],
      });
    }

    const otpValue = generateOTP();
    console.log("Generated OTP (plain):", otpValue); // Debugging log

    const otp = await encrypt(otpValue);
    console.log("Encrypted OTP:", otp); // Debugging log

    user.otp = otp;
    user.otpExpireIn = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiry
    await user.save();

    console.log("User after saving OTP:", user); // Debugging log

    const data = {
      to: email,
      text: "Edubridge Forgot Passcode OTP",
      subject: "OTP To Reset Your Passcode",
      html: createAccountOtp(otpValue),
    };
    await sendEmail(data);

    res.status(200).json({ msg: `OTP sent to ${email}` });
  } catch (error) {
    console.log("RESET PASSCODE ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};
exports.verifyForgotPasscodeOtp = async (req, res) => {
  const body = VerifyPasscodeOtpSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ errors: body.error.issues });
  }

  const { email, otp, requestResend } = body.data; // Expect `requestResend`

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user.id.toString();
    const userEmail = user.email;
    console.log("User ID:", userId);
    console.log("User Email:", user.email);

    // If user requests a resend, generate and send a new OTP
    if (
      requestResend ||
      !user.otp ||
      getSecondsBetweenTime(user.otpExpireIn) > timeDifference["2m"]
    ) {
      const newOtpValue = generateOTP();
      console.log("Generated New OTP (plain):", newOtpValue);

      const newOtp = await encrypt(newOtpValue);
      console.log("Encrypted New OTP:", newOtp);

      user.otp = newOtp;
      user.otpExpireIn = new Date().getTime() + 5 * 60 * 1000; // Reset expiry to 5 minutes
      await user.save();

      console.log("User after resending OTP:", user);

      const data = {
        to: email,
        text: "Edubridge Forgot Passcode OTP",
        subject: "New OTP To Reset Your Passcode",
        html: resetPasscodeOtp(newOtpValue),
      };
      await sendEmail(data);

      return res.status(200).json({ message: `New OTP sent to ${email}` });
    }

    // Proceed with OTP verification
    console.log("Provided OTP:", otp);
    console.log("Stored Encrypted OTP:", user.otp);

    const isOtpValid = await compare(otp, user.otp);
    console.log("Is OTP valid:", isOtpValid);

    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    // Generate temporary token upon successful OTP verification
    const tempToken = await generateToken(userId, userEmail);
    console.log("Generated tempToken:", tempToken);
    res.status(200).json({ message: "OTP Verified!" });
  } catch (error) {
    console.log("VERIFY OTP ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.resetPasscode = async (req, res) => {
  try {
    // Extract temporary token from headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Decode and validate token
    let decoded = decodeToken(token, process.env.JWT_SECRET);

    // Extract user ID from token
    const userId = decoded.user.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    // Find user in database
    const userRecord = await User.findById(userId);
    if (!userRecord) {
      return res.status(404).json({ error: "User not found." });
    }

    // Validate request body
    const body = setPasscodeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }

    const { passcode, confirmPasscode } = body.data;

    // Compare passcodes
    if (!passcode || !confirmPasscode || passcode !== confirmPasscode) {
      return res.status(400).json({
        errors: [{ error: "Passcodes do not match or are missing." }],
      });
    }

    // Encrypt and save passcode
    const hashedPasscode = await encrypt(passcode);
    userRecord.passcode = hashedPasscode;
    userRecord.isPasscodeSet = true;
    await userRecord.save();

    return res
      .status(200)
      .json({ message: "Passcode has been successfully reset." });
  } catch (error) {
    console.log("RESET PASSCODE ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.editUserName = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    let decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    const { userName } = req.body;
    if (!userName) {
      return res.status(400).json({ error: "Username is required." });
    }

    const checkUserName = await User.findOne({ userName });
    if (checkUserName && checkUserName._id.toString() !== userId) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Username updated successfully", user: updatedUser });
  } catch (error) {
    console.error("EDIT USERNAME ERROR =>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users (excluding sensitive data like passwords)
    const users = await User.find().select("-password");

    // Check if users exist
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("GET ALL USERS ERROR =>", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.deactivateAccount = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authorization token is missing." });

    const decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) return res.status(400).json({ error: "Invalid token: user ID missing." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.isActive) return res.status(400).json({ error: "Account is already deactivated." });

    user.isActive = false;
    await user.save();
    await BlacklistToken.create({ token });

    return res.status(200).json({ message: "Account deactivated successfully." });
  } catch (error) {
    console.error("DEACTIVATE ACCOUNT ERROR =>", error);
    return formatServerError(res, "Error deactivating account", error);
  }
};



// **Upload Profile Picture & Save Cloudinary URL**
exports.uploadProfilePic = async (req, res) => {
  upload.single("profilePic")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      // Extract token
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Authorization token is missing." });

      const decoded = decodeToken(token, process.env.JWT_SECRET);
      const userId = decoded?.user?.userId;
      if (!userId) return res.status(400).json({ error: "Invalid token: user ID missing." });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });

      // **Save Cloudinary URL instead of local path**
      user.profileImage = req.file.path;
      await user.save();

      return res.status(200).json({
        message: "Profile image uploaded successfully",
        profileImage: user.profileImage, // Hosted Cloudinary URL
      });
    } catch (error) {
      console.error("UPLOAD PROFILE ERROR =>", error);
      return formatServerError(res, "Error uploading profile picture", error);
    }
  });
};



exports.getProfilePic = async (req, res) => {
  try {
    // Extract token
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authorization token is missing." });

    const decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) return res.status(400).json({ error: "Invalid token: user ID missing." });

    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res.status(404).json({ error: "Profile image not found." });
    }

    return res.status(200).json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("GET PROFILE IMAGE ERROR =>", error);
    return res.status(500).json({ error: "Error fetching profile picture." });
  }
};


exports.getLecturerDetails = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
      return res.status(400).json({ error: "Invalid Lecturer ID format." });
    }

    const lecturer = await User.findOne(
      { _id: lecturerId, role: "LECTURER" },
      "userName email university country"
    );

    if (!lecturer) return res.status(404).json({ error: "Lecturer not found." });

    return res.status(200).json({ success: true, data: lecturer });
  } catch (error) {
    console.error("GET LECTURER DETAILS ERROR =>", error);
    return formatServerError(res, "Error fetching lecturer details", error);
  }
};



exports.deactivate2FA = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Authorization token is missing." });

    const decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) return res.status(400).json({ error: "Invalid token: user ID missing." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.isTwoFactorEnabled) {
      return res.status(400).json({ error: "2FA is already disabled." });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    return res.status(200).json({ message: "2FA deactivated successfully." });
  } catch (error) {
    console.error("DEACTIVATE 2FA ERROR =>", error);
    return formatServerError(res, "Error deactivating 2FA", error);
  }
};






module.exports = {
  fetchCountries: exports.fetchCountries,
  createUser: exports.createUser,
  verifyUser: exports.verifyUser,
  getAllUsers: exports.getAllUsers,
  userLogin: exports.userLogin,
  resendVerificationOTP: exports.resendVerificationOTP,
  verifyForgotPasswordOtp: exports.verifyForgotPasswordOtp,
  forgotPasswordOtp: exports.forgotPasswordOtp,
  resetPassword: exports.resetPassword,
  setPasscode: exports.setPasscode,
  forgotPasscodeOtp: exports.forgotPasscodeOtp,
  verifyForgotPasscodeOtp: exports.verifyForgotPasscodeOtp,
  editUserName: exports.editUserName,
  editEmail: exports.editEmail,
  resetPasscode: exports.resetPasscode,
  finalizeLogin: exports.finalizeLogin,
  getUniversitiesByCountry: exports.getUniversitiesByCountry,
  confirmEmailChange: exports.confirmEmailChange,
  deactivateAccount : exports.deactivateAccount,
  uploadProfilePic: exports.uploadProfilePic,
  getProfilePic: exports.getProfilePic,
  getLecturerDetails: exports.getLecturerDetails,
  deactivate2FA: exports.deactivate2FA,

};
