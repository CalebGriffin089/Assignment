const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentGroup } = req.body;

  console.log("Remove user request - id:", id, "group:", currentGroup);

  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const usersFile = path.join(__dirname, "../data/users.txt"); 

  // Read groups.txt
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

    // Find the group 
    const group = groups.find(g => parseInt(g.id) == parseInt(currentGroup));
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    //find the user in the members array
    const userIndex = group.members.indexOf(id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    // Remove the user from the members list
    group.members.splice(userIndex, 1);

    // Update users.txt to remove the group from the user's groups array
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
      if(user.roles.includes('superAdmin')){
        console.log("Super Admin cannot be kicked")
        return res.json({error: "cannot remove a super admin"});  
      }
      if (user) {
        const groupIndex = user.groups.indexOf(currentGroup.toString());
        if (groupIndex !== -1) {
          user.groups.splice(groupIndex, 1);
        }
      } else {
        console.log("User not found in users file");
        return res.status(404).json({ success: false, message: "User not found in users file" });
      }

      // update users.txt
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to users.txt");
          return res.status(500).json({ error: "Failed to update users" });
        }

        //update groups.txt
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
