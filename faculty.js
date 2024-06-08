const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Faculty = dbSchema.Faculty;
const Group = dbSchema.Group;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

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
      roles: ["Supervisor"],
    });
    await newFaculty.save();

    res.status(201).send(newFaculty); // Return newly created faculty
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

// Route for updating an existing faculty entry
// Route for updating faculty details
// Route for updating faculty details
// Update Faculty Details

app.get("/isRegisteredFacultyEmail", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const faculty = await Faculty.findOne({ email });
    if (faculty) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    console.error(err);
  }
});

app.get("/isCommiteeMember", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const email = query.email;
  try {
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).send("Faculty not found.");
    }
    const isCommitteeMember = faculty.roles.includes("Committee_Member");

    if (isCommitteeMember) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    console.error(err);
  }
});

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
        interest_Tags: interest_Tags.map((tag) => tag.value),
         // Map the interest_Tags array to extract only the value property
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

app.put("/assignCommitteeMember", jsonParser, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ _id: req.body._id });
    console.log(faculty);
    faculty.roles.push("Committee_Member");
    await faculty.save();
    res.status(200).send("Committee member assigned successfully.");
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).send(err);
  }
});

app.delete("/removeCommitteeMember/:id", jsonParser, async (req, res) => {
  try {
    console.log(req.params);
    const faculty = await Faculty.findOne({ _id: req.params.id });
    console.log(faculty);
    const index = faculty.roles.indexOf("Committee_Member");

    if (index > -1) {
      faculty.roles.splice(index, 1);
    }

    await faculty.save();

    res.status(200).send("Committee member removed successfully.");
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).send(err);
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

app.post("/groupsToShow", jsonParser, async (req, res) => {
  try {
    const facultyIDs = req.body;
    const groupIds = [];
    for (let i = 0; i < facultyIDs.length; i++) {
      const faculty = await Faculty.findOne({ _id: facultyIDs[i] });
      if (faculty && faculty.groupIds) {
        groupIds.push(...faculty.groupIds.map((group) => +group.val));
      }
    }
    console.log(groupIds);
    const group = await Group.find({ id: { $nin: groupIds } });
    const updatedGroups = group.filter(
      (group => group.Status === "LOCKED" && group.advisor)
    );
    res.status(201).send(updatedGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/updateFaculty", jsonParser, async (req, res) => {
  const { group_id, facultyId } = req.body;
  console.log(group_id);
  console.log(facultyId);
  try {
    const faculty = await Faculty.findOne({ _id: facultyId });
    console.log(faculty);
    if (faculty) {
      const groupIdExists = faculty.groupIds.some(
        (groupObj) => groupObj.val === group_id
      );

      if (!groupIdExists) {
        faculty.groupIds.push({ val: group_id });
        faculty.slotsLeft -= 1;
        await faculty.save();
        res.status(200).json({ message: "Group ID added successfully" });
      } else {
        res.status(400).json({ message: "Group ID already exists" });
      }
    } else {
      res.status(404).json({ message: "Faculty not found" });
    }
  } catch (error) {
    console.error("Error updating faculty:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/addEvaluatorRole", jsonParser, async (req, res) => {
  const { facultyId } = req.body;
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty member not found" });
    }
    if (!faculty.roles.includes("Evaluator")) {
      faculty.roles.push("Evaluator");
      await faculty.save();
    }
    res
      .status(200)
      .json({ message: "Evaluator role added successfully", faculty });
  } catch (error) {
    res.status(500).json({ message: "Error updating roles", error });
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

app.get("/fetchFacultyGroups", jsonParser, async (req, res) => {
  const { email } = req.query;

  try {
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const groups = await Group.find({
      id: { $in: faculty.groupIds.map((g) => g.val) },
    });

    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ message: "No groups found for the faculty" });
    }

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching faculty groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = app;
