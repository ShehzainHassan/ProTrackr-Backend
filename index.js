const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const dbSchema = require("./models/user");
const User = dbSchema.User;
const Group = dbSchema.Group;
const FacultyIdea = dbSchema.FacultyIdea;
const URL = require("url");
const cors = require("cors");

const app = express();

const jsonParser = bodyParser.json();

app.use(cors());

mongoose.connect("mongodb://localhost:27017/ProTrackr", {
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("DB Connection Successful!");
});

app.listen(3002, () => console.log("Example app is listening on port 3001."));

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
  console.log(req.body);
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
  const query = URL.parse(req.url, true).query;
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
  const query = URL.parse(req.url, true).query;
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
  const query = URL.parse(req.url, true).query;
  try {
    const allIdeas = await FacultyIdea.find({});
    if (allIdeas) {
      console.log(allIdeas);
      res.status(200).send(allIdeas);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/joinGroup", jsonParser, async (req, res) => {
  const { id, email } = req.body;

  const parsedId = parseFloat(String(id));

  const group = await Group.findOne({ id: parsedId });
  console.log(group);
  if (group) {
    const emails = group.email;

    const emailExists = emails.some((e) => e.val == email);

    if (emailExists) {
      res.status(409).send("Email already exists");
      return;
    }

    emails.push({ val: email });
    group.db.collection("groups").updateOne(
      { id: parsedId },
      {
        $set: { email: emails },
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

app.post("/login", jsonParser, async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  try {
    const loggedUser = await User.findOne({ email, password });
    console.log(loggedUser);
    if (loggedUser) {
      console.log("Successfully Logged In");
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

// // Defining User model
// const User = mongoose.model('User', User.userSchema);

// User.createCollection().then(function (collection) {
//     console.log('Collection is created!');
// });
