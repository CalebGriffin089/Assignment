  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const http = require('http');
  const socketIo = require('socket.io');

  const fs = require('fs');
  const app = express();
  const listen = require("./listen.js")
  const sockets = require("./socket.js");
const { group } = require('console');
const { userInfo } = require('os');
  app.use(cors());
  const server = http.Server(app);
  const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:4200',  // Allow connections from Angular app
      methods: ['GET', 'POST'],
    }
  });
  // Middleware
  app.use(express.static(__dirname + '/www'));
  app.use(express.json());

  class User{
      constructor(username, birthdate, age, email, password, valid){
          this.username = username;
          this.birthdate = birthdate;
          this.age = age;
          this.email = email;
          this.password = password;
          this.valid = valid;
      }
      upDateVlaid(){
          this.valid = true;
      }

      removePwd(){
          this.password = '';
      }
  }

  // API endpoint
  app.post('/api/auth', function(req, res) {
    // Check if user exists and passwords match
    fs.readFile("./data/users.txt", "utf8", (err, data) => {
      if (err) {
        console.log("Error reading file");
        return;
      }

      let fileData = [];
      try {
        fileData = JSON.parse(data); // Parse existing user data
      } catch (err) {
        console.log("Error parsing JSON data");
      } 
      user = false;
      for(let i =0; i <fileData.length; i++){
        if(fileData[i].username === req.body.username && fileData[i].password === req.body.password){
          user = fileData[i]
          user.valid = true;
          break;
        }
      }
      
      if(user){
        res.json(user);
      }else{
        res.json({ valid: false });
      }
    });
  });

app.post('/api/create', function(req, res) {
    const user = {
      id: null,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      group:[],
      roles: [],
    }
    file = [];
    fs.readFile("./data/users.txt", "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file");
      return;
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data); // Parse existing user data
    } catch (err) {
      console.log("Error parsing JSON data");
    }

    // Add new user to the array
    user.id = parseInt(fileData[fileData.length-1].id)+1;
    fileData.push(user);

    // Write updated data back to the file
    fs.writeFile("./data/users.txt", JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to file");
        return;
      }
      console.log("user Registered");
      res.json({ valid: true });
    });
  });
});

app.post('/api/join', function(req, res){
  const user = {
    id: req.body.id,
    group: req.body.group,
  }
  console.log("Groups: "+ user.group);

  fs.readFile("./data/users.txt", "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file");
      return;
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data); // Parse existing user data
    } catch (err) {
      console.log("Error parsing JSON data");
    }

    for(let i =0; i <fileData.length; i++){
        if(parseInt(fileData[i].id) == parseInt(user.id)){
          for(let j =0; j<user.group.length;j++){
            fileData[i].group.push(user.group[j]);
          }
          console.log(user.group);
          break;
        }
      }

    // Write updated data back to the file
    fs.writeFile("./data/users.txt", JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to file");
        return;
      }
      console.log("user Registered");
      res.json({ valid: true });
    });
  });
});

sockets(io)



// Start server
listen(server)

