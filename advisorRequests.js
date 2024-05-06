const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const { ObjectId } = require("mongodb");
const User = dbSchema.User;
const Group = dbSchema.Group;
const Faculty = dbSchema.Faculty;
const AdvisorRequest = dbSchema.AdvisorRequest;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

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

app.get("/fetchFacultyGroupsNotif", jsonParser, async (req, res) => {
  const { email } = req.query;
  console.log(email);
  try {
    const faculty = await Faculty.findOne({ email });
    console.log(faculty);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const groups = await AdvisorRequest.find({
      groupId: { $in: faculty.groupIds.map((g) => g.val) },
    });
    const __id = groups.map((g) => g.groupId)[0];
    console.log(__id);
    console.log(groups);
    console.log(groups.groupId);
    const groupDetails = await Group.findOne({ id: __id });
    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ message: "No groups found for the faculty" });
    }
    console.log(groupDetails);
    res.status(200).json(groupDetails);
  } catch (error) {
    console.error("Error fetching faculty groups:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = app;
