const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // <-- use router, not app

router.post("/", (req, res) => {
  const requestsFile = path.join(__dirname, "../data/groupRequests.txt");

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
    response = [];
    for(let i =0; i<requests.length;i++){
      if(parseInt(requests[i].groupId) == parseInt(req.body.groupId)){
        response.push(requests[i]);
      }
    }
    // Step 2: Send all requests as a response
    res.json({ response: response });
  });
});

module.exports = router; // <-- export router
