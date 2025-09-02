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
      return res.json({ error: "Internal server error (users)" });
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.json({ error: "Corrupted users data" });
    }

    // find user
    const userObj = fileData.find(u => parseInt(u.id) === parseInt(user.id));
    if (!userObj) {
      return res.json({ valid: false, message: "User not found" });
    }


    if (!userObj.groups.includes(user.newGroup.toString())) {
      userObj.groups.push(user.newGroup.toString());
    }

    // read groups.txt
    fs.readFile(groupsFile, "utf8", (err, data2) => {
      if (err) {
        console.log("Error reading groups file");
        return res.json({ error: "Internal server error (groups)" });
      }

      let groupsData = [];
      try {
        groupsData = JSON.parse(data2);
      } catch (err) {
        console.log("Error parsing groups.txt");
        return res.json({ error: "Corrupted groups data" });
      }

      const group = groupsData.find(g => g.id == user.newGroup);
      if (!group) {
        return res.json({ valid: false, message: "Group not found" });
      }

      //check if the user is banned
      if (group.banned.includes(user.username)) {
        return res.json({
          valid: false,
          message: "User" + user.username + "is banned from this group"
        });
      }

      // add user if not already a member
      if (!group.members.includes(user.username)){
        group.members.push(user.username);
      } 

      // save updated groups
      fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to groups file");
          return res.json({ error: "Failed to update groups" });
        }

        // save updated users
        fs.writeFile(usersFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing users file");
            return res.json({ error: "Failed to update users" });
          }

          res.json({ valid: true });
        });
      });
    });
  });
});

module.exports = router;
