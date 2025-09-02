const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.groupId;
  let newChannels = req.body.newChannels;

  const groupsFile = path.join(__dirname, "../data/groups.txt");

  fs.readFile(groupsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading groups file");
      return res.json({ error: "Internal server error (groups)" });
    }

    let groupsData = [];
    try {
      groupsData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing groups.txt");
      return res.json({ error: "Corrupted groups data" });
    }

    const group = groupsData.find(g => parseInt(g.id) === parseInt(groupId));
    if (!group) {
      return res.json({ error: "Group not found" });
    }

    // Add new channels, avoiding duplicates
    if (!group.channels.includes(newChannels)) {
      group.channels.push(newChannels);
    }

    // Save updated groups.txt
    fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.json({ error: "Failed to update groups" });
      }

      console.log(`Added channels to group ${groupId}:`, newChannels);
      res.json({ success: true, channels: group.channels });
    });
  });
});

module.exports = router;
