const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const URL = require("url");
const cors = require("cors");
const dbSchema = require("./models/user");

const User = dbSchema.User;
const Group = dbSchema.Group;
const FacultyIdea = dbSchema.FacultyIdea;
const UserOTP = dbSchema.UserOTP;
const JoinRequest = dbSchema.JoinRequest;

const app = express();

const jsonParser = bodyParser.json({limit:'30mb'});

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

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.post("/saveGroup", jsonParser, async (req, res) => {
  const {
    FYP_type,
    Faculty_img,
    Status,
    Tags,
    description,
    email,
    id,
    img,
    leader,
    title,
    advisor,
  } = req.body;
  try {
    const newGroup = new Group({
      FYP_type,
      Faculty_img: "",
      Status,
      Tags,
      description,
      email,
      id,
      img,
      leader,
      title,
      advisor: "",
    });
    newGroup.save();
    res.status(201).send(newGroup);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});
app.post("/signup", jsonParser, async (req, res) => {
  const {
    firstName,
    lastName,
    rollNo,
    cgpa,
    email,
    major,
    sdaGrade,
    creditHours,
    password,
    photo,
  } = req.body;

  try {
    const user = new User({
      firstName,
      lastName,
      rollNo,
      cgpa,
      email,
      major,
      sdaGrade,
      creditHours,
      password,
      photo,
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

app.get("/allGroups", jsonParser, async (req, res) => {
  try {
    const allGroups = await Group.find({});
    if (allGroups) {
      res.status(200).send(allGroups);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.get("/allFacultyIdeas", jsonParser, async (req, res) => {
  try {
    const allIdeas = await FacultyIdea.find({});
    if (allIdeas) {
      res.status(200).send(allIdeas);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/groupRequest", jsonParser, async (req, res) => {
  const { id, email } = req.body;
  const parsedId = parseFloat(String(id));

  const group = await Group.findOne({ id: parsedId });
  if (group) {
    try {
      const leader = await User.findOne({
        firstName: group.leader.split(" ")[0],
        lastName: group.leader.split(" ")[1],
      });

      if (!leader) {
        return res.status(404).send("Leader not found");
      }
      const existingRequest = await JoinRequest.findOne({
        from: email,
        groupId: parsedId,
      });
      if (existingRequest) {
        return res.status(409).send("Join request already sent");
      }

      const joinRequest = new JoinRequest({
        from: email,
        to: leader.email,
        groupId: parsedId,
      });
      await joinRequest.save();

      res.status(201).send(joinRequest);
    } catch (err) {
      console.error(err);
      res.status(422).send(err);
    }
  } else {
    res.status(404).send("Group not found");
  }
});

app.get("/getLeader", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const groupId = query.id;
  try {
    const group = await Group.findOne({ id: groupId });
    res.status(200).json(group.leader);
  } catch (error) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/deleteRequest", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const joinRequest = await JoinRequest.findOne({ from: email });
    if (!joinRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    await JoinRequest.deleteOne({ from: email });
    return res
      .status(200)
      .json({ joinRequest: "Request deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/allJoinRequests", async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const allJoinRequests = await JoinRequest.find({ to: email });

    res.status(200).json(allJoinRequests);
  } catch (error) {
    console.error("Error fetching join requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/joinGroup", jsonParser, async (req, res) => {
  const { id, email, img } = req.body;

  const parsedId = parseFloat(String(id));

  const group = await Group.findOne({ id: parsedId });
  if (group) {
    const emails = group.email;
    const images = group.img;

    const emailExists = emails.some((e) => e.val == email);

    if (emailExists) {
      res.status(409).send("Email already exists");
      return;
    }

    emails.push({ val: email });
    images.push({ val: img });

    await Group.updateOne(
      { id: parsedId },
      {
        $set: { email: emails, img: images },
        $currentDate: { lastModified: true },
      }
    );

    res.status(201).send(group);
  }
});

app.get("/userdetails", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  try {
    const userDetails = await User.findOne({ email: query.email });
    if (userDetails) {
      res.status(200).send({
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        rollNo: userDetails.rollNo,
        email: userDetails.email,
        cgpa: userDetails.cgpa,
        sdaGrade: userDetails.sdaGrade,
        major: userDetails.major,
        creditHours: userDetails.creditHours,
        photo: userDetails.photo,
      });
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

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

app.post("/login", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const loggedUser = await User.findOne({ email, password });
    if (loggedUser) {
      console.log("Successfully Logged In");
      res.status(201).send({ email, password });
    } else {
      console.error("Invalid email or password");
      res.status(201).send(false);
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

app.delete("/deleteGroup", jsonParser, async (req, res) => {
  const { title, email } = req.body;
  try {
    const group = await Group.findOne({ title, "email.val": email });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    await Group.deleteOne({ title, "email.val": email });
    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
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

app.post("/groupMembers", jsonParser, async (req, res) => {
  const { title, email } = req.body;
  try {
    const group = await Group.findOne({ title, "email.val": email });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const groupEmails = group.email.map((member) => member.val);

    const users = await User.find({ email: { $in: groupEmails } });

    const userDetails = users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      major: user.major,
      email: user.email,
    }));

    return res.status(200).json({ userDetails });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/isLeader", jsonParser, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName } = user;

    const group = await Group.findOne({ leader: `${firstName} ${lastName}` });
    if (!group) {
      return res.status(200).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    console.error("Error determining leader status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/leaveGroup", jsonParser, async (req, res) => {
  const { email, img } = req.body;
  try {
    const group = await Group.findOne({ "email.val": email });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const updatedEmails = group.email.filter((obj) => obj.val !== email);
    group.email = updatedEmails;

    const updatedImages = group.img.filter((obj) => obj.val != img);
    group.img = updatedImages;
    await group.save();

    return res.status(200).json({ message: "Email deleted successfully" });
  } catch (error) {
    console.error("Error deleting email from group:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    subject: "Welcome",
    text: `Your OTP for password reset is ${OTP}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}