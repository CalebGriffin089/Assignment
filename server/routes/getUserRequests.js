const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const requestsFile = path.join(__dirname, "../data/accountRequests.txt");

  // Read requests.txt to get all registration requests
  fs.readFile(requestsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading requests.txt");
      return res.json({ error: "Internal server error (requests)" });
    }

    let requests = [];
    try {
      requests = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing requests.txt");
      return res.json({ error: "Corrupted requests data" });
    }
    // Send all requests as a response
    res.json({ requests });
  });
});

module.exports = router;
