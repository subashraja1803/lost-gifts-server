const express = require("express");
const {
  registerUser,
  generateOTP,
  checkUsername,
} = require("../controllers/registerControllers");
const { loginUser } = require("../controllers/loginControllers");

const router = express.Router();

router.post("/check_unique_username", checkUsername);
router.post("/register", generateOTP);
router.post("/otp_verification", registerUser);
router.post("/login_user", loginUser);

module.exports = router;
