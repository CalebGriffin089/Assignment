const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();


const usersFile = path.join(__dirname, "../data/users.txt");
const requestsFile = path.join(__dirname, "../data/groupRequests.txt");

router.post("/", (req, res) => {
  console.log
  const user = {
    username: req.body.username,
    groupId: req.body.groupId,  
    status: "pending",          
    permission: "user",        
    need: "Join Permission"
  };

  // Read the requests file
  fs.readFile(requestsFile, "utf8", (err, requestsData) => {
    if (err) {
      console.log("Error reading requests file");
      return res.json({ error: "Internal server error (requests)" });
    }

    let requests = [];
    try {
      requests = JSON.parse(requestsData);
    } catch (err) {
      console.log("Error parsing requests.txt");
      return res.json({ error: "Corrupted requests data" });
    }

    // Check if there's already a pending request for this user to join the group
    const existingRequest = requests.find(r => r.username === user.username && r.groupId === user.groupId);
    if (existingRequest) {
      return res.json({ valid: false });
    }

    requests.push(user);

    // updated the requests file
    fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to requests.txt");
        return res.json({ error: "Failed to update requests file" });
      }

      // Respond with the request status
      console.log("Join group request submitted:", user.username, "for group:", user.groupId);
      res.json({ valid: true });
    });
  });
});

module.exports = router;
