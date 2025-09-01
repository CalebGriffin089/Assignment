const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { username } = req.body;

  const usersFile = path.join(__dirname, "../data/users.txt");

  // Read users.txt (to update the user's roles)
  fs.readFile(usersFile, "utf8", (err, userData) => {
    if (err) {
      console.log("Error reading users.txt");
      return res.status(500).json({ error: "Internal server error (users)" });
    }

    let users = [];
    try {
      users = JSON.parse(userData);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.status(500).json({ error: "Corrupted users data" });
    }

    // Find the user and add 'superAdmin' to their roles array
    const user = users.find(u => u.username === username);
    if (user) {
      if (!user.roles.includes('superAdmin')) {
        user.roles.push('superAdmin');
      }
    } else {
      console.log("User not found in users file");
      return res.status(404).json({ success: false, message: "User not found in users file" });
    }

    // update users.txt
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to users.txt");
        return res.status(500).json({ error: "Failed to update users" });
      }

      res.json({ success: true });
    });
  });
});

module.exports = router;
