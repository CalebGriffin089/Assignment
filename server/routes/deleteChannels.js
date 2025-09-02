const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.groupId;
  const channelToDelete = req.body.channel;
  

  const groupsFile = path.join(__dirname, "../data/groups.txt");

  //read group file
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

    // Remove the channel
    group.channels = group.channels.filter(ch => String(ch) !== String(channelToDelete));

    // update groups file
    fs.writeFile(groupsFile, JSON.stringify(groupsData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.json({ error: "Failed to update groups" });
      }

      console.log(`Deleted channel "${channelToDelete}" from group ${groupId}`);
    });
  });

  const channelsFile = path.join(__dirname, "../data/channels.txt");

  // read the channels file
  fs.readFile(channelsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading channels file");
      return res.json({ error: "Internal server error (channels)" });
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing channels.txt");
      return res.json({ error: "Corrupted channels data" });
    }

    const channelIndex = fileData.findIndex(channel => channel.name == channelToDelete);

    if (channelIndex === -1) {
      return res.json({ error: "Channel not found" });
    }

    // remove the channel from the array
    const deletedChannel = fileData.splice(channelIndex, 1)[0];

    // update the channels file
    fs.writeFile(channelsFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing channels file");
        return res.json({ error: "Failed to write channels file" });
      }

      console.log("Channel deleted:", deletedChannel);
      res.json({ valid: true, message: `Channel ${deletedChannel.name} deleted successfully` });
    });
  });


});

module.exports = router;
