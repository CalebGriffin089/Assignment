const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const groupId = parseInt(req.body.groupId);
  
  if (!groupId) {
    return res.status(400).json({ error: "Missing groupId in request body" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const groupRequestsCollection = db.collection("groupRequests");

    const requests = await groupRequestsCollection
      .find({ groupId: String(groupId) })
      .toArray();
    return res.json({ response: requests });
  } catch (err) {
    console.error("Error fetching group requests:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
