const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const joinRequestSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  profile_pic: String,
  groupId: Number,
  createdTime: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);

JoinRequest.createCollection().then(function (collection) {
  console.log("Join Requests Collection is created!");
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  major: String,
  rollNo: String,
  email: String,
  cgpa: Number,
  sdaGrade: String,
  creditHours: Number,
  password: String,
  photo: String,
  fypStartSemester: {
    type: String,
    default: "Spring 2024",
  },
  fypType: {
    type: String,
    default: "FYP-1",
  },
  batch: {
    type: String,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const requestAdvisorSchema = new mongoose.Schema({
  name: String,
  from: String,
  to: String,
  profile_pic: String,
  groupId: Number,
  createdTime: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const AdvisorRequest = mongoose.model("AdvisorRequest", requestAdvisorSchema);

AdvisorRequest.createCollection().then(function (collection) {
  console.log("Request Advisor Collection is created!");
});

const User = mongoose.model("User", userSchema);

User.createCollection().then(function (collection) {
  console.log("Collection is created!");
});

const FacultySchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  roomNo: String,
  interest_Tags: [String],
  curr_education: String,
  password: String,
  photo: String,
  groupIds: [{ val: String }],
  roles: [String],
  slotsLeft: {
    type: Number,
    default: 5,
  },
});

const Faculty = mongoose.model("Faculty", FacultySchema);

Faculty.createCollection().then(function (collection) {
  console.log("Faculty Collection is created");
});

const groupSchema = new mongoose.Schema({
  FYP_type: String,
  Faculty_img: String,
  Status: String,
  Tags: [{ val: String }],
  description: String,
  email: [{ val: String }],
  id: Number,
  img: [{ val: String }],
  leader: String,
  title: String,
  advisor: String,
  evaluators: {
    type: [String],
  },
  hasAssignedEvaluators: {
    type: Boolean,
    default: false,
  },
  advisorId: {
    type: String,
  },
});

const Group = mongoose.model("Group", groupSchema);

Group.createCollection().then(function (collection) {
  console.log("Group Collection is created!");
});

const FacultyIdeaSchema = new mongoose.Schema({
  FYP_type: String,
  Faculty_img: String,
  Tags: [{ val: String }],
  description: String,
  id: Number,
  title: String,
  contact: String,
  advisor: String,
});

const FacultyIdea = mongoose.model("FacultyIdea", FacultyIdeaSchema);

FacultyIdea.createCollection().then(function (collection) {
  console.log("Faculty Idea Schema is created!");
});

const userOTP = new mongoose.Schema({
  email: String,
  OTP: Number,
});

const UserOTP = mongoose.model("UserOTP", userOTP);
UserOTP.createCollection().then(function (collection) {});

const announcement = new mongoose.Schema({
  announcementType: String,
  dateTime: String,
  description: String,
  title: String,
  postedBy: String,
  isRead: Boolean,
  // email: [{ val: String }],
  createdTime: { type: Date, default: Date.now },
  Comments: [{ email: String, commentor: String, val: String }],
  filePath: String,
});
const Announcement = mongoose.model("Announcement", announcement);
Announcement.createCollection().then(function (collection) {});

const pastFYPSchema = new mongoose.Schema({
  UploadedBy: String,
  createdTime: { type: Date, default: Date.now },
  filePath: String,
});

const PastFYP = mongoose.model("PastFYP", pastFYPSchema);
PastFYP.createCollection().then(function (collection) {});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  filePath: {
    type: String,
    default: "",
  },
});
const Admin = mongoose.model("Admin", adminSchema);
Admin.createCollection().then(async function (collection) {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@lhr.nu.edu.pk" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("top_secret", 10);
      await Admin.create({
        email: "admin@lhr.nu.edu.pk",
        password: hashedPassword,
      });
      console.log("Admin credentials inserted successfully.");
    } else {
      console.log("Admin credentials already exist.");
    }
  } catch (error) {
    console.error("Error inserting admin credentials:", error);
  }
});

const panelSchema = new mongoose.Schema({
  faculties: {
    type: [],
  },
  groups: {
    type: [String],
  },
});
const Panel = mongoose.model("Panel", panelSchema);
Panel.createCollection().then(function (collection) {});

exports.User = User;
exports.Group = Group;
exports.FacultyIdea = FacultyIdea;
exports.UserOTP = UserOTP;
exports.JoinRequest = JoinRequest;
exports.Faculty = Faculty;
exports.AdvisorRequest = AdvisorRequest;
exports.Announcement = Announcement;
exports.PastFYP = PastFYP;
exports.Admin = Admin;
exports.Panel = Panel;
