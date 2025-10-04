const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { groupId, username } = req.body;
  if (!groupId || !username) {
    return res.status(400).json({ error: "Missing groupId or username" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const groupsCollection = db.collection("groups");
    const channelsCollection = db.collection("channels");

    // Step 1: Find the group by groupId
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupChannels = group.channels || [];
    const groupMembers = group.members || [];

    // Step 2: Fetch the channels that the group has access to
    const channels = await channelsCollection
      .find({ name: { $in: groupChannels }, groupId: String(groupId) })
      .toArray();

    // Step 3: Filter channels where user is allowed
    const allowedChannels = channels
      .filter(channel => {
        const isBanned = channel.banned && Array.isArray(channel.banned) && channel.banned.includes(username);
        const isMember = channel.members && Array.isArray(channel.members) && channel.members.includes(username);
        return isMember && !isBanned;
      })
      .map(channel => channel.name);

      console.log(allowedChannels);
    // Step 4: Return the group information, allowed channels, and members
    res.json({
      channels: allowedChannels,
      members: groupMembers,
    });

  } catch (err) {
    console.error("Error handling request:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
