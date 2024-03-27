const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  rollNo: String,
  email: String,
  cgpa: Number,
  sdaGrade: String,
  major: String,
  creditHours: Number,
  password: String,
  photo: String,
});

const User = mongoose.model("User", userSchema);

User.createCollection().then(function (collection) {
  console.log("Collection is created!");
});

// module.exports = mongoose.model("User", userSchema);

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

const joinRequestSchema = new mongoose.Schema({
  from: String,
  to: String,
  groupId: Number,
  createdTime: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);

JoinRequest.createCollection().then(function (collection) {
  console.log("Join Requests Collection is created!");
});

const UserOTP = mongoose.model("UserOTP", userOTP);
UserOTP.createCollection().then(function (collection) {});

exports.User = User;
exports.Group = Group;
exports.FacultyIdea = FacultyIdea;
exports.UserOTP = UserOTP;
exports.JoinRequest = JoinRequest;
