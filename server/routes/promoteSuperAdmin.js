const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { username } = req.body; // Extract user id and group id

  console.log("Promote user request - id:", username);

  const usersFile = path.join(__dirname, "../data/users.txt"); // Path to users.txt

  // Step 1: Read users.txt (to update the user's roles)
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

    // Step 2: Find the user and add 'superAdmin' to their roles array
    const user = users.find(u => u.username === username);
    if (user) {
      // Ensure the roles array exists and add 'superAdmin' if not already present
      if (!Array.isArray(user.roles)) {
        user.roles = [];
      }

      // Add 'superAdmin' if it's not already present in the roles array
      if (!user.roles.includes('superAdmin')) {
        user.roles.push('superAdmin');
      }
    } else {
      console.log("User not found in users file");
      return res.status(404).json({ success: false, message: "User not found in users file" });
    }

    // Step 3: Write the updated users.txt
    fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to users.txt");
        return res.status(500).json({ error: "Failed to update users" });
      }

      console.log(`User ${username} has been promoted to superAdmin`);
      res.json({ success: true, message: `User ${username} has been promoted to superAdmin` });
    });
  });
});

module.exports = router;
