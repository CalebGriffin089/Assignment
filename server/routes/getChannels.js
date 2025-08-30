const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const groupId = req.body.id;
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

    let channels = [];
    let members = [];

    const group = groupsData.find(g => parseInt(g.id) === parseInt(groupId));
    if (group) {
      channels = Array.isArray(group.channels) ? group.channels : [];
      members = Array.isArray(group.members) ? group.members : [];
    }

    res.json({ channels, members });
  });
});

module.exports = router;
