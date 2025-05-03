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
  getLecturersByUniversity,
  getLecturersByCourse,
  followLecturer,
  unfollowLecturer,
  getFollowedLecturers,
  getFollowedLecturersWithChatStatus,
  deactivate2FA,
  uploadProfilePic,
  getProfilePic,
  getUserProfile,
  deleteAccount,
  confirmEmailChange,
  getSpecialtiesAndDepartments,
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ
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
userRouter.put("/edit-email", editEmail);
userRouter.put("/edit-username", editUserName);
userRouter.post("/confirm-email-change",confirmEmailChange);
userRouter.put("/deactivate-account",deactivateAccount);
userRouter.delete("/delete-account", deleteAccount);
userRouter.get("/profile",getUserProfile);
userRouter.post("/upload-profile-picture",uploadProfilePic);
userRouter.get("/profile-picture", getProfilePic)
userRouter.post("/deactivate-2FA",deactivate2FA);

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
lecturerRouter.get("/university", isAuthenticated, getLecturersByUniversity); // Get lecturers in same university
lecturerRouter.get("/course/:courseId", isAuthenticated, getLecturersByCourse); // Get lecturers by course
lecturerRouter.get("/following", isAuthenticated, getFollowedLecturers); // Get followed lecturers
lecturerRouter.get("/following-with-chat", isAuthenticated, getFollowedLecturersWithChatStatus); // Get followed lecturers with chat status
lecturerRouter.get("/:lecturerId", getLecturerDetails); // Fetch lecturer by ID
lecturerRouter.post("/:lecturerId/follow", isAuthenticated, followLecturer); // Follow a lecturer
lecturerRouter.post("/:lecturerId/unfollow", isAuthenticated, unfollowLecturer); // Unfollow a lecturer

// Country & University Data
countriesRouter.get("/fetchCountries", fetchCountries);
countriesRouter.get("/all", fetchCountries);
universityRouter.get("/countries/:country", getUniversitiesByCountry);

//Specialities and Departments
userRouter.get("/specialties-and-departments", getSpecialtiesAndDepartments);

// FAQ Routes
userRouter.post("/faqs", createFAQ);
userRouter.get("/faqs", getAllFAQs);
userRouter.put("/faqs/:faqId", updateFAQ);
userRouter.delete("/faqs/:faqId", deleteFAQ);

module.exports = {
  userRouter,
  countriesRouter,
  countryRouter,
  universityRouter,
  lecturerRouter, // Ensure this is exported
};
