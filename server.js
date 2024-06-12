const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });
const firebaseApp = require("firebase/app");

const firebaseConfig = {
  apiKey: "AIzaSyASXjimaWcRBMljZJVw2St84QzX8doNJo4",
  authDomain: "protrackr-80e59.firebaseapp.com",
  projectId: "protrackr-80e59",
  storageBucket: "protrackr-80e59.appspot.com",
  messagingSenderId: "595055177092",
  appId: "1:595055177092:web:7d57e3335d4fdc6def01d1",
};
firebaseApp.initializeApp(firebaseConfig);

app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/Protrackr", {
  useUnifiedTopology: true,
});


const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB Connection Successful!");
});

app.listen(3002, () => console.log("Server is running on port 3002."));
module.exports = app;
