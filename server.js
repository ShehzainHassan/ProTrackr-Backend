const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

app.use(cors());

mongoose.connect("mongodb://localhost:27017/ProTrackr", {
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB Connection Successful!");
});

app.listen(3002, () => console.log("Server is running on port 3002."));
module.exports = app;
