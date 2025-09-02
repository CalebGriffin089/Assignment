const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.txt");
const requestsFile = path.join(__dirname, "../data/groupRequests.txt");
const groupsFile = path.join(__dirname, "../data/groups.txt");

router.post("/", (req, res) => {
  const user = {
    username: req.body.username,
    groupId: req.body.groupId,  
  };

  // Check if the user exists in the users file
  fs.readFile(usersFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading users file");
      return res.json({ error: "Internal server error (users)" });
    }

    let usersData = [];
    try {
      usersData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.json({ error: "Corrupted users data" });
    }
    
    // Find the user in the users data
    const userIndex = usersData.findIndex(u => u.username === user.username);
    if (userIndex === -1) {
      removeRequest();
      return res.json({ error: "User not found" });
    }
    // Check if the user is banned
    if (usersData[userIndex].isBanned) {
      removeRequest();
      return res.json({ error: "User is banned and cannot join a group" });
    }

    // find the group the user wants to join
    fs.readFile(groupsFile, "utf8", (err, groupData) => {
      if (err) {
        console.log("Error reading groups file");
        return res.json({ error: "Internal server error (groups)" });
      }

      let groups = [];
      try {
        groups = JSON.parse(groupData);
      } catch (err) {
        console.log("Error parsing groups.txt");
        return res.json({ error: "Corrupted groups data" });
      }

      // Find the group by ID
      const groupIndex = groups.findIndex(g => g.id === parseInt(user.groupId));
      if (groupIndex === -1) {
        removeRequest();
        return res.json({ error: "Group not found" });
      }
      
      // Check if the user is already a member of the group
      if (groups[groupIndex].members.includes(user.username)) {
        removeRequest();
        return res.json({ error: "User is already a member of this group" });
      }

      // Add the user to the group's members array
      groups[groupIndex].members.push(user.username);

      // update the groups file
      fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to groups file");
          return res.json({ error: "Failed to update groups file" });
        }

        // add the groupId to the user's groups array in users.txt
        usersData[userIndex].groups.push(user.groupId);

        // Write the updated users data back to users.txt
        fs.writeFile(usersFile, JSON.stringify(usersData, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing to users file");
            return res.json({ error: "Failed to update users file" });
          }

          //remove the user's request from accountRequests.txt
          
          res.json({ valid: true }); 
        });
      });
    });
  });
  function removeRequest(){
    fs.readFile(requestsFile, "utf8", (err, requestsData) => {
      if (err) {
        console.log("Error reading accountRequests file");
        return res.json({ error: "Internal server error (requests)" });
      }

      let requests = [];
      try {
        requests = JSON.parse(requestsData);
      } catch (err) {
        console.log("Error parsing accountRequests.txt");
        return res.json({ error: "Corrupted requests data" });
      }

      // Remove the request from groupRequests.txt
      const requestIndex = requests.findIndex(req => req.username === user.username && req.groupId === user.groupId);
      if (requestIndex !== -1) {
        requests.splice(requestIndex, 1);
      }

      // update groupRequests.txt
      fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to accountRequests file");
          return res.json({ error: "Failed to update requests file" });
        }

        console.log(`${user.username} has joined the group ${user.groupId}`);
      });
    });
  };

});

module.exports = router;
