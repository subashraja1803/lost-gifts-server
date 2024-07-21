/* eslint-disable no-undef */
require("dotenv").config();
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "lost-gifts-2024.firebaseapp.com",
  projectId: "lost-gifts-2024",
  storageBucket: "lost-gifts-2024.appspot.com",
  messagingSenderId: "833129552265",
  appId: "1:833129552265:web:fe3711b54e1ceee1166958",
  measurementId: "G-VHCQJW81NS",
};

let db;

// Initialize Firebase
const initializeFireBase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

const createConnectionRef = (dbName) => collection(db, dbName);

const uploadData = (dbName, data) => {
  const collectionRef = collection(db, dbName);
  return setDoc(doc(collectionRef), data);
};

module.exports = {
  initializeFireBase,
  uploadData,
  createConnectionRef,
};
