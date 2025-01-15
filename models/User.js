const mongoose = require('mongoose');
const {Schema , model} = mongoose;

const UserSchema = new Schema({
    userName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum:["STUDENT", "LECTURER"]
    },
    passcode:{
        type : String,
        required : false,
    },
    university:{
        type : String,
        required : true,
    },
    country:{
        type : String,
        required : true,
    },
    otp: {
        type: String,
      },
      otpExpireIn: {
        type: Number,
      },
    isVerified : {
        type : Boolean,
        default : false
    },
    isPasscodeSet : {
        type : Boolean,
        default : false
    },
    twoFactorSecret: { 
        type: String 
    }, // Store 2FA secret
    isTwoFactorEnabled: { 
        type: Boolean, 
        default: false
     },

}, {timestamps : true})

module.exports = model("User", UserSchema);