const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.groupId;
  let newChannels = req.body.newChannels;
  console.log(groupId)
  console.log(newChannels)
  // Ensure newChannels is an array
  if (!Array.isArray(newChannels)) {
    newChannels = [newChannels];
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

    // Ensure group.channels is an array
    if (!Array.isArray(group.channels)) {
      group.channels = [];
    }

    // Add new channels, avoiding duplicates
    newChannels.forEach(ch => {
      if (!group.channels.includes(ch)) {
        group.channels.push(ch);
      }
    });

    // Save updated groups.txt
    fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.status(500).json({ error: "Failed to update groups" });
      }

      console.log(`Added channels to group ${groupId}:`, newChannels);
      res.json({ success: true, channels: group.channels });
    });
  });
});

module.exports = router;
