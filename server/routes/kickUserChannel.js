const express = require("express");
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb';

router.post("/", async (req, res) => {
  const { username, currentChannel } = req.body;

  let db;
  try {
    // Connect to the database
    await client.connect();
    db = client.db(dbName);

    // Get collections
    const usersCollection = db.collection('users');
    const channelsCollection = db.collection('channels');
    // Fetch the user
    const user = await usersCollection.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent kicking a superAdmin
    if (user.roles && user.roles.includes("superAdmin")) {
      console.log("Super Admin cannot be kicked");
      return res.json({ error: "cannot remove a super admin" });
    }

    // Fetch the channel
    const channel = await channelsCollection.findOne({ name: currentChannel });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    // Check if user is a member
    const isMember = channel.members && channel.members.includes(username);
    if (!isMember) {
      return res.json({ success: false, message: "User is not a member of the channel" });
    }

    // Remove user from members
    const updatedMembers = channel.members.filter(member => member !== username);
    await channelsCollection.updateOne(
      { name: currentChannel },
      { $set: { members: updatedMembers } }
    );

    console.log(`User ${username} removed from channel ${currentChannel}`);
    return res.json({ success: true, message: "User removed from channel" });

  } catch (err) {
    console.error("Error removing user from channel:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the connection is closed after the operation
    await client.close();
  }
});

module.exports = router;
