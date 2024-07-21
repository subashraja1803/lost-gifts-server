/* eslint-disable no-undef */
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.AUTH_PASS,
  },
});

const sendEmail = async (receiver, otp) => {
  return transporter.sendMail({
    from: process.env.USER_MAIL,
    to: receiver,
    subject: "Lost Gifts OTP Verification",
    text: `Your Lost Gifts OTP is ${otp}`,
  });
};

module.exports = {
  sendEmail,
};
