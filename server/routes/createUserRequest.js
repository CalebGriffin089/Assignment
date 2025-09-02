const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const user = {
    id: null,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    groups: [],
    roles: []
  };

  const usersFile = path.join(__dirname, "../data/users.txt");
  const requestsFile = path.join(__dirname, "../data/accountRequests.txt"); // Path to requests.txt

  //read user file
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

    // Check if username already exists
    const exists = fileData.some(u => u.username === user.username);
    if (exists) {
      return res.json({ valid: false });
    }

    // Assign new ID
    if (fileData.length === 0) {
      user.id = 1;
    } else {
      const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
      user.id = lastId + 1;
    }

    // Add request to requests.txt
    const request = {
      username: user.username,
      email: user.email,
      password: user.password,
    };

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

      //check if username is already requested
      const exists = requests.some(u => u.username === user.username);
      if (exists) {
        return res.json({ valid: false });
      }
      
      // Add the new request to the requests array
      requests.push(request);
      // update requests.txt
      fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
        if (err) {
          console.log("Error writing to requests.txt");
          return res.status(500).json({ error: "Failed to update requests file" });
        }

        console.log("Registration request submitted:", user.username);
        res.json({ valid: true, message: "Registration request submitted successfully" });
      });
    });
  });
});

module.exports = router;
