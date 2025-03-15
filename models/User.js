const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["STUDENT", "LECTURER"],
    },
    passcode: {
      type: String,
      required: false,
    },
    university: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    otpExpireIn: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPasscodeSet: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ Add profileImage field to store the avatar URL
    profileImage: {
      type: String,
      default: "", // Initially empty, will be set after upload
    },
  },
  { timestamps: true }
);


const loginHistorySchema = new mongoose.Schema(
  {
    device: {
      browser: String,
      browserVersion: String,
      os: String,
      osVersion: String,
      device: String,
      deviceType: String,
    },
    ip: String,
    timestamp: Date,
    location: String,
  },
  { timestamps: true },
);

module.exports = model("User", UserSchema);
