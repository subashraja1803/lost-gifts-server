/* eslint-disable no-undef */
require("dotenv").config();
const { getDocs } = require("firebase/firestore");
const otpGenerator = require("otp-generator");
const cryptoJS = require("crypto-js");

const genericNumericOTP = (digit) => {
  return otpGenerator.generate(digit, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    digits: true,
    specialChars: false,
  });
};

const getDatafromQuery = (query) => {
  return getDocs(query)
    .then((querySnapshot) => {
      const data = [];
      if (querySnapshot.size === 0) return data;
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return data;
    })
    .catch((err) => {
      console.error("Error getting documents:", err);
      return null;
    });
};

const decryptPassword = (data) => {
  const [encryptedText, iv] = data.split("_");
  const decryptedData = cryptoJS.AES.decrypt(
    encryptedText,
    process.env.CRYPTO_KEY,
    {
      iv: iv,
    }
  ).toString(cryptoJS.enc.Utf8);
  return decryptedData;
};

module.exports = {
  genericNumericOTP,
  getDatafromQuery,
  decryptPassword,
};
