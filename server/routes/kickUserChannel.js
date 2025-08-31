const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentChannel } = req.body; // Extract user id and group id

  console.log("Remove user request - id:", id, "group:", currentChannel);

  const channelsFile = path.join(__dirname, "../data/channels.txt"); // Path to channels.txt

  // Step 1: Read channels.txt (to get channel details)
  fs.readFile(channelsFile, "utf8", (err, channelData) => {
    if (err) {
      console.log("Error reading channels.txt");
      return res.status(500).json({ error: "Internal server error (channels)" });
    }

    let channels = [];
    try {
      channels = JSON.parse(channelData);
    } catch (err) {
      console.log("Error parsing channels.txt");
      return res.status(500).json({ error: "Corrupted channel data" });
    }

    // Step 2: Find the channel corresponding to the groupId
    const channel = channels.find(ch => ch.name == (currentChannel));
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found for the group" });
    }

    // Step 3: Remove the user from the members list in the channel
    if (!Array.isArray(channel.members)) channel.members = [];

    const userIndex = channel.members.indexOf(id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: "User is not a member of the channel" });
    }

    // Remove the user from the members list
    channel.members.splice(userIndex, 1);

    // Step 4: Save updated channels.txt without the removed user
    fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing channels.txt");
        return res.status(500).json({ error: "Failed to update channels" });
      }

      console.log(`User ${id} removed from the channel's members list of group ${currentChannel}`);
      res.json({ success: true, message: `User ${id} removed from the channel's members list of group ${currentChannel}` });
    });
  });
});

module.exports = router;
