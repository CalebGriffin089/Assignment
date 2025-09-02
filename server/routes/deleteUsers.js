const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  
  const usernameToDelete = req.body.username;

  const usersFile = path.join(__dirname, "../data/users.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");

  // Read users.txt
  fs.readFile(usersFile, "utf8", (err, userData) => {
    if (err) {
      console.log("Error reading users.txt");
      return res.json({ error: "Internal server error (users)" });
    }

    let users = [];
    try {
      users = JSON.parse(userData);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.json({ error: "Corrupted user data" });
    }
    // Find and remove user
    const userIndex = users.findIndex(u => u.username === usernameToDelete);
    if (userIndex === -1) {
      return res.json({ success: false, message: "User not found" });
    }
    users.splice(userIndex, 1);

    // Read groups.txt
    fs.readFile(groupsFile, "utf8", (err, groupData) => {
      if (err) {
        console.log("Error reading groups.txt");
        return res.json({ error: "Internal server error (groups)" });
      }

      let groups = [];
      try {
        groups = JSON.parse(groupData);
      } catch (err) {
        console.log("Error parsing groups.txt");
        return res.json({ error: "Corrupted group data" });
      }

      // Remove user from any group they are in
      groups = groups.map(group => {
          group.members = group.members.filter(member => member !== usernameToDelete);
        return group;
      });

      // update users.txt
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing users.txt");
          return res.json({ error: "Failed to update users.txt" });
        }

        // update groups.txt
        fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing groups.txt");
            return res.json({ error: "Failed to update groups.txt" });
          }

          console.log(`User ${usernameToDelete} deleted and removed from groups`);
          res.json({ success: true, message: "User deleted and removed from all groups" });
        });
      });
    });
  });
});

module.exports = router;
