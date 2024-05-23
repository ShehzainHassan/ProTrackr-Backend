const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Announcement = dbSchema.Announcement;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });
const fileupload = require("express-fileupload");
const firebaseStorage = require("firebase/storage");
const { getStorage, ref, uploadBytes } = firebaseStorage;

const storage = getStorage();
app.use(fileupload());
app.post("/addAnnouncement", jsonParser, async (req, res) => {
  const { announcementType, dateTime, description, title, postedBy, file } =
    req.body;
  let fileUrl = null;
  console.log("File: ", file);
  if (file != "null") {
    const uploadedFile = req?.files?.file;

    console.log("File type: ", uploadedFile?.mimetype);
    if (
      !(
        uploadedFile?.mimetype?.includes("pdf") ||
        uploadedFile?.mimetype?.includes("docx") ||
        uploadedFile?.mimetype?.includes("doc") ||
        uploadedFile?.mimetype?.includes("xlsx") ||
        uploadedFile?.mimetype?.includes("txt")
      )
    ) {
      res.status(400).send("File type not allowed");
    }
    if (uploadedFile?.size > 10 * 1024 * 1024) {
      res.status(400).send("File size too large");
    }

    console.log("UPLOADED FILE", uploadedFile);
    const fileRef = ref(storage, uploadedFile?.name);
    await uploadBytes(fileRef, uploadedFile?.data);
    fileUrl = await firebaseStorage.getDownloadURL(fileRef);
    console.log("File Url:", fileUrl);
  }
  try {
    const announcement = new Announcement({
      announcementType,
      dateTime,
      description,
      title,
      postedBy,
      isRead: false,
      filePath: fileUrl,
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
