const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentGroup } = req.body; // Extract user id and group id

  console.log("Remove user request - id:", id, "group:", currentGroup);

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

    // Step 3: Remove the user from the members list in the group
    if (!Array.isArray(group.members)) group.members = [];

    const userIndex = group.members.indexOf(id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    // Remove the user from the members list
    group.members.splice(userIndex, 1);

    // Step 4: Update users.txt to remove the group from the user's groups array
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

      // Find the user by id and remove the currentGroup id from their groups array
      const user = users.find(u => u.username === id);
      if (user) {
        const groupIndex = user.groups.indexOf(currentGroup.toString());
        if (groupIndex !== -1) {
          user.groups.splice(groupIndex, 1); // Remove the group ID from the user's groups array
        }
      } else {
        console.log("User not found in users file");
        return res.status(404).json({ success: false, message: "User not found in users file" });
      }

      // Step 5: Write the updated users.txt
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to users.txt");
          return res.status(500).json({ error: "Failed to update users" });
        }

        // Step 6: Save updated groups.txt without the removed user
        fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing groups.txt");
            return res.status(500).json({ error: "Failed to update groups" });
          }

          console.log(`User ${id} removed from group ${currentGroup} and updated users file`);
          res.json({ success: true, message: `User ${id} removed from group ${currentGroup}` });
        });
      });
    });
  });
});

module.exports = router;
