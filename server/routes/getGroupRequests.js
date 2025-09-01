const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const requestsFile = path.join(__dirname, "../data/groupRequests.txt");

  // Read groupRequests.txt
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
    // Send all requests as a response
    res.json({ response: response });
  });
});

module.exports = router;
