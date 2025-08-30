const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.groupId;
  const channelToDelete = req.body.channel;

  if (!channelToDelete) {
    return res.status(400).json({ error: "No channel specified" });
  }

  const groupsFile = path.join(__dirname, "../data/groups.txt");

  fs.readFile(groupsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading groups file");
      return res.status(500).json({ error: "Internal server error (groups)" });
    }

    let groupsData = [];
    try {
      groupsData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing groups.txt");
      return res.status(500).json({ error: "Corrupted groups data" });
    }

    const group = groupsData.find(g => parseInt(g.id) === parseInt(groupId));
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Ensure channels is an array
    if (!Array.isArray(group.channels)) {
      group.channels = [];
    }

    // Remove the channel
    group.channels = group.channels.filter(ch => ch !== channelToDelete);

    // Save updated groups file
    fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.status(500).json({ error: "Failed to update groups" });
      }

      console.log(`Deleted channel "${channelToDelete}" from group ${groupId}`);
      res.json({ success: true, channels: group.channels });
    });
  });
});

module.exports = router;
