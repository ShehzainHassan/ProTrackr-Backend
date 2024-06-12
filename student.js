const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const User = dbSchema.User;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

app.post("/signup", jsonParser, async (req, res) => {
  const {
    firstName,
    lastName,
    major,
    rollNo,
    cgpa,
    email,
    sdaGrade,
    creditHours,
    password,
    photo,
  } = req.body;

  const batch = rollNo ? `20${rollNo.substring(0, 2)}` : null;
  try {
    const user = new User({
      firstName,
      lastName,
      major,
      rollNo,
      cgpa,
      email,
      sdaGrade,
      creditHours,
      password,
      photo,
      batch,
    });
    user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.get("/allusers", jsonParser, async (req, res) => {
  try {
    const allusers = await User.find({});
    if (allusers) {
      res.status(200).send(allusers);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.get("/userdetails", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  try {
    const userDetails = await User.findOne({ email: query.email });
    if (userDetails) {
      res.status(200).send(userDetails);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/login", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const loggedUser = await User.findOne({ email, password });
    if (loggedUser) {
      if (loggedUser.isDisabled) {
        console.log("Logged User: ", loggedUser.isDisabled);
        return res.status(403).send({
          message:
            "Your account is disabled by system administrator. Please contact system administrator",
          status: false,
        });
      }
      console.log("Successfully Logged In");
      res.status(201).send({ email, password, status: true });
    } else {
      console.error("Invalid email or password");
      res
        .status(401)
        .send({ message: "Invalid email or password", status: false });
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.put("/updateStudentDetails", jsonParser, async (req, res) => {
  const {
    email, 
    photo,
  } = req.body;

  try {
    const updatedStudent = await User.findOneAndUpdate(
      { email }, 
      { photo }, 
      { new: true }
    );

    if (updatedStudent) {
      res.status(200).send(updatedStudent);
      console.log("Student Edit Success");
    } else {
      res.status(404).send("Student not found");
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
});

app.get("/isRegisteredStudentEmail", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    console.error(err);
  }
});

app.post("/changePassword", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.password = password;
    await user.save();

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/changeAccountStatus", jsonParser, async (req, res) => {
  try {
    const { id, status } = req.body;
    const student = await User.findOne({ _id: id });
    if (!student) {
      return res.status(404).send("Student not found");
    }
    if (status === "enable") {
      student.isDisabled = false;
    } else {
      student.isDisabled = true;
    }
    console.log(student);
    await student.save();
    return res.status(200).send("Account status updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = app;
