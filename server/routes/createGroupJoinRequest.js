const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { username, groupId } = req.body;

  if (!username || !groupId) {
    return res.status(400).json({ error: "Missing username or groupId" });
  }

  const requestObj = {
    username,
    groupId,
    status: "pending",
    permission: "user",
    need: "Join Permission",
  };

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const groupsCollection = db.collection("groups");
    const requestsCollection = db.collection("groupRequests");

    // Check if the user is banned from the group
    const group = await groupsCollection.findOne({ id: parseInt(groupId) });
    
    if (group == null) {
      await client.close();
      return res.status(404).json({ error: "Group not found" });
    }

    // If the group has a 'banned' list and the user is in it, prevent the request
    if (group.banned && group.banned.includes(username)) {
      await client.close();
      return res.status(403).json({ error: "You are banned from this group" });
    }

    if (group.members.includes(username)) {
      await client.close();
      return res.status(404).json({ error: "You are already in this group" });
    }


    // Check if there's already a pending request for this user & group
    const existingRequest = await requestsCollection.findOne({
      username,
      groupId,
      status: "pending",
    });

    if (existingRequest) {
      await client.close();
      return res.json({ valid: false, message: "Request already pending" });
    }

    // Insert new request
    await requestsCollection.insertOne(requestObj);

    await client.close();

    console.log("Join group request submitted:", username, "for group:", groupId);
    return res.json({ valid: true });
  } catch (err) {
    console.error("Error handling join group request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
