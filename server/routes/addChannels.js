const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const groupId = req.body.groupId;
  let newChannels = req.body.newChannels;

  if (!groupId || !newChannels) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Normalize newChannels to array
  if (!Array.isArray(newChannels)) {
    newChannels = [newChannels];
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const groupsCollection = db.collection("groups");

    // Find group by numeric id
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Merge new channels into existing channels, avoid duplicates
    const updatedChannels = Array.from(new Set([...(group.channels || []), ...newChannels]));

    // Update group document channels array
    await groupsCollection.updateOne(
      { id: parseInt(groupId) },
      { $set: { channels: updatedChannels } }
    );

    console.log(`Added channels to group ${groupId}:`, newChannels);
    res.json({ success: true, channels: updatedChannels });

  } catch (err) {
    console.error("Error updating group channels:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
