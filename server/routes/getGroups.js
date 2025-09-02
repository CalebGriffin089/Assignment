const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const username = req.body.username;
  const usersFile = path.join(__dirname, "../data/users.txt");

  fs.readFile(usersFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading users.txt");
      return res.json({ error: "Internal server error (users)" });
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing users.txt");
      return res.json({ error: "Corrupted users data" });
    }


    const user = users.find(u => u.username === username);
    let groups; 

    // First, check if the user exists
    if (user) {
        // if the user exists get its groups array
        groups = user.groups;
    } else {
      // If user is null or undefined
      groups = [];
    }

    console.log(groups);
    res.json({ groups: groups });
  });
});

module.exports = router;
