const express = require("express");

const {createUser, fetchCountries, verifyUser, userLogin, resendVerificationOTP, forgotPasswordOtp, verifyForgotPasswordOtp, resetPassword, setPasscode, forgotPasscodeOtp, resetPasscode, finalizeLogin} = require("../../controllers/user");
const { isAuthenticated } = require("../../middlewares/auth");

const {Router} = express

const userRouter = Router()
const countriesRouter = Router()
const universityRouter = Router()
const countryRouter  = Router()

// route POST api/student/register
// desc  create user
// access public
userRouter.post("/register", createUser);
userRouter.post("/otp-verification", verifyUser);
userRouter.post("/resend-otp", resendVerificationOTP);
userRouter.post("/forgot-password", forgotPasswordOtp );
userRouter.post("/verify-password-otp", verifyForgotPasswordOtp);
userRouter.post("/reset-password", resetPassword)
userRouter.post("/set-passcode", setPasscode)
userRouter.post("/forgot-passcode", forgotPasscodeOtp)
userRouter.post("/verify-passcode-otp", verifyForgotPasswordOtp)
userRouter.post("/reset-passcode", resetPasscode)



 


userRouter.post("/login", userLogin);
userRouter.post("/2FA-login", finalizeLogin)
countriesRouter.get("/all", fetchCountries);

// universityRouter.post("/country", fetchUniversitiesByCountry);
// countryRouter.post("/country", fetchCountryByName)



module.exports = {
    userRouter,
    countriesRouter,
    countryRouter,
    universityRouter
}