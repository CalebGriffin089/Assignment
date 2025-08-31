const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // <-- use router, not app

router.post("/", (req, res) => {
  const username = req.body.username;
  const usersFile = path.join(__dirname, "../data/users.txt");

  fs.readFile(usersFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading users.txt");
      return res.status(500).json({ error: "Internal server error (users)" });
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.status(500).json({ error: "Corrupted users data" });
    }


    const user = users.find(u => u.username === username);
    const groups = user && Array.isArray(user.groups) ? user.groups : [];

    res.json({ groups });
  });
});

module.exports = router; // <-- export router
