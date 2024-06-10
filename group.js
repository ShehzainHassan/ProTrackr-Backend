const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const User = dbSchema.User;
const Group = dbSchema.Group;
const { sendMeetingEmails } = require("./scheduleMeet"); 
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

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
  const { advisorId, email, name, img } = req.body;
  try {
    const group = await Group.findOne({ "email.val": email });
    if (!group) {
      return res.status(404).send("User group not found");
    }
    (group.advisorId = advisorId), (group.advisor = name);
    group.Faculty_img = img;

    await group.save();
  } catch (err) {
    console.error(err);
  }
});

app.post("/addEvaluators", jsonParser, async (req, res) => {
  try {
    const { selectedFacultyIds, selectedGroupIds } = req.body;
    for (let i = 0; i < selectedGroupIds.length; i++) {
      const group = await Group.findById(selectedGroupIds[i]);
      console.log("Group: ", group);
      if (!group) {
        return res.status(404).json({ error: "Group not found." });
      }
      group.evaluators.push(...selectedFacultyIds);
      await group.save();
    }

    res.status(200).json({ message: "Evaluators added successfully." });
  } catch (error) {
    console.error("Error adding evaluators:", error);
    res.status(500).json({ error: "Error adding evaluators." });
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
      email: user.email,
      batch: user.batch,        
      rollNo: user.rollNo,       
      photo: user.photo
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

app.get("/getGroupDetails", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const id = query.id;
  console.log(id);
  try {
    const group = await Group.findOne({ groupId: id });
    console.log(group);
    if (group) {
      res.status(200).send(group);
    } else {
      res.status(200).send(null);
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

app.put("/updateGroupEvaluators", jsonParser, async (req, res) => {
  const { groupId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    group.hasAssignedEvaluators = true;
    await group.save();
    res
      .status(200)
      .json({ message: "Group has assigned evaluator successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error updating group", error });
  }
});

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

app.post("/scheduleMeeting", jsonParser, async (req, res) => {
  try {
    const { title, description, date, time, attendees } = req.body;

    if (!title || !description || !date || !time || !attendees) {
      return res.status(400).send("Missing required fields");
    }

    // Send emails to attendees
    await sendMeetingEmails(attendees, title, description, date, time);

    res.status(201).send({ message: "Meeting invitations sent successfully" });
  } catch (error) {
    console.error("Error sending meeting invitations:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
