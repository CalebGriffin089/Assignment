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
    groupId: groupId,  
    name: name,        
    admins: [members],  
    banned: [],
    members:  [members]
  };

  const channelsFile = path.join(__dirname, "../data/channels.txt");
  const groupsFile = path.join(__dirname, "../data/groups.txt");

  //read the groups file
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

    // check the group exists
    let groupExists = false;
    for(let i =0; i<groupsData.length;i++){
      if(groupsData[i].id == groupId){
        groupExists = true;
        break;
      }
    }

    if (!groupExists) {
      return res.status(404).json({ error: "Group not found" });
    }

    // If group exists create the channel
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

      // update the channel file with the new channel
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
