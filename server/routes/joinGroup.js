const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const user = {
    id: req.body.id,
    groups: req.body.groups,
    username: req.body.username,
    newGroup: req.body.newGroup
  };

  const usersFile = path.join(__dirname, "../data/users.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");

  // Read users.txt
  fs.readFile(usersFile, "utf8", (err, data) => {
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

    // update user groups
    const userObj = fileData.find(u => parseInt(u.id) === parseInt(user.id));
    if (!userObj) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ensure groups array
    if (!Array.isArray(userObj.groups)) userObj.groups = [];

    if (!userObj.groups.includes(user.newGroup.toString())) {
      userObj.groups.push(user.newGroup.toString());
    }

    console.log("Updated Channels:", userObj.groups);

    // read groups.txt
    fs.readFile(groupsFile, "utf8", (err, data2) => {
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

      const group = groupsData.find(g => g.id == user.newGroup);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }

      // ensure banned array
      if (!Array.isArray(group.banned)) group.banned = [];

      if (group.banned.includes(user.username)) {
        console.log(`User ${user.username} is banned from group ${user.newGroup}`);
        return res.status(403).json({
          success: false,
          message: `User ${user.username} is banned from this group`
        });
      }

      // add user if not already a member
      if (!Array.isArray(group.members)) group.members = [];
      if (!group.members.includes(user.username)) group.members.push(user.username);

      console.log(group.members);

      // save updated groups
      fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to groups file");
          return res.status(500).json({ error: "Failed to update groups" });
        }

        // save updated users
        fs.writeFile(usersFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing users file");
            return res.status(500).json({ error: "Failed to update users" });
          }

          res.json({ valid: true, message: "User added to group" });
        });
      });
    });
  });
});

module.exports = router;
