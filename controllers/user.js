const { encrypt, compare } = require("../helpers/auth");
const { getSecondsBetweenTime, timeDifference } = require("../helpers/date");
const { notFound, badRequest } = require("../helpers/error");
const {fetchCountriesData, fetchUniversitiesByCountry} = require("../helpers/fetchCountries");
const { createAccountOtp, welcomeEmail } = require("../helpers/mails/otp");
const { generateOTP, generateRefreshToken, generateToken, decodeToken } = require("../helpers/token");
const User = require("../models/User");
const { validateUser } = require("../services/auth");
const sendEmail = require("../services/email");
const speakeasy = require('speakeasy')
const { UserSchema, VerifyUserSchema, LoginUserSchema, VerifyPasswordOtpSchema, ResetPasswordSchema, setPasscodeSchema, VerifyPasscodeOtpSchema, twoFA_Schema } = require("../validations/user")
const axios = require('axios');


exports.fetchCountries = async (req, res) => {
    try {
      const countries = await fetchCountriesData();
      res.status(200).json(countries);
    } catch (error) {
      console.error("Error in fetchCountries route:", error.message);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  };

  
  

  
  

  

exports.createUser = async (req, res)=>{
    const body  = UserSchema.safeParse(req.body);

    if(!body.success){
        return res.status(404).json({
            errors:body.error.issues,
        });
    }

    const {userName, email, password, role,university, country} = body.data

    try {
        const checkUserName = await User.findOne({userName});
        if(checkUserName){
            return badRequest(res, "Username already taken")
        }
        const checkEmail = await User.findOne({email}); 

        if(checkEmail){
            return badRequest(res, "Email already taken")
        }

        if (!["STUDENT", "LECTURER"].includes(role)) {
            return res.status(400).json({ error: "Invalid Role" });
        }
        const universities = await fetchUniversitiesByCountry (country)
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
            otpExpireIn:new Date().getTime() + 30 * 60 * 1000
        })
        

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
}


// VERIFY NEWLY CREATED USER
exports.verifyUser = async (req, res) => {
    const body = VerifyUserSchema.safeParse(req.body);
  
    if (!body.success) {
      return res.status(400).json({
        errors: body.error.issues,
      });
    }
    
    const { email, otp } = body.data;
  
    try {
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


  // USER LOGIN
exports.userLogin = async (req, res) => {
    const body = LoginUserSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        error: body.error.issues,
      });
    }
  
    const { email, password } = body.data;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
  
      if (!checkUser) {
        return badRequest(res, "Incorrect credentials");
      }
      const checkPassword = await compare(password, checkUser.password);
      if (!checkPassword) {
        return badRequest(res, "Incorrect credentials");
      }

   //TO CHECK IF USER'S VERIFICATION IS COMPLETE
   const verifiedUser = checkUser.verified;
   if (verifiedUser === false) {
     return res.status(400).json({
       error: "User not verified, please verify your account",
     });
   }
      // Check if 2FA is enabled
    if (checkUser.isTwoFactorEnabled) {
      // Generate a temporary token for 2FA verification
      const tempToken = generateToken(
        { userId: checkUser._id,
          email: checkUser.email
        },
        process.env.JWT_SECRET);

      return res.status(200).json({
        message: "2FA required. Please verify with your 2FA code.",
        tempToken,
      });
    }


        // Regular login if 2FA is not enabled
        const authToken = generateToken(
          { userId: checkUser._id,
            email: checkUser.email
          },
          process.env.JWT_SECRET);
    
        return res.status(200).json({ message: "Login successful.", authToken });
    
   
      // const token = generateToken(checkUser._id, checkUser.email);
  
      // res.status(200).json({
      //   message: "Login Success",
      //   token,
      // });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: [
          {
            error: "Server Error",
            error
          },
        ],
      });
    }
  };


  //FINAL LOGIN FOR 2FA ONLY

  exports.finalizeLogin = async (req, res) => {
    try {
         // Validate request body
         const body = twoFA_Schema.safeParse(req.body)
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
      const userId = decoded.user.id.userId
      console.log(userId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ error: "Invalid or expired temporary token." });
      }
  
      // Verify the 2FA code
      const isVerified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: totp,
      });

      console.log(isVerified)
  
      if (!isVerified) {
        return res.status(401).json({ error: "Invalid 2FA code." , Error});
      }
  
      // Issue the actual authentication token
      const authToken = generateToken(
        { userId: user._id,
          email:user.email
        },
        process.env.JWT_SECRET,
      );
  
      return res.status(200).json({ message: "Login successful.", authToken });
    } catch (error) {
      console.log("Finalize Login Error=>", error);
      res.status(500).json({ error: "Server error." });
    }
  };
  


  // RESEND VERIFIICATION OTP
exports.resendVerificationOTP = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({email});
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
      await sendEmail(data);
  
      res.status(200).json({ msg: `OTP sent to ${email}` });
    } catch (error) {
      console.log("RESET PASSWORD ERROR=>", error);
      res.status(500).json({ errors: [{ error: "Server Error" }] });
    }
  };
  

// VERIFY OTP FOR FORGOT PASSWORD
exports.verifyForgotPasswordOtp = async (req, res) => {
    const body = VerifyPasswordOtpSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }
  
    const { email, otp } = body.data;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      console.log("Provided OTP:", otp); // Debugging log
      console.log("Stored Encrypted OTP:", user.otp); // Debugging log
  
      const isOtpValid = await compare(otp, user.otp);
      console.log("Is OTP valid:", isOtpValid); // Debugging log
  
      if (!isOtpValid) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      const isOtpExpired = getSecondsBetweenTime(user.otpExpireIn) > timeDifference["2m"];
      console.log("Is OTP expired:", isOtpExpired); // Debugging log
  
      if (isOtpExpired) {
        return res.status(400).json({ error: "This OTP has expired" });
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
  
      // Extract user ID
      const userId = user.id; // Ensure the token contains an `id` field
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
  
      return res.status(200).json({ message: "Passcode has been successfully set." });
    } catch (error) {
      console.log("SET PASSCODE ERROR=>", error);
      res.status(500).json({ errors: [{ error: "Server Error" }] });
    }
  };



  exports.forgotPasscodeOtp = async (req, res) => {



       // Extract token from headers
       const token = req.headers["authorization"]?.split(" ")[1];
       if (!token) {
         return res.status(401).json({ error: "not Authorized" });
       }
   
       // Decode and validate token
       const { user, error } = decodeToken(token, process.env.JWT_SECRET);
       if (error) {
         return res.status(401).json({ error });
       }
   
       // Extract user ID
       const userId = user.id; // Ensure the token contains an `id` field
       if (!userId) {
         return res.status(400).json({ error: "Invalid token: user ID missing." });
       }
   
       // Find the user using the extracted user ID
       const userRecord = await User.findById(userId);
       if (!userRecord) {
         return res.status(404).json({ error: "User not found." });
       }


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
      console.log("RESET PASSWORD ERROR=>", error);
      res.status(500).json({ errors: [{ error: "Server Error" }] });
    }
  };

  // VERIFY OTP FOR FORGOT PASSWORD
exports.verifyForgotPasscodeOtp = async (req, res) => {
  const body = VerifyPasscodeOtpSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ errors: body.error.issues });
  }

  const { email, otp } = body.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Provided OTP:", otp); // Debugging log
    console.log("Stored Encrypted OTP:", user.otp); // Debugging log

    const isOtpValid = await compare(otp, user.otp);
    console.log("Is OTP valid:", isOtpValid); // Debugging log

    if (!isOtpValid) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const isOtpExpired = getSecondsBetweenTime(user.otpExpireIn) > timeDifference["2m"];
    console.log("Is OTP expired:", isOtpExpired); // Debugging log

    if (isOtpExpired) {
      return res.status(400).json({ error: "This OTP has expired" });
    }

    res.status(200).json({ message: "OTP Verified!" });
  } catch (error) {
    console.log("VERIFY OTP ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};


exports.resetPasscode = async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {s
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Decode and validate token
    const { user, error } = decodeToken(token, process.env.JWT_SECRET);
    if (error) {
      return res.status(401).json({ error });
    }

    // Extract user ID
    const userId = user.id; // Ensure the token contains an `id` field
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

    return res.status(200).json({ message: "Passcode has been successfully set." });
  } catch (error) {
    console.log("SET PASSCODE ERROR=>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};



  
  


  module.exports = {
    fetchCountries: exports.fetchCountries,
    createUser: exports.createUser,
    verifyUser:exports.verifyUser,
    userLogin:exports.userLogin,
    resendVerificationOTP:exports.resendVerificationOTP,
    verifyForgotPasswordOtp:exports.verifyForgotPasswordOtp,
    forgotPasswordOtp:exports.forgotPasswordOtp,
    resetPassword:exports.resetPassword,
    setPasscode : exports.setPasscode,
    forgotPasscodeOtp:exports.forgotPasscodeOtp,
    verifyForgotPasscodeOtp:exports.verifyForgotPasscodeOtp,
    resetPasscode:exports.resetPasscode,
    finalizeLogin:exports.finalizeLogin

  }