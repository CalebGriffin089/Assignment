const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const groupIdToDelete = parseInt(req.body.groupId);
  if (!groupIdToDelete) {
    return res.status(400).json({ error: "Missing or invalid groupId" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    // 1. Delete the group document
    const groupsCollection = db.collection("groups");
    const deleteGroupResult = await groupsCollection.deleteOne({ id: groupIdToDelete });

    if (deleteGroupResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // 2. Delete all channels with that groupId
    const channelsCollection = db.collection("channels");
    const channelsToDelete = await channelsCollection.find({ groupId: String(groupIdToDelete) }).toArray();


    // 3. Delete all messages associated with the channels and the groupId
    const messagesCollection = db.collection("messages");
    const channelIds = channelsToDelete.map(channel => String(channel.name)); // Assuming channel.id exists
    await messagesCollection.deleteMany({
      $and: [
        { channel: { $in: ['1'] } },   // Message must be in the specified channels
        { group: String('3') }   // Message must match the groupId
      ]
    });
    console.log("GONE:",channelIds);
    // 4. Delete the channels themselves
    await channelsCollection.deleteMany({ groupId: String(groupIdToDelete) });

    // 5. Remove the groupId from all users' groups arrays
    const usersCollection = db.collection("users");
    await usersCollection.updateMany(
      { groups: groupIdToDelete },
      { $pull: { groups: groupIdToDelete } }
    );

    console.log(`Group ${groupIdToDelete} deleted; related channels, messages, and user references cleared.`);
    res.json({ success: true });

  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
