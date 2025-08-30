  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const http = require('http');
  const socketIo = require('socket.io');

  const fs = require('fs');
  const app = express();
  const listen = require("./listen.js")
  const sockets = require("./socket.js");
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
      groups:[],
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
    found = false
    for(let i =0; i <fileData.length; i++){
      if(fileData[i].username == user.username){
        console.log("FIOUND");
        found = true
        break;
      }
    }
    // Add new user to the array
    if(!found){
      user.id = parseInt(fileData[fileData.length-1].id)+1;
      fileData.push(user);

      // Write updated data back to the file
      fs.writeFile("./data/users.txt", JSON.stringify(fileData, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to file");
          return;
        }
        console.log("user Registered");
        res.json({ valid: false });
      });
    }else{
      res.json({ valid: "username taken" })
    }
  });
});

app.post('/api/createGroup', function(req, res) {
    const groupData = {
      id: 0,
      channels: [req.body.channels],
      admins: [req.body.members],
      banned: null,
      members: req.body.members
    }
    file = [];
    fs.readFile("./data/groups.txt", "utf8", (err, data) => {
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
    groupData.id = parseInt(fileData[fileData.length-1].id)+1;
    fileData.push(groupData);
    console.log(groupData);
    // Write updated data back to the file
    fs.writeFile("./data/groups.txt", JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to file");
        return;
      }
      console.log("Group Registered");
      res.json({ valid: true });
    });
  });
});


app.post('/api/join', function(req, res){
  const user = {
    id: req.body.id,
    groups: req.body.groups,
    username: req.body.username,
    newGroup: req.body.newGroup
  };

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

    //update user text file user groups
    for (let i = 0; i < fileData.length; i++) {
      if (parseInt(fileData[i].id) === parseInt(user.id)) {
        fileData[i].groups = user.groups
        console.log("Updated Channels:", fileData[i].groups);
        //add user as a group member
        fs.readFile("./data/groups.txt", "utf8", (err, data2) => {
          if (err) {
            console.log("Error reading file");
            return;
          }
          let groupsData = [];
          try {
            groupsData = JSON.parse(data2); // Parse existing user data
          } catch (err) {
            console.log("Error parsing JSON data");
          }

          for(let i =0; i <groupsData.length; i++){
            if(groupsData[i].id == user.newGroup){
              temp =groupsData[i].members
              temp.push(user.username);
              console.log(temp);
              groupsData[i].members = temp
              break;
            }
          }

          fs.writeFile("./data/groups.txt", JSON.stringify(groupsData, null, 2), "utf8", (err) => {
            if (err) {
              console.log("Error writing to groups file");
              return;
            }
          })

        })


        break;
      }
    }

    // Write updated data back to the file
    fs.writeFile("./data/users.txt", JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to users file");
        return;
      }
      console.log("User Registered");
      res.json({ valid: true });
    });
  });
});


app.post('/api/getChannels', function(req, res){
  fs.readFile("./data/groups.txt", "utf8", (err, data) => {
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
    channels = [];
    for (let i = 0; i < fileData.length; i++) {
      if (parseInt(fileData[i].id) === parseInt(req.body.id)) {
        console.log("TEST");
        channels = fileData[i].channels
        break;
      }
    }
    res.json({channels: this.channels});
  });
});
sockets(io)



// Start server
listen(server)

