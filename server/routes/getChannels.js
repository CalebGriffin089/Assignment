const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.id;
  const username = req.body.username;
  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const channelsFile = path.join(__dirname, "../data/channels.txt");  // Path to channels file

  // Step 1: Read the groups.txt file to get group details
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

    let channels = [];
    let members = [];

    // Step 2: Find the group based on the given groupId
    const group = groupsData.find(g => parseInt(g.id) === parseInt(groupId));
    if (group) {
      channels = Array.isArray(group.channels) ? group.channels : [];
      members = Array.isArray(group.members) ? group.members : [];
    }

    // Step 3: Read the channels.txt file to check banned users
    fs.readFile(channelsFile, "utf8", (err, channelData) => {
      if (err) {
        console.log("Error reading channels file");
        return res.status(500).json({ error: "Internal server error (channels)" });
      }

      let channelsData = [];
      try {
        channelsData = JSON.parse(channelData);
      } catch (err) {
        console.log("Error parsing channels.txt");
        return res.status(500).json({ error: "Corrupted channels data" });
      }

      // Step 4: Check each channel to see if the user is banned or a member
      let bannedUsersInChannels = [];
      let allowedChannels = [];

      // Loop through all the channels in the group
      for (let i = 0; i < channels.length; i++) {
        const channelId = channels[i];
        let channel = null;

        // Loop through all channels in channelsData to find the corresponding channel
        for (let j = 0; j < channelsData.length; j++) {
          if (channelsData[j].name === channelId) {
            channel = channelsData[j];
            break;  // Exit inner loop once the channel is found
          }
        }

        if (channel) {
          // Check if the user is banned from this channel
          if (Array.isArray(channel.banned) && channel.banned.includes(username)) {
            bannedUsersInChannels.push(channelId);
          }

          // Check if the user is a member of this channel
          if (Array.isArray(channel.members) && channel.members.includes(username)) {
            // Only add the channel if the user is either not banned or is a member
            if (!bannedUsersInChannels.includes(channelId)) {
              allowedChannels.push(channelId);
            }
          }
        }
      }

      // Step 5: Return the group information along with the allowed channels and members
      res.json({
        channels: allowedChannels,  // Only return the channels the user is not banned from and is a member of
        members
      });
    });
  });
});

module.exports = router;
