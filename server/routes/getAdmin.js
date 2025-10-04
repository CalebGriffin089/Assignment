const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();

const url = "mongodb://localhost:27017";
const dbName = "mydb";

router.post("/", async (req, res) => {
  const groupId = parseInt(req.body.id);
  const username = req.body.username;

  if (!groupId || !username) {
    return res.status(400).json({ error: "Missing groupId or username" });
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);

    const groupsCollection = db.collection("groups");
    const usersCollection = db.collection("users");

    let isAdmin = false;
    let isSuperAdmin = false;

    // Find group and check if user is an admin
    const group = await groupsCollection.findOne({ id: groupId });
    if (group && Array.isArray(group.admins) && group.admins.includes(username)) {
      isAdmin = true;
    }

    // Find user and check if they are a superAdmin
    const user = await usersCollection.findOne({ username });
    if (user && Array.isArray(user.roles) && user.roles.includes("superAdmin")) {
      isSuperAdmin = true;
    }

    res.json({ isAdmin, isSuperAdmin });

  } catch (err) {
    console.error("Error checking admin status:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
