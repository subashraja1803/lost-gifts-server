const DB_NAMES = require("../constants/dbNames");
const { createConnectionRef } = require("../plugins/dbConnection/firebase");
const { where, query } = require("firebase/firestore");
const bcrypt = require("bcryptjs");
const { getDatafromQuery, decryptPassword } = require("../utils/CommonUtils");

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
      console.log(password, results);
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
            res.send({
              status: "ok",
              reponseCode: 2,
              message: "User Login successful",
            });
          } else {
            console.error("Passwords do not match! Authentication failed");
            res.status(500).send({
              status: "not ok",
              reponseCode: 2,
              message: "User Authentication failed",
            });
          }
        });
      } else {
        res.status(500).send({
          status: "not ok",
          reponseCode: 2,
          message: "User doesnt exist",
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
