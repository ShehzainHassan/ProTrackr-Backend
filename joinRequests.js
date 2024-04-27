const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const User = dbSchema.User;
const Group = dbSchema.Group;
const JoinRequest = dbSchema.JoinRequest;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

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

module.exports = app;
