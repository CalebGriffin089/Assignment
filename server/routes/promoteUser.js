const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017"; // MongoDB connection URL
const client = new MongoClient(url);
const dbName = "mydb"; // Replace with your database name

const db = client.db(dbName);

router.post("/", async (req, res) => {
  const { id, currentGroup } = req.body;

  try {
    await client.connect();

    const groupsCollection = db.collection("groups");
    const usersCollection = db.collection("users");

    // Find the group by id
    const group = await groupsCollection.findOne({ id: parseInt(currentGroup) });
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Ensure members and admins arrays exist
    if (!Array.isArray(group.members)) group.members = [];
    if (!Array.isArray(group.admins)) group.admins = [];

    // Check if user is a member
    if (!group.members.includes(id)) {
      return res.status(404).json({ success: false, message: "User is not a member of the group" });
    }

    // Check if user is already an admin
    if (group.admins.includes(id)) {
      return res.status(400).json({ success: false, message: "User is already an admin" });
    }

    // Promote user to admin in the group
    group.admins.push(id);
    await groupsCollection.updateOne({ id: parseInt(currentGroup) }, { $set: { admins: group.admins } });

    // Find the user and update their role
    const user = await usersCollection.findOne({ username: id });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in users collection" });
    }

    // Update the user's role to 'admin' (or add it to their roles array)
    const updatedRoles = user.roles ? [...user.roles, 'admin'] : ['admin'];
    await usersCollection.updateOne({ username: id }, { $set: { roles: updatedRoles } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
