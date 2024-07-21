const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");

const { initializeFireBase } = require("./plugins/dbConnection/firebase");
const registerRoutes = require("./routes/login");

const crypto = require("crypto");
const { joiValidator } = require("./controllers/validationControllers");
const app = express();
app.use(cors());

app.use(
  session({
    secret: crypto.randomBytes(16).toString("hex"),
    resave: false,
    saveUninitialized: true,
  })
);

dotenv.config();

initializeFireBase();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(joiValidator, registerRoutes);

app.listen(4000);
