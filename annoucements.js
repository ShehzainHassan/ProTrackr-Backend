const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const Announcement = dbSchema.Announcement;
const PastFYP = dbSchema.PastFYP;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });
const fileupload = require("express-fileupload");
const firebaseStorage = require("firebase/storage");
const { getStorage, ref, uploadBytes } = firebaseStorage;
const csv = require("csv-parser");
const fs = require("fs");
const axios = require("axios");

const storage = getStorage();
app.use(fileupload());
app.post("/addAnnouncement", jsonParser, async (req, res) => {
  console.log("ANNOUNCEMENT");
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
        uploadedFile?.mimetype?.includes("txt") ||
        uploadedFile?.mimetype?.includes("text") ||
        uploadedFile?.mimetype?.includes("ppt") ||
        uploadedFile?.mimetype?.includes("pptx") ||
        uploadedFile?.mimetype?.includes("jpeg") ||
        uploadedFile?.mimetype?.includes("jpg") ||
        uploadedFile?.mimetype?.includes("png") ||
        uploadedFile?.mimetype?.includes("gif")
      )
    ) {
      res.status(400).send("File type not allowed");
    }
    if (uploadedFile?.size > 10 * 1024 * 1024) {
      res.status(400).send("File size too large");
    }

    console.log("UPLOADED FILE", uploadedFile);
    const fileRef = ref(storage, uploadedFile?.name);
    try {
      await uploadBytes(fileRef, uploadedFile?.data);
      fileUrl = await firebaseStorage.getDownloadURL(fileRef);
      console.log("File Url:", fileUrl);
    } catch (err) {
      console.log(err);
    }
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

app.put("/removeAnnouncementNotification", jsonParser, async (req, res) => {
  const { id, email } = req.body;
  try {
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).send("Announcement not found");
    }
    if (!announcement.hasRead.includes(email)) {
      announcement.hasRead.push(email);
    }
    await announcement.save();

    res.status(200).send("Success");
  } catch (err) {
    console.error("Error removing announcement notification: ", err);
    res.status(500).send("Internal Server Error");
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
  const { photo, commentor, val, email, createdTime } = req.body;

  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).send("Announcement not Found");
    }
    announcement.Comments.push({ photo, email, commentor, val, createdTime });
    await announcement.save();
    return res.status(201).send(announcement);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.delete("/deleteComment", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const announcement_id = query.announcement_id;
  const comment_id = query.comment_id;
  try {
    const announcement = await Announcement.findById(announcement_id);
    if (!announcement) {
      return res.status(404).send("Announcement not found");
    }
    const comment = announcement.Comments.find(
      (comment) => comment.id === comment_id
    );
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    await Announcement.updateOne(
      { _id: announcement_id },
      { $pull: { Comments: { _id: comment_id } } }
    );
    return res.status(200).send("Comment deleted successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});
app.post("/UploadPastFYP", jsonParser, async (req, res) => {
  console.log("BODY: ", req.body);
  const { UploadedBy, file } = req.body;
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
        uploadedFile?.mimetype?.includes("txt") ||
        uploadedFile?.mimetype?.includes("text") ||
        uploadedFile?.mimetype?.includes("ppt") ||
        uploadedFile?.mimetype?.includes("pptx") ||
        uploadedFile?.mimetype?.includes("jpeg") ||
        uploadedFile?.mimetype?.includes("jpg") ||
        uploadedFile?.mimetype?.includes("png") ||
        uploadedFile?.mimetype?.includes("gif")
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
    const pastfyp = new PastFYP({
      UploadedBy,
      filePath: fileUrl,
    });
    await pastfyp.save();
    res.status(201).send(pastfyp);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.delete("/deletePastFYP", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const id = query.id;
  try {
    const pastfyp = await PastFYP.findOneAndUpdate(
      { _id: id },
      { upsert: false }
    );
    if (!pastfyp) {
      return res.status(404).json({ message: "FYP not found" });
    }
    return res.status(200).json({ announcement: " FYP deleted successfully" });
  } catch (error) {
    console.error("Error deleting FYP ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getPastFYPs", jsonParser, async (req, res) => {
  try {
    const allpastfyps = await PastFYP.find({});
    if (allpastfyps) {
      res.status(200).send(allpastfyps);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/uploadCSV", jsonParser, async (req, res) => {
  const { file } = req.body;
  console.log("Request: ", req);
  let fileUrl = null;
  console.log("File: ", file);
  if (file != "null") {
    const uploadedFile = req?.files?.file;
    console.log(req.files);
    console.log("File type: ", uploadedFile?.mimetype);
    if (uploadedFile?.size > 10 * 1024 * 1024) {
      return res.status(400).send("File size too large");
    }

    console.log("UPLOADED FILE", uploadedFile);

    const fileRef = ref(storage, uploadedFile?.name);
    await uploadBytes(fileRef, uploadedFile?.data);

    fileUrl = await firebaseStorage.getDownloadURL(fileRef);
    console.log("File Url:", fileUrl);
  }
  try {
    const admin = await dbSchema.Admin.findOne();
    admin.filePath = fileUrl;
    await admin.save();
    res.status(201).send(admin);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});

app.post("/readCSV_UploadStudents", async (req, res) => {
  try {
    const admin = await dbSchema.Admin.findOne();
    console.log(admin);
    const firebaseURL = admin.filePath;
    const response = await axios.get(firebaseURL, { responseType: "stream" });
    let newStudentsCount = 0;
    const processingPromises = [];

    const csvStream = response.data.pipe(csv());

    csvStream.on("data", (row) => {
      const processRow = async () => {
        if (row.isDisabled === "TRUE" || row.isDisabled === "true") {
          row.isDisabled = true;
        } else if (row.isDisabled === "FALSE" || row.isDisabled === "false") {
          row.isDisabled = false;
        }

        try {
          const existingStudent = await dbSchema.User.findOne({
            email: row.email,
          });
          if (!existingStudent) {
            const newStudent = new dbSchema.User(row);
            await newStudent.save();
            newStudentsCount++;
            await sendWelcomeEmail(row.email);
            await sleep(3000);
          } else {
            console.log(
              `Skipping registration for student with email ${row.email} (already exists)`
            );
          }
        } catch (saveError) {
          console.error("Error saving student:", saveError);
        }
      };

      processingPromises.push(processRow());
    });

    csvStream.on("end", async () => {
      try {
        await Promise.all(processingPromises);
        console.log("CSV file successfully processed");
        console.log("New Students Count: ", newStudentsCount);
        res.status(200).json(newStudentsCount);
      } catch (processingError) {
        console.error("Error processing rows:", processingError);
        res.status(500).send("Error processing rows");
      }
    });

    csvStream.on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error reading CSV file");
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/readCSV_registerFaculty", async (req, res) => {
  try {
    const admin = await dbSchema.Admin.findOne();
    const firebaseURL = admin.filePath;
    const response = await axios.get(firebaseURL, { responseType: "stream" });
    let newFacultyCount = 0;
    const processingPromises = [];

    const csvStream = response.data.pipe(csv());

    csvStream.on("data", (row) => {
      const processRow = async () => {
        try {
          const existingFaculty = await dbSchema.Faculty.findOne({
            email: row.email,
          });
          if (!existingFaculty) {
            let parsedGroupIds = [];
            let parsedTags = [];

            // Check if groupIds is not empty and is valid JSON
            if (row.groupIds && row.groupIds.trim() !== "") {
              parsedGroupIds = JSON.parse(row.groupIds);
            }
            // Check if interest_Tags is not empty and is valid JSON
            if (row.interest_Tags && row.interest_Tags.trim() !== "") {
              parsedTags = JSON.parse(row.interest_Tags);
            }

            const newFaculty = new dbSchema.Faculty({
              ...row,
              groupIds: parsedGroupIds,
              interest_Tags: parsedTags,
            });
            await newFaculty.save();
            newFacultyCount++;
          } else {
            console.log(
              `Skipping registration for faculty with email ${row.email} (already exists)`
            );
          }
        } catch (saveError) {
          console.error("Error saving faculty:", saveError);
        }
      };

      processingPromises.push(processRow());
    });

    csvStream.on("end", async () => {
      try {
        await Promise.all(processingPromises);
        console.log("CSV file successfully processed");
        console.log("New Faculty Count: ", newFacultyCount);
        res.status(200).json(newFacultyCount);
      } catch (processingError) {
        console.error("Error processing rows:", processingError);
        res.status(500).send("Error processing rows");
      }
    });

    csvStream.on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error reading CSV file");
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal server error");
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const nodemailer = require("nodemailer");

async function sendWelcomeEmail(email) {
  const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 20,
    service: "hotmail",
    auth: {
      user: "ProTrackr@hotmail.com",
      pass: "1234admin1234",
    },
  });

  const mailOptions = {
    from: "ProTrackr@hotmail.com",
    to: email,
    subject: "Welcome to ProTrackr",
    text: `
      Dear Student,
      
      Welcome to ProTrackr. Here are your login details:
      
      Email: <strong>${email}</strong>
      Password: <strong>12345678</strong>

      Please make sure to change your password immediately after logging in. You can do this by using Forget Password on login page.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}
module.exports = app;
