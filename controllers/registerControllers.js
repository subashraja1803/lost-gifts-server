const { where, query, getDocs, orderBy, limit } = require("firebase/firestore");
const bcrypt = require("bcryptjs");

const {
  createConnectionRef,
  uploadData,
} = require("../plugins/dbConnection/firebase");
const transport = require("../plugins/nodeMailer/nodemailer");
const DB_NAMES = require("../constants/dbNames");
const {
  genericNumericOTP,
  getDatafromQuery,
  decryptPassword,
} = require("../utils/CommonUtils");

const checkUsername = (req, res) => {
  const { username } = req.body;
  const usersRef = createConnectionRef(DB_NAMES.USERS);
  const usernameQuery = query(usersRef, where("username", "==", username));
  const results = getDatafromQuery(usernameQuery);
  if (!results) {
    return res.status(500).send({
      status: "not ok",
      responseCode: 0,
      message: "Internal Server Error, Try again later",
    });
  }
  results.then((data) => {
    if (data.length > 0) {
      res.status(200).send({
        isUnique: false,
      });
    } else {
      res.status(200).send({
        isUnique: true,
      });
    }
  });
};

const generateOTP = (req, res) => {
  req.app.locals.userDetails = req.body || {};
  const { email } = req.body || {};
  const usersRef = createConnectionRef(DB_NAMES.USERS);
  const emailCheckQuery = query(usersRef, where("email", "==", email));
  getDocs(emailCheckQuery)
    .then((querySnapshot) => {
      if (querySnapshot.size > 0) {
        res.status(200).send({
          status: "not ok",
          message: "Entered email is already registered",
        });
      } else {
        req.app.locals.otp = genericNumericOTP(6);
        transport
          .sendEmail(email, req.app.locals.otp)
          .then((response) => {
            if (response) {
              res.status(200).send({
                status: "ok",
                message: "OTP sent",
              });
            }
          })
          .catch((error) => {
            console.log(error);
            req.status(500).send({
              status: "not ok",
              message: "Error in sending OTP",
            });
          });
      }
    })
    .catch((err) => {
      console.error("Error getting documents:", err);
      res.status(500).send({
        status: "not ok",
        responseCode: 0,
        message: "Internal Server Error, Try again later",
      });
    });
};

const registerUser = (req, res) => {
  const { otp } = req.body;
  if (otp === req.app.locals.otp) {
    const { username, email, password, fullName } =
      req.app.locals.userDetails || {};
    const usersRef = createConnectionRef(DB_NAMES.USERS);
    const lastUserQuery = query(
      usersRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );
    getDocs(lastUserQuery)
      .then((querySnapshot) => {
        const lastUserData = querySnapshot.docs[0]?.data();
        const userId = lastUserData?.userId || 0 + 1;
        const decryptedPW = decryptPassword(password);
        console.log({ decryptedPW });
        bcrypt
          .hash(decryptedPW, 10)
          .then((hashedPW) => {
            uploadData(DB_NAMES.USERS, {
              userId,
              username,
              email,
              password: hashedPW,
              fullName,
              createdAt: Date.now(),
            })
              .then(() => {
                req.app.locals.otp = undefined;
                req.app.locals.userDetails = undefined;
                return res.send({
                  status: "ok",
                  responseCode: 1,
                  message: "User Account successfully created",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).send({
                  status: "not ok",
                  responseCode: 3,
                  message: "Error in inserting data into database",
                });
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send({
              status: "not ok",
              message: "Internal Server Error, Try again later",
              responseCode: 0,
            });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          status: "not ok",
          responseCode: 0,
          message: "Internal Server Error, Try again later",
        });
      });
  } else {
    return res.status(200).send({
      status: "not ok",
      responseCode: 2,
      message: "OTP not matched",
    });
  }
};

module.exports = {
  checkUsername,
  generateOTP,
  registerUser,
};
