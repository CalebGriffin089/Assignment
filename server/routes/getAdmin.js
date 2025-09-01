const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.id;
  const username = req.body.username;
  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const usersFile = path.join(__dirname, "../data/users.txt"); 

  // read the groups.txt file
  fs.readFile(groupsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading groups file");
      return res.status(500).json({ error: "Internal server error (groups)" });
    }

    let groupsData = [];
    try {
      groupsData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing groups.txt");
      return res.status(500).json({ error: "Corrupted groups data" });
    }

    let channels = [];
    let members = [];
    let isAdmin = false;  
    let isSuperAdmin = false; 

    // Step 2: Find the group based on the given groupId
    const group = groupsData.find(g => parseInt(g.id) === parseInt(groupId));
    
    // Check if the group object exists and is not null or undefined
  if (group !== null && group !== undefined) {
      console.log(group);
      channels = group.channels;
      members = group.members;

    } else {
      members = [];
    }
    // Initialize isAdmin to false by default
    isAdmin = false;

    // check if the user is a group admin
    if (group.admins.includes(username)) {
      isAdmin = true;
    }


    // read the users.txt
    fs.readFile(usersFile, "utf8", (err, userData) => {
      if (err) {
        console.log("Error reading users file");
        return res.status(500).json({ error: "Internal server error (users)" });
      }

      let usersData = [];
      try {
        usersData = JSON.parse(userData);
      } catch (err) {
        console.log("Error parsing users.txt");
        return res.status(500).json({ error: "Corrupted users data" });
      }

      // check if the user has a superAdmin role
      const user = usersData.find(u => u.username === username);
      if (user && user.roles.includes("superAdmin")) {
        isSuperAdmin = true;
      }

        // return admin status
        res.json({
          isAdmin,
          isSuperAdmin 
        });
      });
    });
  });

module.exports = router;
