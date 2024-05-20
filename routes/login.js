const express = require("express");
const otpGenerator = require("otp-generator");

const {
  registerSchema,
  checkUsernameSchema,
} = require("../schema/loginSchema");
const db = require("../plugins/mysql");
const transport = require("../plugins/nodemailer");

const router = express.Router();

let userDetails = {};
let emailOtp = null;

router.post("/checkUniqueUsername", (req, res, next) => {
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
          message: "Internal Server Error, try again later",
        });
      });
  } else {
    res.status(400).send({
      status: "not ok",
      message: "Internal Server Error, try again later",
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
          let emailOtp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            digits: true,
            specialChars: false,
          });
          transport
            .sendMail({
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
    // db.execute(
    //   `INSERT into registeredUsers(username, email, password, full_name) Values ('${username}', '${email}', '${password}', '${fullName}')`
    // ).then((values) => {
    //   console.log(values);
    //   res.send({
    //     success: true,
    //     message: "User Account successfully created",
    //   });
    // });
  }
});

module.exports = router;
