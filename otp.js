const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const UserOTP = dbSchema.UserOTP;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

app.get("/getOTP", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  const OTP = query.otp.toString();
  try {
    const userOTP = await UserOTP.findOne({ email });
    if (userOTP.OTP.toString() === OTP) {
      await UserOTP.deleteOne({ email });
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.get("/alreadySent", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const user = await UserOTP.findOne({ email });
    if (!user) {
      return res.status(200).send(false);
    }
    res.status(200).send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/sendOTP", jsonParser, async (req, res) => {
  const { email } = req.body;
  const userOTP = await UserOTP.findOne({ email });
  if (userOTP) {
    await UserOTP.deleteOne({ email });
  }
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000);
    const newUserOTP = new UserOTP({
      email: email,
      OTP: OTP,
    });

    newUserOTP.save();
    await sendEmail(email, OTP);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(422).json({ error: "Failed to send OTP" });
  }
});

var nodemailer = require("nodemailer");
const { group } = require("console");

async function sendEmail(email, OTP) {
  var transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 587,
    secure: false,
    logger: true,
    debug: true,
    service: "hotmail",
    auth: {
      user: "ProTrackr@hotmail.com",
      pass: "1234admin1234",
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

  var mailOptions = {
    from: "ProTrackr@hotmail.com",
    to: email,
    subject: "Password Reset",
    text: `Your OTP for password reset is ${OTP}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}

module.exports = app;
