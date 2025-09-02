const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const user = {
    username: req.body.username,
    newChannel: req.body.newChannel, 
  };

  const channelsFile = path.join(__dirname, "../data/channels.txt");

  // read channels.txt 
  fs.readFile(channelsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading channels file");
      return res.json({ error: "Internal server error (channels)" });
    }

    let channelsData = [];
    try {
      channelsData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing channels.txt");
      return res.json({ error: "Corrupted channels data" });
    }

    // Find the channel by name
    const channel = channelsData.find(ch => ch.name === user.newChannel);
    if (!channel) {
      return res.json({ valid: false });
    }

    // Check if the user is banned from the channel
    if (channel.banned.includes(user.username)) {
      console.log('User' + user.username + 'is banned from channel' + user.newChannel);
      return res.json({
        valid: false,
      });
    }

    // Add user to the channel if not already a member
    if (!channel.members.includes(user.username)) {
      channel.members.push(user.username);
    }

    // update channels.txt 
    fs.writeFile(channelsFile, JSON.stringify(channelsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to channels file");
        return res.json({ error: "Failed to update channels" });
      }

      // Return success response
      res.json({ valid: true });
    });
  });
});

module.exports = router;
