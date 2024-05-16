const server = require("./server");
const studentRoutes = require("./student");
const groupRoutes = require("./group");
const facultyRoutes = require("./faculty");
const otpRoutes = require("./otp");
const joinRequestRoutes = require("./joinRequests");
const facultyIdeasRoutes = require("./facultyIdeas");
const advisorRequestRoutes = require("./advisorRequests");
const announcementRoutes = require("./annoucements");

server.use(studentRoutes);
server.use(groupRoutes);
server.use(facultyRoutes);
server.use(otpRoutes);
server.use(joinRequestRoutes);
server.use(facultyIdeasRoutes);
server.use(advisorRequestRoutes);
server.use(announcementRoutes);
