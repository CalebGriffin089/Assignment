const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const user = {
    username: req.body.username,
    newChannel: req.body.newChannel, // Channel name to add the user
  };

  const channelsFile = path.join(__dirname, "../data/channels.txt"); // Path to channels file

  // Step 1: Read channels.txt to update channel membership
  fs.readFile(channelsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading channels file");
      return res.status(500).json({ error: "Internal server error (channels)" });
    }

    let channelsData = [];
    try {
      channelsData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing channels.txt");
      return res.status(500).json({ error: "Corrupted channels data" });
    }

    // Step 2: Find the channel by name or ID
    const channel = channelsData.find(ch => ch.name === user.newChannel);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    // Ensure banned array in the channel
    if (!Array.isArray(channel.banned)) channel.banned = [];

    // Check if the user is banned from the channel
    if (channel.banned.includes(user.username)) {
      console.log(`User ${user.username} is banned from channel ${user.newChannel}`);
      return res.status(403).json({
        success: false,
        message: `User ${user.username} is banned from this channel`,
      });
    }

    // Add user to the channel if not already a member
    if (!Array.isArray(channel.members)) channel.members = [];
    if (!channel.members.includes(user.username)) {
      channel.members.push(user.username);
    }

    // Step 3: Save the updated channels.txt with the new membership
    fs.writeFile(channelsFile, JSON.stringify(channelsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to channels file");
        return res.status(500).json({ error: "Failed to update channels" });
      }

      // Return success response
      res.json({ valid: true, message: `User ${user.username} added to channel ${user.newChannel}` });
    });
  });
});

module.exports = router;
