const express = require("express");
const fs = require("fs");
const { connect } = require("http2");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { groupId, name, members } = req.body;

  if (!groupId || !name || !members) {
    return res.status(400).json({ error: "Missing required fields: groupId, name, members" });
  }
  const channelData = {
    id: 0,
    groupId: groupId,  // Link the channel to a specific group
    name: name,        // Name of the channel
    admins: Array.isArray(members) ? members : [members],  // Admins are part of members
    banned: [],
    members: Array.isArray(members) ? members : [members], // All members in the channel
  };

  const channelsFile = path.join(__dirname, "../data/channels.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");

  // Step 1: Check if the group exists
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

    // Step 2: Verify that the given groupId exists
    let groupExists = false;
    for(let i =0; i<groupsData.length;i++){
      if(groupsData[i].id == groupId){
        groupExists = true;
        break;
      }
    }
    if (!groupExists) {
      console.log("HEELLO");
      return res.status(404).json({ error: "Group not found" });
    }

    // Step 3: If group exists, proceed with channel creation
    fs.readFile(channelsFile, "utf8", (err, data) => {
      
      if (err) {
        console.log("Error reading channels file");
        return res.status(500).json({ error: "Internal server error (channels)" });
      }

      let fileData = [];
      try {
        fileData = JSON.parse(data);
      } catch (err) {
        console.log("Error parsing channels.txt");
        return res.status(500).json({ error: "Corrupted channels data" });
      }

      if (fileData.length === 0) {
        channelData.id = 1;
      } else {
        const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
        channelData.id = lastId + 1;
      }

      fileData.push(channelData);

      // Step 4: Save the new channel to the channels file
      fs.writeFile(channelsFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing channels file");
          return res.status(500).json({ error: "Failed to write channels file" });
        }

        console.log("Channel registered:", channelData);
        res.json({ valid: true, channelId: channelData.id });
      });
    });
  });
});

module.exports = router;
