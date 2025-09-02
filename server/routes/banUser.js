const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentGroup } = req.body;

  console.log("Ban request - id:", id, "group:", currentGroup);

  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const usersFile = path.join(__dirname, "../data/users.txt");

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
      return res.json({ error: "Corrupted users data" });
    }

    // Find the user by id and remove the currentGroup id from their groups array
    const user = users.find(u => u.username === id);
    if(user.roles.includes('superAdmin')){
      console.log("Super Admin cannot be banned")
      return res.json({error: "cannot remove a super admin"});  
    }

    // Remove this group from the user's groups array
    for (let i = 0; i < users.length; i++) {
      if (users[i].username === id && Array.isArray(users[i].groups)) {
        users[i].groups = users[i].groups.filter(gId => parseInt(gId) !== parseInt(currentGroup));
        break;
      }
    }

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

      const group = groups.find(g => parseInt(g.id) === parseInt(currentGroup));
      if (!group) {
        return res.json({ success: false, message: "Group not found" });
      }

      const memberIndex = group.members.indexOf(id);
      if (memberIndex !== -1) {
        group.members.splice(memberIndex, 1);
      }

      if (!group.banned.includes(id)) {
        group.banned.push(id);
      }

      // Save updated groups.txt
      fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing groups.txt");
          return res.json({ error: "Failed to update groups" });
        }

    // Save updated groups.txt
    fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups.txt");
        return res.json({ error: "Failed to update groups" });
      }

        fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing users.txt");
            return res.json({ error: "Failed to update users" });
          }

          console.log(`User ${id} banned from group ${currentGroup} and removed from user's groups`);
          res.json({ success: true });
        });
      });
    });
  });
});
});

module.exports = router;
