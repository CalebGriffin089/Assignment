const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Path to the users, groups, and accountRequests files
router.post("/", (req, res) => {
  const user = {
    username: req.body.username,
    file: req.body.file
  };

  const requestsFile = path.join(__dirname, "../data/"+ user.file + "Requests.txt");

  //read the requests file (accountRequests or groupRequests)
  fs.readFile(requestsFile, "utf8", (err, requestsData) => {
    if (err) {
      console.log("Error reading accountRequests file");
      return res.json({ error: "Internal server error (requests)" });
    }

    let requests = [];
    try {
      requests = JSON.parse(requestsData);
    } catch (err) {
      console.log("Error parsing accountRequests.txt");
      return resjson({ error: "Corrupted requests data" });
    }

    // Remove the request from the request file
    const requestIndex = requests.findIndex(req => req.username === user.username);
    if (requestIndex !== -1) {
      requests.splice(requestIndex, 1); 
    }

    // update the request file
    fs.writeFile(requestsFile, JSON.stringify(requests, null, 2), "utf8", (err) => {
      if (err) {
        console.log("Error writing to accountRequests file");
        return res.json({ error: "Failed to update requests file" });
      }

      console.log(`${user.username} has declined the group ${user.groupId}`);
    });
  });
});
module.exports = router;
