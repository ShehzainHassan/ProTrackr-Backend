const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Panel = dbSchema.Panel;
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

  try {
    const newPanel = new Panel({
      faculties,
      groups,
    });
    await newPanel.save();
    res.status(201).send(newPanel);
  } catch (err) {
    res.status(422).send(err);
    console.error(err);
  }
});

module.exports = app;
