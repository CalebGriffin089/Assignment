const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Find the user by username
    const user = await usersCollection.findOne({ username: String(username) });
    let groups = [];

    if (user) {
      groups = user.groups || [];
    }
    // Filter out groups where the user is banned
    const filteredGroups = [];

    for (const group of groups) {
      const groupCollection = db.collection("groups");
      const groupData = await groupCollection.findOne({ id: parseInt(group) }); // Assuming group is identified by _id
      if (groupData && !groupData.banned.includes(username)) {
        filteredGroups.push(group); // Add to filtered list if user is not banned
      }
    }

    return res.json({ groups: filteredGroups });

  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
