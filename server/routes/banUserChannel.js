const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentChannel } = req.body;

  console.log("Ban request - id:", id, "group:", currentChannel);

  const channelsFile = path.join(__dirname, "../data/channels.txt"); 
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

      // read the channels file
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

      // find the channel with the right group id
      const channel = channels.find(ch => parseInt(ch.groupId) === parseInt(currentChannel));
      if (!channel) {
        return res.json({ success: false, message: "Channel not found for the group" });
      }

      // Remove the user from the members list if they exist
      const userIndex = channel.members.indexOf(id);
      if (userIndex !== -1) {
        channel.members.splice(userIndex, 1); 
      }

      // Add the user to the banned list if they aren't already banned
      if (!channel.banned.includes(id)) {
        channel.banned.push(id);
      }

      // update channels.txt
      fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing channels.txt");
          return res.status(500).json({ error: "Failed to update channels" });
        }

        console.log(`User ${id} banned and removed from members list in the channel of group ${currentChannel}`);
        res.json({ success: true });
      });
    });
  });
});

module.exports = router;
