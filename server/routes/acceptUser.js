const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.txt");
const requestsFile = path.join(__dirname, "../data/accountRequests.txt");

router.post("/", (req, res) => {
  const user = {
    id: null,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    groups: [],
    roles: ["user"]
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

    // Assign new ID for the new user
    if (fileData.length === 0) {
      user.id = 1;
    } else {
      const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
      user.id = lastId + 1;
    }

    fileData.push(user);

    // update users file
    fs.writeFile(usersFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing users file");
        return res.status(500).json({ error: "Failed to write users file" });
      }

      console.log("User registered:", user.username);

      // After adding the user remove them from the requests file
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

        // Find the request for the user and remove it
        const requestIndex = requests.findIndex(r => r.username === user.username);

        if (requestIndex === -1) {
          console.log("Request not found for user:", user.username);
          return res.status(404).json({ error: "Request not found" });
        }

        // Remove the user request
        requests.splice(requestIndex, 1);

        // update the request file
        fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing to requests.txt");
            return res.status(500).json({ error: "Failed to update requests file" });
          }
          console.log("User removed from requests list:", user.username);
          res.json({ valid: true, userId: user.id });
        });
      });
    });
  });
});

module.exports = router;
