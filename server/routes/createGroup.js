const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", async (req, res) => {
  const groupData = {
    id: 0,
    channels: [req.body.channels],
    admins: req.body.members, //user that created the group is by defualt and admin
    banned: [],
    members: req.body.members //the only member should be the creator
  };

  const groupsFile = path.join(__dirname, "../data/groups.txt");
  const usersFile = path.join(__dirname, "../data/users.txt");
  const channelsFile = path.join(__dirname, "../data/channels.txt");

  //read the group file and wait untill everything in the function finishes
  await fs.readFile(groupsFile, "utf8", (err, gData) => {
    if (err) {
      console.log("Error reading groups file");
      return res.json({ error: "Internal server error (groups)" });
    }

    let groupFileData = [];
    try {
      groupFileData = JSON.parse(gData);
    } catch (err) {
      console.log("Error parsing groups.txt");
      return res.json({ error: "Corrupted groups data" });
    }

    //get new groupId
    if (groupFileData.length === 0) {
      groupData.id = 1;
    } else {
      const lastId = parseInt(groupFileData[groupFileData.length - 1].id);
      groupData.id = lastId + 1;
    }

    groupFileData.push(groupData);

    //update the group file
    fs.writeFile(groupsFile, JSON.stringify(groupFileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.json({ error: "Failed to write groups file" });
      }

      console.log("Group registered:", groupData);
    });
  });

  //read the users file and wait for everything in the function to finish
  await fs.readFile(usersFile, "utf8", (err, uData) => {
    if (err) {
      console.log("Error reading users file");
      return res.json({ error: "Internal server error (users)" });
    }

    let userFileData = [];
    try {
      userFileData = JSON.parse(uData);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.json({ error: "Corrupted users data" });
    }

    // the only member should be the creator of the group so we only need to update their user profile
    const userObj = userFileData.find(u => u.username === groupData.members[0]);
    if (!userObj) {
      return res.json({ success: false, message: "User not found" });
    }
    userObj.groups.push(groupData.id.toString());
    // save updated users
    fs.writeFile(usersFile, JSON.stringify(userFileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing users file");
        return res.json({ error: "Failed to update users" });
      }
    });
  });


  const channelData = {
    id: 0,
    groupId: groupData.id,  
    name: groupData.channels[0],        
    admins: groupData.admins,  
    banned: [],
    members: groupData.members 
  };

  //read teh channels file
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

    if (fileData.length === 0) {
      channelData.id = 1;
    } else {
      const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
      channelData.id = lastId + 1;
    }

    fileData.push(channelData);

    // update the channels file
    fs.writeFile(channelsFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing channels file");
        return res.json({ error: "Failed to write channels file" });
      }
      res.json({ valid: true, groupId: groupData.id });
    });
  });
});
module.exports = router;
