const {
  checkUsernameSchema,
  registerSchema,
  checkOTP,
  loginSchema,
} = require("../schema/loginSchema");

const VALIDATORS = {
  "/check_unique_username": checkUsernameSchema,
  "/register": registerSchema,
  "/otp_verification": checkOTP,
  "/login_user": loginSchema,
};

module.exports = VALIDATORS;
