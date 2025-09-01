const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // <-- use router, not app

router.post("/", (req, res) => {
  const requestsFile = path.join(__dirname, "../data/accountRequests.txt");

  // Step 1: Read requests.txt to get all registration requests
  fs.readFile(requestsFile, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading requests.txt");
      return res.status(500).json({ error: "Internal server error (requests)" });
    }

    let requests = [];
    try {
      requests = JSON.parse(data);
    } catch (err) {
      console.log("Error parsing requests.txt");
      return res.status(500).json({ error: "Corrupted requests data" });
    }
    // Step 2: Send all requests as a response
    res.json({ requests });
  });
});

module.exports = router; // <-- export router
