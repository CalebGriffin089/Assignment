const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const usernameToDelete = req.body.username;
  if (!usernameToDelete) {
    return res.status(400).json({ error: "Missing username" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCollection = db.collection("users");
    const groupsCollection = db.collection("groups");
    const channelsCollection = db.collection("channels");
    // 1. Delete the user document
    const deleteUserResult = await usersCollection.deleteOne({ username: usernameToDelete });

    if (deleteUserResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Remove the user from all groups members arrays
    await groupsCollection.updateMany(
      { members: usernameToDelete },
      { $pull: { members: usernameToDelete } }
    );

    await channelsCollection.updateMany(
      { members: "1" },
      { $pull: { members: "1" } }
    );

    console.log(`User ${usernameToDelete} deleted and removed from all groups`);
    res.json({ success: true, message: "User deleted and removed from all groups" });

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
