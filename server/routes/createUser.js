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
      return res.json({ valid: "username taken" });
    }

    // Assign new ID
    if (fileData.length === 0) {
      user.id = 1;
    } else {
      const lastId = parseInt(fileData[fileData.length - 1].id) || 0;
      user.id = lastId + 1;
    }

    // Add new user
    fileData.push(user);

    // Write updated users file
    fs.writeFile(usersFile, JSON.stringify(fileData, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing users file");
        return res.status(500).json({ error: "Failed to write users file" });
      }

      console.log("User registered:", user.username);
      res.json({ valid: true, userId: user.id });
    });
  });
});

module.exports = router;
