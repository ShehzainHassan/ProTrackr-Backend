const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser')

const User = require('./models/user')

const cors = require('cors')

const app = express();

const jsonParser = bodyParser.json()


app.use(cors())

mongoose.connect("mongodb://localhost:27017/ProTrackr", {
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("DB Connection Successful!");
});

app.listen(3002, () => console.log('Example app is listening on port 3001.'));

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.post('/signup', jsonParser, async(req, res) => {
    const {firstName, lastName, rollNo, cgpa, email, sdaGrade, creditHours, password, photo} = req.body;

    try{
        const user = new User({firstName, lastName, rollNo, cgpa, email, sdaGrade, creditHours, password, photo});
        user.save();    
        res.status(201).send(user);
    }
    catch (err){
        res.status(422).send(err);
        console.log(err);
    }
})

app.post('/login', jsonParser, async(req, res) => {
    const {email, password} = req.body;
    try
    {
        const loggedUser = await User.findOne({email, password});

        if (loggedUser){
            console.log("Successfully Logged In");
            res.status(201).send(email, password);
        }
        else{
            console.error("Invalid email or password");
            res.status(201).send(false);
        }
        // const credentials = db.collection('users').find({}, {projection: {email: 1, password: 1, _id:0 }});
        // let isValidCredentials = false;
        // credentials.forEach(document => {
        //     if (email === document.email && password === document.password){
        //         console.log("Successfully Logged In");
        //         // console.log(db.collection('users').findOne({}, (error, result) => {console.log(result)}))
        //         res.status(201).send({email, password});
        //         return;
        //     }
        // })
        // console.log("Invalid Credentials");
        // res.status(201).send({});        
    }
    catch (err){
        res.status(422).send(err);
        console.log(err);
    }
})


// // Defining User model 
// const User = mongoose.model('User', User.userSchema); 
  
// User.createCollection().then(function (collection) { 
//     console.log('Collection is created!'); 
// });