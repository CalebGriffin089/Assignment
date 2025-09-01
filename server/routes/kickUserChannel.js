const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/", (req, res) => {
  const { id, currentChannel } = req.body; 

  const channelsFile = path.join(__dirname, "../data/channels.txt"); 
  const usersFile = path.join(__dirname, "../data/users.txt"); 

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

      // Find the user by id and remove the currentGroup id from their groups array
      const user = users.find(u => u.username === id);
      if(user.roles.includes('superAdmin')){
        console.log("Super Admin cannot be kicked")
        return res.json({error: "cannot remove a super admin"});  
      }

      // Read channels.txt
      fs.readFile(channelsFile, "utf8", async (err, channelData) => {
        if (err) {
          console.log("Error reading channels.txt");
          return res.status(500).json({ error: "Internal server error (channels)" });
        }

        let channels = [];
        try {
          channels = JSON.parse(channelData);
        } catch (err) {
          console.log("Error parsing channels.txt");
          return res.status(500).json({ error: "Corrupted channel data" });
        }

        // Find the channel corresponding to the groupId
        const channel = channels.find(ch => ch.name == (currentChannel));
        
        
        if (!channel) {
          return res.status(404).json({ success: false, message: "Channel not found for the group" });
        }

        const userIndex = channel.members.indexOf(id);
        if (userIndex === -1) {
          return res.status(404).json({ success: false, message: "User is not a member of the channel" });
        }

        // Remove the user from the members list
        channel.members.splice(userIndex, 1);

        


        // update channels.txt
        fs.writeFile(channelsFile, JSON.stringify(channels, null, 2), "utf8", (err) => {
          if (err) {
            console.log("Error writing channels.txt");
            return res.status(500).json({ error: "Failed to update channels" });
          }
        });
      });
    });  
});

module.exports = router;
