const express = require("express");
const otpGenerator = require("otp-generator");

const {
  registerSchema,
  checkUsernameSchema,
  checkOTP,
} = require("../schema/loginSchema");
const db = require("../plugins/mysql");
const transport = require("../plugins/nodemailer");

const router = express.Router();

let userDetails = {};
let emailOtp = null;

router.post("/check_unique_username", (req, res, next) => {
  const validationResult = checkUsernameSchema.validate(req.body);
  if (!validationResult?.error) {
    const { username } = req.body;
    console.clear();
    db.execute(`select * from registeredUsers where username='${username}'`)
      .then((response) => {
        const values = response[0];
        if (values.length > 0) {
          res.status(200).send({
            isUnique: false,
          });
        } else {
          res.status(200).send({
            isUnique: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({
          status: "not ok",
          message: "Internal Server Error, Try again later",
        });
      });
  } else {
    res.status(400).send({
      status: "not ok",
      message: "Internal Server Error, Try again later",
    });
  }
});

router.post("/register", (req, res, next) => {
  const validationResult = registerSchema.validate(req.body);
  if (!validationResult?.error) {
    userDetails = req.body || {};
    const { email } = req.body || {};

    db.execute(`select * from registeredUsers where email='${email}'`)
      .then((response) => {
        const values = response[0];
        if (values.length > 0) {
          res.status(500).send({
            status: "not ok",
            message: "Entered email is already registered",
          });
        } else {
          emailOtp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            digits: true,
            specialChars: false,
          });
          transport
            .sendMail({
              sender: "Lost Gifts",
              from: "lostgifts115112@gmail.com",
              to: email,
              subject: "OTP - Verification",
              html: `<h2>Your Lost Gifts account verification OTP is</h2><h3>${emailOtp}</h3>`,
            })
            .then(({ message }) => {
              if (message === "success") {
                res.status(200).send({
                  status: "ok",
                  message: "OTP sent through mail",
                });
              }
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({
          status: "not ok",
          message: "Internal Server Error, Please Try Again Later",
        });
      });
  }
});

router.post("/otp_verification", (req, res) => {
  const validation = checkOTP.validate(req.body);
  if (!validation.error) {
    const { otp } = req.body;
    console.log({ emailOtp, userDetails, otp });
    if (otp === emailOtp) {
      const { username, email, password, fullName } = userDetails;
      db.execute(
        `INSERT into registeredUsers(username, email, password, fullName) Values ('${username}', '${email}', '${password}', '${fullName}')`
      ).then((values) => {
        console.log(values);
        res.send({
          responseCode: "1",
          message: "User Account successfully created",
        });
      });
    } else {
      res.status(200).send({
        responseCode: "2",
        message: "OTP not matched",
      });
    }
  }
});

module.exports = router;
