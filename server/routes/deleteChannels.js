const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { groupId, channel } = req.body;

  if (!groupId || !channel) {
    return res.status(400).json({ error: "Missing groupId or channel" });
  }

  const client = new MongoClient(url);
  
  try {
    await client.connect();
    const db = client.db(dbName);

    // 1. Update group document to remove the channel from its channels array
    const groupsCollection = db.collection("groups");
    const groupResult = await groupsCollection.findOneAndUpdate(
      { id: parseInt(groupId) },
      { $pull: { channels: channel.name } },
      { returnDocument: "after" }
    );

    
    // 2. Delete the channel document from channels collection
    const channelsCollection = db.collection("channels");
    const deleteResult = await channelsCollection.deleteOne({ _id: new ObjectId(channel._id) });
    if (deleteResult.deletedCount === 0) {
      
      return res.status(404).json({ error: "Channel not found" });
    }

    console.log(`Deleted channel "${channel}" from group ${groupId}`);
    res.json({ valid: true, message: `Channel ${channel} deleted successfully` });

  } catch (err) {
    console.error("Error deleting channel:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
