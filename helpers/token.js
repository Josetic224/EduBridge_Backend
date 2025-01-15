const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

// only number
const generateOTP = (length = 4) => {
  const otp = otpGenerator.generate(length, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  return otp;
};

const generateToken = (id, email, expiresIn = "2d") => {
  const payload = {
    user: { id, email: email },
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};
const generateRefreshToken = (id, expiresIn = "10d") => {
  const payload = { user: id };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN, {
    expiresIn,
  });
  return token;
};

const resetPasswordToken = (id, expiresIn = "2m") => {
  const payload = {
    user: { id },
  };
  const token = jwt.sign(payload, process.env.RESET_PASSWORD, {
    expiresIn,
  });
  return token;
};

const decodeToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { user: decoded.user };
  } catch (error) {
    return (error.message);
  }
};

module.exports = {
  generateOTP,
  generateToken,
  decodeToken,
  generateRefreshToken,
  resetPasswordToken,
};
