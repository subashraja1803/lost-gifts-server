/* eslint-disable no-undef */
const DB_NAMES = require("../constants/dbNames");
const { createConnectionRef } = require("../plugins/dbConnection/firebase");
const { where, query } = require("firebase/firestore");
const bcrypt = require("bcryptjs");
const { getDatafromQuery, decryptPassword } = require("../utils/CommonUtils");
const jwt = require("jsonwebtoken");

const loginUser = (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    return res.status(500).send({
      status: "not ok",
      message: "Username/Email cannot be empty",
    });
  }
  const usersRef = createConnectionRef(DB_NAMES.USERS);
  const userQuery = email
    ? query(usersRef, where("email", "==", email))
    : query(usersRef, where("username", "==", username));
  getDatafromQuery(userQuery)
    .then((results) => {
      const decryptedPW = decryptPassword(password);
      if (results.length > 0) {
        const usersData = results[0];
        bcrypt.compare(decryptedPW, usersData?.password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords", err);
            return;
          }

          if (result) {
            console.log("Passwords match! User authenticated");
            const userToken = jwt.sign(
              { username: usersData.username },
              process.env.JWT_PVT_KEY,
              { expiresIn: "8h" }
            );
            res.status(200).send({
              status: "ok",
              responseCode: 1,
              message: "User Authentication Successful",
              data: {
                token: userToken,
              },
            });
          } else {
            console.error("Passwords do not match! Authentication failed");
            res.status(200).send({
              status: "not ok",
              reponseCode: 2,
              message: "User Authentication failed, Invalid Password",
            });
          }
        });
      } else {
        res.status(200).send({
          status: "not ok",
          reponseCode: 3,
          message: "User doesnt exist, Invalid Username",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        status: "not ok",
        reponseCode: 0,
        message: "Internal Server Error, Try again later",
      });
    });
};

module.exports = {
  loginUser,
};
