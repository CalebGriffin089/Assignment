const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "mydb";

router.post("/", async (req, res) => {
  
  try {
    const { currentChannel, user, } = req.body;
    console.log(user)
    console.log("Ban request - id:", user, "channel/group:", currentChannel);
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const channelsCollection = db.collection("channels");

    // Find user by username
    const userProfile = await usersCollection.findOne({ username: user });
    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userProfile.roles && userProfile.roles.includes("superAdmin")) {
      console.log("Super Admin cannot be banned");
      return res.status(403).json({ error: "Cannot remove a super admin" });
    }

    // Find channel by groupId (assuming currentChannel is groupId)
    const channel = await channelsCollection.findOne({ _id: new ObjectId(currentChannel) });
    if (!channel) {
      return res.status(404).json({ success: false, error: "Channel not found for the group" });
    }

    // Remove user from members array if present
    await channelsCollection.updateOne(
      { _id: new ObjectId(currentChannel) },
      { $pull: { members: user } }
    );

    // Add user to banned array if not already present
    await channelsCollection.updateOne(
      { _id: new ObjectId(currentChannel) },
      { $addToSet: { banned: user } }
    );

    console.log(`User ${user} banned and removed from members list in the channel of group ${currentChannel}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error processing ban request:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
