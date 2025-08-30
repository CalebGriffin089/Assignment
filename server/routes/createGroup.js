const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupData = {
    id: 0,
    channels: Array.isArray(req.body.channels) ? req.body.channels : [req.body.channels],
    admins: Array.isArray(req.body.members) ? req.body.members : [req.body.members],
    banned: [],
    members: Array.isArray(req.body.members) ? req.body.members : [req.body.members]
  };

  const groupsFile = path.join(__dirname, "../data/groups.txt");

  fs.readFile(groupsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading groups file");
      return res.status(500).json({ error: "Internal server error (groups)" });
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing groups.txt");
      return res.status(500).json({ error: "Corrupted groups data" });
    }

    if (fileData.length === 0) {
      groupData.id = 1;
    } else {
      const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
      groupData.id = lastId + 1;
    }

    fileData.push(groupData);

    fs.writeFile(groupsFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing groups file");
        return res.status(500).json({ error: "Failed to write groups file" });
      }

      console.log("Group registered:", groupData);
      res.json({ valid: true, groupId: groupData.id });
    });
  });
});

module.exports = router;
