const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const FacultyIdea = dbSchema.FacultyIdea;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

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
module.exports = app;
