const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  console.log("SDUIFGDSF");
  const groupIdToDelete = req.body.groupId;

  const usersFile = path.join(__dirname, "../data/users.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");

  // Step 1: Read groups.txt
  fs.readFile(groupsFile, "utf8", (err, groupData) => {
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

    // Check if group exists
    const groupIndex = groups.findIndex(g => parseInt(g.id) === parseInt(groupIdToDelete));
    if (groupIndex === -1) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Remove the group
    groups.splice(groupIndex, 1);

    // Step 2: Write updated groups.txt
    fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
      console.log("DONE?")
      if (err) {
        console.log("Error writing groups.txt");
        return res.status(500).json({ error: "Failed to update groups.txt" });
      }

      // Step 3: Read users.txt
      fs.readFile(usersFile, "utf8", (err, userData) => {
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

        // Remove group from all users
        users = users.map(user => {
          if (Array.isArray(user.groups)) {
            user.groups = user.groups.filter(gId => parseInt(gId) !== parseInt(groupIdToDelete));
          }
          return user;
        });

        // Step 4: Write updated users.txt
        fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing users.txt");
            return res.status(500).json({ error: "Failed to update users.txt" });
          }

          console.log(`Group ${groupIdToDelete} deleted and removed from all users`);
          res.json({ success: true, message: "Group deleted and removed from all users" });
        });
      });
    });
  });
});

module.exports = router;
