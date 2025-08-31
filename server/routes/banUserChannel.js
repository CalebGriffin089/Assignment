const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentGroup } = req.body;

  console.log("Ban request - id:", id, "group:", currentGroup);

  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const channelsFile = path.join(__dirname, "../data/channels.txt");  // Use channels.txt for banning

  // Step 1: Read groups.txt (to verify the group)
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

    const group = groups.find(g => parseInt(g.id) === parseInt(currentGroup));
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Step 2: Check if the user is a member of the group
    if (!Array.isArray(group.members)) group.members = [];
    const memberIndex = group.members.indexOf(id);
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    // Step 3: Read channels.txt (to update banned and members list)
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

      // Step 4: Find the channel corresponding to the groupId
      const channel = channels.find(ch => parseInt(ch.groupId) === parseInt(currentGroup));
      if (!channel) {
        return res.status(404).json({ success: false, message: "Channel not found for the group" });
      }

      // Step 5: Add the user to the banned list and remove from members list in the channel
      if (!Array.isArray(channel.banned)) channel.banned = [];
      if (!Array.isArray(channel.members)) channel.members = [];

      // Remove the user from the members list if they exist
      const userIndex = channel.members.indexOf(id);
      if (userIndex !== -1) {
        channel.members.splice(userIndex, 1); // Remove the user from members
      }

      // Add the user to the banned list if they aren't already banned
      if (!channel.banned.includes(id)) {
        channel.banned.push(id);
      }

      // Step 6: Save updated channels.txt with the banned user and updated members
      fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing channels.txt");
          return res.status(500).json({ error: "Failed to update channels" });
        }

        console.log(`User ${id} banned and removed from members list in the channel of group ${currentGroup}`);
        res.json({ success: true, message: `User ${id} banned and removed from the channel's members list of group ${currentGroup}` });
      });
    });
  });
});

module.exports = router;
