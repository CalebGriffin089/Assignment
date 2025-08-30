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
      banned: [],
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


app.post('/api/join', function(req, res) {
  const user = {
    id: req.body.id,
    groups: req.body.groups,
    username: req.body.username,
    newGroup: req.body.newGroup
  };

  fs.readFile("./data/users.txt", "utf8", (err, data) => {
    if (err) {
      console.log("Error reading users file");
      return res.status(500).json({ error: "Internal server error (users)" });
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.status(500).json({ error: "Corrupted users data" });
    }

    // update user text file user groups
    for (let i = 0; i < fileData.length; i++) {
      if (parseInt(fileData[i].id) === parseInt(user.id)) {
        fileData[i].groups = user.groups;
        console.log("Updated Channels:", fileData[i].groups);

        // add user as a group member
        fs.readFile("./data/groups.txt", "utf8", (err, data2) => {
          if (err) {
            console.log("Error reading groups file");
            return res.status(500).json({ error: "Internal server error (groups)" });
          }

          let groupsData = [];
          try {
            groupsData = JSON.parse(data2);
          } catch (err) {
            console.log("Error parsing groups.txt");
            return res.status(500).json({ error: "Corrupted groups data" });
          }

          for (let i = 0; i < groupsData.length; i++) {
            if (groupsData[i].id == user.newGroup) {
              // ensure banned is an array
              if (!Array.isArray(groupsData[i].banned)) {
                groupsData[i].banned = [];
              }

              // check if user is banned
              if (groupsData[i].banned.includes(user.username)) {
                console.log(`User ${user.username} is banned from group ${user.newGroup}`);
                return res.status(403).json({ 
                  success: false, 
                  message: `User ${user.username} is banned from this group` 
                });
              }

              // not banned, add to members
              if (!groupsData[i].members.includes(user.username)) {
                groupsData[i].members.push(user.username);
              }

              console.log(groupsData[i].members);
              break;
            }
          }

          // write updated groups file
          fs.writeFile("./data/groups.txt", JSON.stringify(groupsData, null, 2), "utf8", (err) => {
            if (err) {
              console.log("Error writing to groups file");
              return res.status(500).json({ error: "Failed to update groups" });
            }

            res.json({ success: true, message: "User added to group" });
          });
        });

        break;
      }
    }
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
    members = [];
    for (let i = 0; i < fileData.length; i++) {
      if (parseInt(fileData[i].id) === parseInt(req.body.id)) {
        console.log("TEST");
        channels = fileData[i].channels
        members = fileData[i].members
        break;
      }
    }
    res.json({channels: this.channels,
              members: this.members
    });
  });
});

app.post('/api/delete', function(req, res) {
  const usernameToDelete = req.body.username;

  // Step 1: Read users.txt
  fs.readFile("./data/users.txt", "utf8", (err, userData) => {
    if (err) {
      console.log("Error reading users.txt");
      return res.status(500).json({ error: "Internal server error (users)" });
    }

    let users = [];
    try {
      users = JSON.parse(userData);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.status(500).json({ error: "Corrupted user data" });
    }

    // Find the user
    const userIndex = users.findIndex(user => user.username === usernameToDelete);
    if (userIndex === -1) {
      return res.json({ success: false, message: "User not found" });
    }

    // Remove user
    users.splice(userIndex, 1);

    // Step 2: Read groups.txt
    fs.readFile("./data/groups.txt", "utf8", (err, groupData) => {
      if (err) {
        console.log("Error reading groups.txt");
        return res.status(500).json({ error: "Internal server error (groups)" });
      }

      let groups = [];
      try {
        groups = JSON.parse(groupData);
      } catch (err) {
        console.log("Error parsing groups.txt");
        return res.status(500).json({ error: "Corrupted group data" });
      }

      // Remove user from any group they are in
      groups = groups.map(group => {
        if (Array.isArray(group.members)) {
          group.members = group.members.filter(member => member !== usernameToDelete);
        }
        return group;
      });

      // Step 3: Write updated users.txt
      fs.writeFile("./data/users.txt", JSON.stringify(users, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing users.txt");
          return res.status(500).json({ error: "Failed to update users.txt" });
        }

        // Step 4: Write updated groups.txt
        fs.writeFile("./data/groups.txt", JSON.stringify(groups, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing groups.txt");
            return res.status(500).json({ error: "Failed to update groups.txt" });
          }

          console.log(`User ${usernameToDelete} deleted and removed from groups`);
          res.json({ success: true, message: "User deleted and removed from all groups" });
        });
      });
    });
  });
});

app.post('/api/ban', (req, res) => {
    const { id, currentGroup } = req.body;
    console.log("id: "+id);
    console.log("currentGroup: " + currentGroup);
    // Read file
    fs.readFile("./data/groups.txt", "utf8", (err, groupData) => {
      if (err) {
        console.log("Error reading groups.txt");
        return res.status(500).json({ error: "Internal server error (groups)" });
      }

      let groups = [];
      try {
        groups = JSON.parse(groupData);
      } catch (err) {
        console.log("Error parsing users.txt");
        return res.status(500).json({ error: "Corrupted user data" });
      }
      for(let i =0; i <groups.length; i++){
        if(parseInt(groups[i].id) == parseInt(currentGroup)){
          temp = [];
          temp2 = '';
          for(let k=0;k<groups[i].members.length;k++){
            if(groups[i].members[k] != id){
              temp.push(groups[i].members[k]);
            }else{
              temp2 =groups[i].members[k];
            }
          }
          groups[i].members = temp
          groups[i].banned.push(temp2)
          break;
        }
      }
      fs.writeFile("./data/groups.txt", JSON.stringify(groups, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to groups file");
          return;
        }
      });

    });
});

sockets(io)



// Start server
listen(server)

