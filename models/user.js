const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  rollNo: String,
  email: String,
  cgpa: Number,
  sdaGrade: String,
  creditHours: Number,
  password: String,
  photo: String,
    
});

const User = mongoose.model('User', userSchema); 
  
User.createCollection().then(function (collection) { 
    console.log('Collection is created!'); 
});

module.exports = mongoose.model('User', userSchema);
