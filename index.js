const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const URL = require("url");
const cors = require("cors");
const dbSchema = require("./models/user");
const { ObjectId } = require("mongodb");

const User = dbSchema.User;
const Group = dbSchema.Group;
const FacultyIdea = dbSchema.FacultyIdea;
const UserOTP = dbSchema.UserOTP;
const JoinRequest = dbSchema.JoinRequest;
const Faculty = dbSchema.Faculty;
const AdvisorRequest = dbSchema.AdvisorRequest;

const app = express();

<<<<<<< HEAD
const jsonParser = bodyParser.json({limit:'30mb'});
=======
const jsonParser = bodyParser.json({ limit: "50mb" });
>>>>>>> 5d8c470ef2da602b20c044011c68e9f4dd00684e

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

// Faculty Signup
// Route for creating a new faculty entry
app.post("/facultySignup", jsonParser, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    roomNo,
    interest_Tags,
    curr_education,
    password,
    photo,
  } = req.body;

  try {
    // Check if the email already exists in the database
    const existingFaculty = await Faculty.findOne({ email });

    if (existingFaculty) {
      return res.status(409).send("Faculty with this email already exists.");
    }

    // If faculty with this email doesn't exist, create a new record
    const newFaculty = new Faculty({
      firstName,
      lastName,
      email,
      roomNo,
      interest_Tags,
      curr_education,
      password,
      photo,
    });
    await newFaculty.save();

    res.status(201).send(newFaculty); // Return newly created faculty
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

// Route for updating an existing faculty entry
// Route for updating faculty details
// Route for updating faculty details
// Update Faculty Details

app.get('/isRegisteredFacultyEmail', jsonParser, async (req, res)=>{
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try{
      const faculty = await Faculty.findOne({email});
      if (faculty){
        res.status(200).send(true)
      } else {
        res.status(200).send(false)
      }
  } catch (err){
    console.error(err)
  }
})
app.post("/changeFacultyPassword", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Faculty.findOne({ email });
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
app.put("/updateFacultyDetails", jsonParser, async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    curr_education,
    roomNo,
    photo,
    interest_Tags,
  } = req.body;

  try {
    const updatedFaculty = await Faculty.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        curr_education,
        roomNo,
        photo,
        interest_Tags,
      },
      { new: true }
    );

    if (updatedFaculty) {
      res.status(200).send(updatedFaculty);
      console.log("Faculty Edit Success");
    } else {
      res.status(404).send("Faculty not found");
    }
  } catch (err) {
    res.status(500).send(err);
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

// GET ALL Faculties
app.get("/allFaculties", jsonParser, async (req, res) => {
  try {
    const allFaculties = await Faculty.find({});
    if (allFaculties) {
      res.status(200).send(allFaculties);
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

app.post("/updateGroup", jsonParser, async (req, res) => {
  const { email, name, img } = req.body;
  try {
    const group = await Group.findOne({ "email.val": email });
    if (!group) {
      return res.status(404).send("User group not found");
    }
    group.advisor = name;
    group.Faculty_img = img;

    await group.save();
  } catch (err) {
    console.error(err);
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

app.get("/hasRequested", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const request = await JoinRequest.findOne({ from: email });
    if (request) {
      res.status(200).send({ groupId: request.groupId });
    } else {
      res.status(200).send({ groupId: null });
    }
  } catch (error) {
    console.error(error);
    res.status(422).send(error);
  }
});

app.post("/groupRequest", jsonParser, async (req, res) => {
  const { id, email } = req.body;
  const parsedId = parseFloat(String(id));

  try {
    const group = await Group.findOne({ id: parsedId });
    if (!group) {
      return res.status(404).send("Group not found");
    }

    const leader = await User.findOne({
      firstName: group.leader.split(" ")[0],
      lastName: group.leader.split(" ")[1],
    });
    if (!leader) {
      return res.status(404).send("Leader not found");
    }

    const member = await User.findOne({ email });
    if (!member) {
      return res.status(404).send("Member not found");
    }

    const existingRequest = await JoinRequest.findOne({
      from: email,
      groupId: parsedId,
    });
    if (existingRequest) {
      return res.status(409).send("Join request already sent");
    }

    const { firstName, lastName, photo } = member;
    const joinRequest = new JoinRequest({
      name: `${firstName} ${lastName}`,
      from: email,
      to: leader.email,
      groupId: parsedId,
      profile_pic: photo,
    });
    await joinRequest.save();

    res.status(201).send(joinRequest);
  } catch (err) {
    console.error(err);
    res.status(422).send("Error finding group");
  }
});

app.post("/requestAdvisor", jsonParser, async (req, res) => {
  const { id, email } = req.body;
  try {
    const advisor = await Faculty.findOne({ _id: new ObjectId(id) });
    if (!advisor) {
      return res.status(404).send("Advisor not found");
    }

    const group = await Group.findOne({ "email.val": email });
    const member = await User.findOne({ email });
    if (!member) {
      return res.status(404).send("Member not found");
    }

    const { firstName, lastName, photo } = member;
    const advisorRequest = new AdvisorRequest({
      name: `${firstName} ${lastName}`,
      from: email,
      to: advisor.email,
      groupId: group.id,
      profile_pic: photo,
    });
    await advisorRequest.save();

    res.status(201).send(advisorRequest);
  } catch (err) {
    console.error(err);
    res.status(422).send("Error finding advisor");
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

app.delete("/deleteSupervisionRequest", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const advisorRequest = await AdvisorRequest.findOne({ from: email });
    if (!advisorRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    await AdvisorRequest.deleteOne({ from: email });
    return res
      .status(200)
      .json({ advisorRequest: "Request deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
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

app.get("/allAdvisorRequests", async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const allAdvisorRequests = await AdvisorRequest.find({ to: email });
    res.status(200).json(allAdvisorRequests);
  } catch (error) {
    console.error("Error fetching advisor requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

app.post('/updateFaculty', jsonParser, async (req, res) => {
  const { group_id, facultyId } = req.body;
  console.log(group_id)
  console.log(facultyId)
  try {
    const faculty = await Faculty.findOne({ _id: facultyId });
    console.log(faculty)
    if (faculty) {
      const groupIdExists = faculty.groupIds.some(
        (groupObj) => groupObj.val === group_id
      );

      if (!groupIdExists) {
        faculty.groupIds.push({ val: group_id });
        await faculty.save();
        res.status(200).json({ message: 'Group ID added successfully' });
      } else {
        res.status(400).json({ message: 'Group ID already exists' });
      }
    } else {
      res.status(404).json({ message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post("/joinGroup", jsonParser, async (req, res) => {
  const { id, email, img } = req.body;
  const parsedId = parseFloat(String(id));
  const group = await Group.findOne({ id: parsedId });

  if (group) {
    const emails = group.email;
    const images = group.img;
    const emailExists = emails.some((e) => e.val === email);

    if (emailExists) {
      res.status(409).send("Email already exists");
      return;
    }

    emails.push({ val: email });
    images.push({ val: img });

    const updatedGroup = await Group.findOneAndUpdate(
      { id: parsedId },
      {
        $set: { email: emails, img: images },
        $currentDate: { lastModified: true },
      },
      { new: true }
    );

    // Check if the group has 3 members now
    if (updatedGroup.email.length === 3) {
      // Update the group status to "LOCKED"
      updatedGroup.Status = "LOCKED";
      await updatedGroup.save();
    }

    res.status(201).send(updatedGroup);
  }
});

app.get("/advisordetails", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  try {
    const userDetails = await Faculty.findOne({ email: query.email });
    if (!userDetails) {
      res.status(404).send("User Not Found");
    }
    res.status(200).send(userDetails);
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

//FacultyDetails
app.get("/facultyDetails", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  try {
    const facultyDetails = await Faculty.findOne({ email: query.email });
    if (facultyDetails) {
      res.status(200).send({
        firstName: facultyDetails.firstName,
        lastName: facultyDetails.lastName,
        email: facultyDetails.email,
        roomNo: facultyDetails.roomNo,
        interest_Tags: facultyDetails.interest_Tags,
        curr_education: facultyDetails.curr_education,
        photo: facultyDetails.photo,
      });
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

//Faculty Login
app.post("/facultyLogin", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  try {
    const loggedFaculty = await Faculty.findOne({ email, password });
    console.log(loggedFaculty);
    if (loggedFaculty) {
      console.log("Faculty Successfully Logged In");
      res.status(201).send({ email, password });
    } else {
      console.error("Invalid email or password");
      res.status(201).send(false);
    }
    // const credentials = db.collection('users').find({}, {projection: {email: 1, password: 1, _id:0 }});
    // let isValidCredentials = false;
    // credentials.forEach(document => {
    //     if (email === document.email && password === document.password){
    //         console.log("Successfully Logged In");
    //         // console.log(db.collection('users').findOne({}, (error, result) => {console.log(result)}))
    //         res.status(201).send({email, password});
    //         return;
    //     }
    // })
    // console.log("Invalid Credentials");
    // res.status(201).send({});
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

// FacultyFYPIdeas
// Add, Delete, Get All ideas of logged in Faculty..

app.post("/addFYPidea", jsonParser, async (req, res) => {
  const { FYP_type, Faculty_img, Tags, description, title, contact, advisor } =
    req.body;

  try {
    const newIdea = new FacultyIdea({
      FYP_type,
      Faculty_img,
      Tags,
      description,
      title,
      contact,
      advisor,
    });
    await newIdea.save();
    res.status(201).send(newIdea);
  } catch (err) {
    res.status(422).send(err);
    console.error(err);
  }
});

// Route for fetching ideas of a single logged-in faculty
app.get("/facultyIdeas", jsonParser, async (req, res) => {
  const { contact } = req.query;
  try {
    const facultyIdeas = await FacultyIdea.find({ contact });
    if (facultyIdeas) {
      res.status(200).send(facultyIdeas);
    } else {
      res.status(200).send([]);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

// Add this route to your backend

// Route for deleting an FYP idea
app.delete("/deleteFYPidea/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedIdea = await FacultyIdea.findByIdAndDelete(id);
    if (deletedIdea) {
      res.status(200).send("FYP idea deleted successfully.");
    } else {
      res.status(404).send("FYP idea not found.");
    }
  } catch (err) {
    res.status(500).send(err);
    console.error(err);
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

app.get("/fetchFacultyGroups", jsonParser, async (req, res) => {
  const { email } = req.query; 

  try {
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const groups = await Group.find({ id: { $in: faculty.groupIds.map(g => g.val) } });

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "No groups found for the faculty" });
    }

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching faculty groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/fetchFacultyGroupsNotif", jsonParser, async (req, res) => {
  const { email } = req.query; 
  console.log(email)
  try {
    const faculty = await Faculty.findOne({ email });
    console.log(faculty)
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const groups = await AdvisorRequest.find({ groupId: { $in: faculty.groupIds.map(g => g.val) } });
    const __id = groups.map(g => g.groupId)[0]
    console.log(__id)
    console.log(groups)
    console.log(groups.groupId)
    const groupDetails = await Group.findOne({id: __id})
    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "No groups found for the faculty" });
    }
    console.log(groupDetails)
    res.status(200).json(groupDetails);
  } catch (error) {
    console.error("Error fetching faculty groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/getGroupDetails', jsonParser, async (req, res)=>{
  const query = URL.parse(req.url, true).query;
  const id = query.id;
  console.log(id)
  try {
    const group = await Group.findOne({groupId: id})
    console.log(group)
    if (group){
      res.status(200).send(group)
    } else {
      res.status(200).send(null)
    }
  } catch (err){
    console.error(err)
  }
})

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
<<<<<<< HEAD
}
=======
}

app.get("/getUserGroup", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const group = await Group.findOne({ "email.val": email });
    if (group) {
      res.status(200).send(group);
    } else {
      res.status(200).send(null);
    }
  } catch (err) {
    console.error(err);
  }
});
>>>>>>> 5d8c470ef2da602b20c044011c68e9f4dd00684e
