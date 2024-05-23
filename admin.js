const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Admin = dbSchema.Admin;
const jsonParser = bodyParser.json({ limit: "50mb" });

app.post("/adminLogin", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).send("Invalid Credentials");
    }

    return res.status(200).send("Login successful");
  } catch (error) {
    console.error("Error authenticating admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;
