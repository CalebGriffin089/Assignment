const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const { username, file } = req.body;

  if (!username || !file) {
    return res.status(400).json({ error: "Missing username or file type" });
  }

  // Determine collection based on file param
  const collectionName = file === "account" ? "accountRequests" :
                         file === "group" ? "groupRequests" :
                         null;

  if (!collectionName) {
    return res.status(400).json({ error: "Invalid file type specified" });
  }

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const requestsCollection = db.collection(collectionName);

    // Remove the request by username
    const result = await requestsCollection.deleteOne({ username });

    await client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ valid: false, message: "Request not found" });
    }

    console.log(`${username} has declined the ${file} request`);
    res.json({ valid: true });
  } catch (err) {
    console.error("Error updating requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
