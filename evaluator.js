const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Panel = dbSchema.Panel;
const Group = dbSchema.Group;
const Faculty = dbSchema.Faculty;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

app.get("/getAllPanels", jsonParser, async (req, res) => {
  try {
    const panels = await Panel.find();
    res.json(panels);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
app.post("/createPanel", jsonParser, async (req, res) => {
  const { faculties, groups } = req.body;
  console.log("GROUPS:", groups);
  try {
    const newPanel = new Panel({
      faculties,
      groups: groups.map((group) => ({
        id: group.id,
        title: group.title,
        groupId: group.groupId,
      })),
    });
    await newPanel.save();
    res.status(201).send(newPanel);
  } catch (err) {
    res.status(422).send(err);
    console.error(err);
  }
});

app.delete("/deletePanel/:panelId", async (req, res) => {
  const { panelId } = req.params;

  try {
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }
    const groupIds = panel.groups.map((group) => group.id);
    const facultyEmails = panel.faculties.map((faculty) => faculty.email);

    await Group.updateMany(
      { _id: { $in: groupIds } },
      {
        $set: { hasAssignedEvaluators: false },
        $unset: { evaluators: "" },
      }
    );
    await Faculty.updateMany(
      { email: { $in: facultyEmails } },
      { $pull: { roles: "Evaluator" } }
    );

    await Panel.findByIdAndDelete(panelId);

    res.json({ message: "Panel deleted successfully" });
  } catch (error) {
    console.error("Error deleting panel", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/updatePanel/:panelId", jsonParser, async (req, res) => {
  const { panelId } = req.params;
  const { newGroups, newFaculties } = req.body;
  console.log("NEW FACULTIES: ", newFaculties);
  try {
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }
    const updatedGroups = [
      ...panel.groups,
      ...newGroups.map((group) => ({
        id: group._id,
        title: group.title,
        groupId: group.id,
      })),
    ];

    let updatedFaculties = panel.faculties;
    if (newFaculties && newFaculties.length > 0) {
      const existingFacultyEmails = new Set(
        panel.faculties.map((faculty) => faculty.email)
      );

      const newFacultiesToAdd = newFaculties.filter(
        (faculty) => !existingFacultyEmails.has(faculty.email)
      );

      if (newFacultiesToAdd.length > 0) {
        updatedFaculties = [
          ...panel.faculties,
          ...newFacultiesToAdd.map((faculty) => ({
            _id: faculty._id,
            firstName: faculty.firstName,
            lastName: faculty.lastName,
            email: faculty.email,
            photo: faculty.photo,
          })),
        ];
      }
    }
    console.log("UPDATED FACULTIES", updatedFaculties);
    panel.groups = updatedGroups;
    panel.faculties = updatedFaculties;
    await panel.save();

    const groupIds = newGroups.map((group) => group._id);
    const facultyIds = newFaculties.map((faculty) => faculty._id);

    await Group.updateMany(
      { _id: { $in: groupIds } },
      {
        $set: { hasAssignedEvaluators: true },
        $addToSet: { evaluators: { $each: facultyIds } },
      }
    );

    res.json(panel);
  } catch (error) {
    console.error("Error updating panel", error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/evaluatorsToShow/:panelId/:groupIds", async (req, res) => {
  const { panelId, groupIds } = req.params;

  try {
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }

    const panelFacultyEmails = panel.faculties.map((faculty) => faculty.email);

    const groupIdArray = groupIds.split(",").map((id) => Number(id));

    const faculties = await Faculty.find({
      "groupIds.val": { $nin: groupIdArray },
      email: { $nin: panelFacultyEmails },
    });

    res.json(faculties);
  } catch (error) {
    console.error("Error fetching evaluators", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/deleteGroupFromPanel", jsonParser, async (req, res) => {
  try {
    const query = URL.parse(req.url, true).query;
    const panelId = query.panelId;
    const groupId = query.groupId;
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).send("Panel not found");
    }
    const groupToRemove = panel.groups.find((group) => group.id === groupId);
    if (!groupToRemove) {
      return res.status(404).send("Group not found in panel");
    }
    panel.groups = panel.groups.filter((group) => group.id !== groupId);
    await panel.save();

    await Group.findByIdAndUpdate(groupToRemove.id, {
      $set: { hasAssignedEvaluators: false },
      $unset: { evaluators: "" },
    });
    return res.status(200).send(panel);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

app.delete("/deleteFacultyFromPanel", jsonParser, async (req, res) => {
  try {
    const query = URL.parse(req.url, true).query;
    const panelId = query.panelId;
    const facultyId = query.facultyId;
    console.log(panelId, " ", facultyId);
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return res.status(404).send("Panel not found");
    }

    console.log("PANEL: ", panel);
    const facultyToRemove = panel.faculties.find(
      (faculty) => faculty._id === facultyId
    );
    console.log("DELETED FACULTY: ", facultyToRemove);

    if (!facultyToRemove) {
      return res.status(404).send("Faculty not found in panel");
    }
    panel.faculties = panel.faculties.filter((f) => f._id !== facultyId);
    await panel.save();

    await Faculty.updateOne(
      { email: facultyToRemove.email },
      { $pull: { roles: "Evaluator" } }
    );
    return res.status(200).send(panel);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});
module.exports = app;
