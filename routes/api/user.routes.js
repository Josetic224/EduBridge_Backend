const express = require("express");

const {
  createUser,
  fetchCountries,
  verifyUser,
  userLogin,
  resendVerificationOTP,
  forgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  setPasscode,
  forgotPasscodeOtp,
  resetPasscode,
  finalizeLogin,
  getUniversitiesByCountry,
  editEmail,
  editUserName,
  getAllUsers,
  verifyForgotPasscodeOtp,
  deactivateAccount,
  uploadProfile, // Fixed function name
  getLecturerDetails,
  deactivate2FA,
} = require("../../controllers/user");

const { isAuthenticated } = require("../../middlewares/auth");

const { Router } = express;

const userRouter = Router();
const lecturerRouter = Router();
const countriesRouter = Router();
const universityRouter = Router();
const countryRouter = Router();

// User Registration & Account Management
userRouter.post("/register", createUser);
userRouter.put("/edit-email", isAuthenticated, editEmail);
userRouter.put("/edit-username", isAuthenticated, editUserName);
userRouter.put("/deactivate-account", isAuthenticated, deactivateAccount);
userRouter.post("/upload-profile-picture",uploadProfile);
userRouter.post("/deactivate-2FA", isAuthenticated, deactivate2FA);

// Authentication & Verification
userRouter.post("/otp-verification", verifyUser);
userRouter.post("/resend-otp", resendVerificationOTP);
userRouter.post("/forgot-password", forgotPasswordOtp);
userRouter.post("/verify-password-otp", verifyForgotPasswordOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/set-passcode",setPasscode);
userRouter.post("/forgot-passcode", forgotPasscodeOtp);
userRouter.post("/verify-passcode-otp", verifyForgotPasscodeOtp);
userRouter.post("/reset-passcode", resetPasscode);

// Login & 2FA
userRouter.post("/login", userLogin);
userRouter.post("/2FA-login", finalizeLogin);

// Fetching Users & Lecturers
userRouter.get("/all", isAuthenticated, getAllUsers);
lecturerRouter.get("/:lecturerId", getLecturerDetails); // Fetch lecturer by ID

// Country & University Data
countriesRouter.get("/fetchCountries", fetchCountries);
countriesRouter.get("/all", fetchCountries);
universityRouter.get("/countries/:country", getUniversitiesByCountry);

module.exports = {
  userRouter,
  countriesRouter,
  countryRouter,
  universityRouter,
  lecturerRouter, // Ensure this is exported
};
