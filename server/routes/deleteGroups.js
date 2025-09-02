const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupIdToDelete = req.body.groupId;

  const usersFile = path.join(__dirname, "../data/users.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const channelsFile = path.join(__dirname, "../data/channels.txt");

  //Read groups.txt
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

    const groupIndex = groups.findIndex(g => parseInt(g.id) === parseInt(groupIdToDelete));
    if (groupIndex === -1) {
      return res.json({ success: false, message: "Group not found" });
    }

    // Remove the group
    groups.splice(groupIndex, 1);

    // update groups.txt
    fs.writeFile(groupsFile, JSON.stringify(groups, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups.txt");
        return res.json({ error: "Failed to update groups.txt" });
      }

      // Read channels.txt
      fs.readFile(channelsFile, "utf8", (err, channelData) => {
        if (err) {
          console.log("Error reading channels.txt");
          return res.json({ error: "Internal server error (channels)" });
        }

        let channels = [];
        try {
          channels = JSON.parse(channelData);
        } catch (err) {
          console.log("Error parsing channels.txt");
          return res.json({ error: "Corrupted channel data" });
        }

        // Remove all channels associated with the group
        channels = channels.filter(channel => {
          return parseInt(channel.groupId) !== parseInt(groupIdToDelete);
        });

        // updated channels.txt
        fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing channels.txt");
            return res.json({ error: "Failed to update channels.txt" });
          }

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

            // Remove group from all users
            users = users.map(user => {
              if (Array.isArray(user.groups)) {
                user.groups = user.groups.filter(gId => parseInt(gId) !== parseInt(groupIdToDelete));
              }
              return user;
            });

            // update users.txt
            fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
              if (err) {
                console.log("Error writing users.txt");
                return res.status(500).json({ error: "Failed to update users.txt" });
              }

              console.log(`Group ${groupIdToDelete} deleted, channels removed, and group references cleared from users.`);
              res.json({
                success: true
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
