const { provideCheckNoChangesConfig } = require("@angular/core");
const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydb';

router.post("/", async (req, res) => {
  const { username, newChannel } = req.body;

  let db;
  try {
    // Connect to the database
    await client.connect();
    db = client.db(dbName);

    // Get the 'channels' collection
    const channelsCollection = db.collection('channels');
    
    // Find the channel by name
    const channel = await channelsCollection.findOne({ _id: new ObjectId(newChannel._id) });
    if (!channel) {
      return res.json({ valid: false });
    }
    console.log(username)
    // Check if the user is banned
    if (channel.banned && channel.banned.includes(username)) {
      console.log(`User ${username} is banned from channel ${newChannel}`);
      return res.json({ valid: false });
    }

    // Add user to the channel if not already a member
    if (channel.members && !channel.members.includes(username)) {
      channel.members.push(username);
      
      // Update the channel in the database
      await channelsCollection.updateOne(
        { name: newChannel.name },
        { $set: { members: channel.members } }
      );
    }
    
    return res.json({ valid: true });

  } catch (err) {
    console.error("Error handling join channel request:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the connection is closed after the query
    await client.close();
  }
});

module.exports = router;
