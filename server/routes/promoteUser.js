const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentGroup } = req.body; // Extract user id and group id

  console.log("Promote user request - id:", id, "group:", currentGroup);

  const groupsFile = path.join(__dirname, "../data/groups.txt"); // Path to groups.txt
  const usersFile = path.join(__dirname, "../data/users.txt"); // Path to users.txt

  // Step 1: Read groups.txt (to get group details)
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

    // Step 2: Find the group corresponding to the groupId
    const group = groups.find(g => parseInt(g.id) === parseInt(currentGroup));
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Step 3: Check if the user is a member of the group
    if (!Array.isArray(group.members)) group.members = [];
    const userIndex = group.members.indexOf(id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    // Step 4: Check if the user is already an admin
    if (!Array.isArray(group.admins)) group.admins = [];
    if (group.admins.includes(id)) {
      return res.status(400).json({ success: false, message: "User is already an admin" });
    }

    // Step 5: Promote the user to admin by adding them to the admins array
    group.admins.push(id);

    // Step 6: Read users.txt (to update the user's role)
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
        return res.status(500).json({ error: "Corrupted users data" });
      }

      // Step 7: Find the user and update their role to 'admin'
      const user = users.find(u => u.username === id);
      if (user) {
        user.role = 'admin'; // Promote user to admin
      } else {
        console.log("User not found in users file");
        return res.status(404).json({ success: false, message: "User not found in users file" });
      }

      // Step 8: Write the updated users.txt
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to users.txt");
          return res.status(500).json({ error: "Failed to update users" });
        }

        // Step 9: Save updated groups.txt without the removed user
        fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing groups.txt");
            return res.status(500).json({ error: "Failed to update groups" });
          }

          console.log(`User ${id} has been promoted to admin of group ${currentGroup}`);
          res.json({ success: true, message: `User ${id} has been promoted to admin of group ${currentGroup}` });
        });
      });
    });
  });
});

module.exports = router;
