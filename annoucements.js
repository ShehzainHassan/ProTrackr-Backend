const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Announcement = dbSchema.Announcement;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });

app.post("/addAnnouncement", jsonParser, async (req, res) => {
  const { announcementType, dateTime, description, title, postedBy } = req.body;
  try {
    const announcement = new Announcement({
      announcementType,
      dateTime,
      description,
      title,
      postedBy,
      isRead: false,
    });
    await announcement.save();
    res.status(201).send(announcement);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});
app.delete("/deleteAnnouncement", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const id = query.id;
  try {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: id },
      { $set: { isRead: true } },
      { upsert: false }
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    return res
      .status(200)
      .json({ announcement: " Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getAnnouncements", jsonParser, async (req, res) => {
  try {
    const allAnnouncements = await Announcement.find({});
    if (allAnnouncements) {
      res.status(200).send(allAnnouncements);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/addComment/:id", jsonParser, async (req, res) => {
  const { id } = req.params;
  const { commentor, val } = req.body;

  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).send("Announcement not Found");
    }
    announcement.Comments.push({ commentor, val });
    await announcement.save();
    return res.status(201).send(announcement);
  } catch (err) {
    return res.status(500).send(err);
  }
});
module.exports = app;
