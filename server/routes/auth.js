const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { username, password } = req.body;
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

    //check the username and password are right
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.json({ ...user, valid: true });
    } else {
      res.json({ valid: false });
    }
  });
});

module.exports = router;
