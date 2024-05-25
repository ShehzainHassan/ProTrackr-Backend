// const express = require("express");
// const bodyParser = require("body-parser");
// const URL = require("url");
// const dbSchema = require("./models/user");
// const PastFYP = dbSchema.PastFYP;
// const app = express();
// const jsonParser = bodyParser.json({ limit: "50mb" });
// const fileupload = require("express-fileupload");
// const firebaseStorage = require("firebase/storage");
// const { getStorage, ref, uploadBytes } = firebaseStorage;

// const storage = getStorage();
// app.use(fileupload());
// app.post("/UploadPastFYP", jsonParser, async (req, res) => {
//   const {UploadedBy,file } =
//     req.body;
//   let fileUrl = null;
//   console.log("File: ", file);
//   if (file != "null") {
//     const uploadedFile = req?.files?.file;

//     console.log("File type: ", uploadedFile?.mimetype);
//     if (
//       !(
//         uploadedFile?.mimetype?.includes("pdf") ||
//         uploadedFile?.mimetype?.includes("docx") ||
//         uploadedFile?.mimetype?.includes("doc") ||
//         uploadedFile?.mimetype?.includes("xlsx") ||
//         uploadedFile?.mimetype?.includes("txt")
//       )
//     ) {
//       res.status(400).send("File type not allowed");
//     }
//     if (uploadedFile?.size > 10 * 1024 * 1024) {
//       res.status(400).send("File size too large");
//     }

//     console.log("UPLOADED FILE", uploadedFile);
//     const fileRef = ref(storage, uploadedFile?.name);
//     await uploadBytes(fileRef, uploadedFile?.data);
//     fileUrl = await firebaseStorage.getDownloadURL(fileRef);
//     console.log("File Url:", fileUrl);
//   }
//   try {
//     const pastfyp = new PastFYP({

//       UploadedBy,
//       filePath: fileUrl,
//     });
//     await pastfyp.save();
//     res.status(201).send(pastfyp);
//   } catch (err) {
//     res.status(422).send(err);
//     console.log(err);
//   }
// });
// app.delete("/deletePastFYP", jsonParser, async (req, res) => {
//   const query = URL.parse(req.url, true).query;
//   const id = query.id;
//   try {
//     const pastfyp = await PastFYP.findOneAndUpdate(
//       { _id: id },
//       { upsert: false }
//     );
//     if (!pastfyp) {
//       return res.status(404).json({ message: "FYP not found" });
//     }
//     return res
//       .status(200)
//       .json({ announcement: " FYP deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting FYP ", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.get("/getPastFYPs", jsonParser, async (req, res) => {
//   try {
//     const allpastfyps = await PastFYP.find({});
//     if (allpastfyps) {
//       res.status(200).send(allpastfyps);
//     }
//   } catch (err) {
//     res.status(422).send(err);
//     console.log(err);
//   }
// });

// module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const URL = require("url");
const dbSchema = require("./models/user");
const PastFYP = dbSchema.PastFYP;
const app = express();
const jsonParser = bodyParser.json({ limit: "50mb" });
const fileupload = require("express-fileupload");
const firebaseStorage = require("firebase/storage");
const { getStorage, ref, uploadBytes } = firebaseStorage;

const storage = getStorage();
app.use(fileupload());
app.post("/pastFYP", jsonParser, async (req, res) => {
  const { postedBy, file } =
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
    const announcement = new PastFYP({
    
      postedBy,
      filePath: fileUrl,
    });
    await announcement.save();
    res.status(201).send(announcement);
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});
app.delete("/deletefyp", jsonParser, async (req, res) => {
  const query = URL.parse(req.url, true).query;
  const id = query.id;
  try {
    const announcement = await PastFYP.findOneAndUpdate(
      { _id: id },
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

app.get("/getfyp", jsonParser, async (req, res) => {
  try {
    const allAnnouncements = await PastFYP.find({});
    if (allAnnouncements) {
      res.status(200).send(allAnnouncements);
    }
  } catch (err) {
    res.status(422).send(err);
    console.log(err);
  }
});


module.exports = app;

