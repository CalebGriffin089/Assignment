const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Define the paths to the users and requests files
const usersFile = path.join(__dirname, "../data/users.txt");
const requestsFile = path.join(__dirname, "../data/groupRequests.txt");

router.post("/", (req, res) => {
  const user = {
    username: req.body.username,
    groupId: req.body.groupId,  // New: the group they want to join
    status: "pending",          // Default status is "pending" until admin approval
    permission: "user",        // Default permission for users who request to join a group
    need: "Join Permission"
  };

  fs.readFile(usersFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading users file");
      return res.status(500).json({ error: "Internal server error (users)" });
    }

    let fileData = [];
    try {
      fileData = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.status(500).json({ error: "Corrupted users data" });
    }

    // Read the requests file to check if the user has already made a join request for the group
    fs.readFile(requestsFile, "utf8", (err, requestsData) => {
      if (err) {
        console.log("Error reading requests file");
        return res.status(500).json({ error: "Internal server error (requests)" });
      }

      let requests = [];
      try {
        requests = JSON.parse(requestsData);
      } catch (err) {
        console.log("Error parsing requests.txt");
        return res.status(500).json({ error: "Corrupted requests data" });
      }

      // Check if there's already a pending request for this user to join the group
      const existingRequest = requests.find(r => r.username === user.username && r.groupId === user.groupId);
      if (existingRequest) {
        return res.json({ valid: "request already pending" });
      }

      // Add the join group request to the requests file
      requests.push(user);

      // Write the updated requests file
      fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to requests.txt");
          return res.status(500).json({ error: "Failed to update requests file" });
        }

        // Respond with the request status
        console.log("Join group request submitted:", user.username, "for group:", user.groupId);
        res.json({ valid: true, message: "Join group request submitted successfully" });
      });
    });
  });
});

module.exports = router;
